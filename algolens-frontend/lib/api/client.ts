import {
  AlgorithmId,
  AlgorithmMetadata,
  ExecutionResult,
  QuizQuestion,
  KnowledgeGraphData,
} from '@/types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message =
          errorData?.error?.message ||
          `Request failed with status ${response.status} (${response.statusText})`;
        const error = new Error(message);
        (error as any).status = response.status;
        (error as any).code = errorData?.error?.code;
        throw error;
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(
          'AlgoLens backend engine is waking up or temporarily unreachable. Please retry in a few moments.'
        );
      }
      throw err;
    }
  }

  // Health
  public async getHealth(): Promise<{ status: string; service: string }> {
    return this.request<{ status: string; service: string }>('/api/health');
  }

  // Algorithm Directory
  public async getAlgorithms(): Promise<AlgorithmMetadata[]> {
    const res = await this.request<{ success: boolean; data: AlgorithmMetadata[] }>(
      '/api/algorithms'
    );
    return res.data;
  }

  public async getAlgorithm(id: string): Promise<AlgorithmMetadata> {
    const res = await this.request<{ success: boolean; data: AlgorithmMetadata }>(
      `/api/algorithms/${id}`
    );
    return res.data;
  }

  // Dynamic Execution
  public async executeAlgorithm(
    algorithm: AlgorithmId,
    payload: {
      input?: number[];
      target?: number;
      text?: string;
      pattern?: string;
      values?: number[];
    }
  ): Promise<ExecutionResult> {
    return this.request<ExecutionResult>(`/api/algorithms/${algorithm}/execute`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // AI Tutor
  public async explainStep(payload: {
    algorithm: string;
    currentStep: any;
    previousStep?: any;
    nextStep?: any;
    code?: string;
    pseudocode?: string;
    question?: string;
  }): Promise<{ explanation: string; source: string }> {
    const res = await this.request<{
      success: boolean;
      explanation: string;
      source: string;
    }>('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { explanation: res.explanation, source: res.source };
  }

  // Progress
  public async getProgress(userId = 'student_demo_user'): Promise<any[]> {
    const res = await this.request<{ success: boolean; data: any[] }>(
      `/api/progress/progress?userId=${userId}`
    );
    return res.data;
  }

  public async saveProgress(
    algorithmId: string,
    status: 'started' | 'in_progress' | 'completed',
    lastStep: number,
    userId = 'student_demo_user'
  ): Promise<any> {
    return this.request('/api/progress/progress', {
      method: 'POST',
      body: JSON.stringify({ userId, algorithmId, status, lastStep }),
    });
  }

  // Bookmarks
  public async getBookmarks(userId = 'student_demo_user'): Promise<string[]> {
    const res = await this.request<{ success: boolean; data: string[] }>(
      `/api/progress/bookmarks?userId=${userId}`
    );
    return res.data;
  }

  public async toggleBookmark(
    algorithmId: string,
    userId = 'student_demo_user'
  ): Promise<{ bookmarked: boolean }> {
    const res = await this.request<{ success: boolean; data: { bookmarked: boolean } }>(
      '/api/progress/bookmarks',
      {
        method: 'POST',
        body: JSON.stringify({ userId, algorithmId }),
      }
    );
    return res.data;
  }

  // Practice
  public async getPracticeQuestions(algorithmId?: string): Promise<QuizQuestion[]> {
    const endpoint = algorithmId
      ? `/api/practice/questions?algorithmId=${algorithmId}`
      : '/api/practice/questions';
    const res = await this.request<{ success: boolean; data: QuizQuestion[] }>(endpoint);
    return res.data;
  }

  public async getPersonalizedPracticeQuestion(
    userId: string,
    algorithmId?: string
  ): Promise<{
    question: any;
    studentContext: { weakAlgorithms: string[]; masteryPercentage: number };
  }> {
    const res = await this.request<{
      success: boolean;
      data: any;
      studentContext: { weakAlgorithms: string[]; masteryPercentage: number };
    }>('/api/practice/personalized', {
      method: 'POST',
      body: JSON.stringify({ userId, algorithmId }),
    });
    return { question: res.data, studentContext: res.studentContext };
  }

  public async submitPracticeAttempt(
    questionId: string,
    selectedOption: string,
    userId = 'student_demo_user',
    extra?: {
      algorithmId?: string;
      isCorrectOverride?: boolean;
      explanationOverride?: string;
    }
  ): Promise<{ isCorrect: boolean; explanation: string; correctOptionId?: string }> {
    const res = await this.request<{
      success: boolean;
      data: { isCorrect: boolean; explanation: string; correctOptionId?: string };
    }>('/api/practice/attempt', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        questionId,
        selectedOption,
        algorithmId: extra?.algorithmId,
        isCorrectOverride: extra?.isCorrectOverride,
        explanationOverride: extra?.explanationOverride,
      }),
    });
    return res.data;
  }

  // Knowledge Graph
  public async getKnowledgeGraph(userId?: string): Promise<KnowledgeGraphData & {
    personalized?: boolean;
    userSummary?: any;
    recommendations?: any;
  }> {
    const endpoint = userId ? `/api/knowledge/graph?userId=${userId}` : '/api/knowledge/graph';
    const res = await this.request<{
      success: boolean;
      data: any;
      personalized?: boolean;
    }>(endpoint);

    if (res.data?.nodes && res.data?.links) {
      return {
        ...res.data,
        personalized: res.personalized,
      };
    }
    return res.data;
  }

  // Auth & User Profile (Supabase)
  public async login(email: string, password: string): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return res.data;
  }

  public async register(
    email: string,
    password: string,
    username?: string,
    fullName?: string
  ): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, fullName }),
    });
    return res.data;
  }

  public async loginDemo(): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/auth/demo', {
      method: 'POST',
    });
    return res.data;
  }

  public async getUserSummary(userId: string): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>(
      `/api/auth/summary?userId=${userId}`
    );
    return res.data;
  }

  // Complexity
  public async getComplexityData(): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/complexity');
    return res.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
