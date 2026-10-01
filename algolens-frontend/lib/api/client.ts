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
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public setAuthToken(token: string | null) {
    this.authToken = token;
  }

  public getAuthToken(): string | null {
    return this.authToken;
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
    if (this.authToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
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

  // Progress (Isolated per user)
  public async getProgress(userId?: string): Promise<any[]> {
    const q = userId ? `?userId=${userId}` : '';
    const res = await this.request<{ success: boolean; data: any[] }>(
      `/api/progress/progress${q}`
    );
    return res.data;
  }

  public async saveProgress(
    algorithmId: string,
    status: 'started' | 'in_progress' | 'completed',
    lastStep: number,
    userId?: string
  ): Promise<any> {
    return this.request('/api/progress/progress', {
      method: 'POST',
      body: JSON.stringify({ userId, algorithmId, status, lastStep }),
    });
  }

  // Bookmarks
  public async getBookmarks(userId?: string): Promise<string[]> {
    const q = userId ? `?userId=${userId}` : '';
    const res = await this.request<{ success: boolean; data: string[] }>(
      `/api/progress/bookmarks${q}`
    );
    return res.data;
  }

  public async toggleBookmark(
    algorithmId: string,
    userId?: string
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

  // Practice (Filtered by custom user skill level)
  public async getPracticeQuestions(algorithmId?: string, level?: string): Promise<QuizQuestion[]> {
    const params = new URLSearchParams();
    if (algorithmId && algorithmId !== 'all') params.append('algorithmId', algorithmId);
    if (level && level !== 'All') params.append('level', level);
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await this.request<{ success: boolean; data: QuizQuestion[]; userLevel?: string }>(
      `/api/practice/questions${qs}`
    );
    return res.data;
  }

  public async getPersonalizedPracticeQuestion(
    userId: string,
    algorithmId?: string,
    level?: string
  ): Promise<{
    question: any;
    studentContext: { skillLevel: string; weakAlgorithms: string[]; masteryPercentage: number };
  }> {
    const res = await this.request<{
      success: boolean;
      data: any;
      studentContext: { skillLevel: string; weakAlgorithms: string[]; masteryPercentage: number };
    }>('/api/practice/personalized', {
      method: 'POST',
      body: JSON.stringify({ userId, algorithmId, level }),
    });
    return { question: res.data, studentContext: res.studentContext };
  }

  public async submitPracticeAttempt(
    questionId: string,
    selectedOption: string,
    userId: string,
    extra?: {
      algorithmId?: string;
      questionLevel?: string;
      isCorrectOverride?: boolean;
      explanationOverride?: string;
    }
  ): Promise<{ isCorrect: boolean; explanation: string; correctOptionId?: string; questionLevel?: string }> {
    const res = await this.request<{
      success: boolean;
      data: { isCorrect: boolean; explanation: string; correctOptionId?: string; questionLevel?: string };
    }>('/api/practice/attempt', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        questionId,
        selectedOption,
        algorithmId: extra?.algorithmId,
        questionLevel: extra?.questionLevel,
        isCorrectOverride: extra?.isCorrectOverride,
        explanationOverride: extra?.explanationOverride,
      }),
    });
    return res.data;
  }

  // Knowledge Graph (Custom per user)
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

  // Auth & Multi-User Profile
  public async login(email: string, password: string): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res.data;
  }

  public async register(
    email: string,
    password: string,
    username?: string,
    fullName?: string,
    skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner'
  ): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, username, fullName, skillLevel }),
    });
    if (res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res.data;
  }

  public async loginDemo(role = 'intermediate'): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    if (res.data?.token) {
      this.setAuthToken(res.data.token);
    }
    return res.data;
  }

  public async updateSkillLevel(skillLevel: 'Beginner' | 'Intermediate' | 'Advanced'): Promise<any> {
    const res = await this.request<{ success: boolean; data: any }>('/api/auth/skill-level', {
      method: 'PUT',
      body: JSON.stringify({ skillLevel }),
    });
    return res.data;
  }

  public async getUserSummary(userId?: string): Promise<any> {
    const q = userId ? `?userId=${userId}` : '';
    const res = await this.request<{ success: boolean; data: any }>(
      `/api/auth/summary${q}`
    );
    return res.data;
  }

  // Custom User Analytics & Radar Data
  public async getAnalytics(userId?: string): Promise<any> {
    const q = userId ? `?userId=${userId}` : '';
    const res = await this.request<{ success: boolean; data: any }>(
      `/api/auth/analytics${q}`
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
