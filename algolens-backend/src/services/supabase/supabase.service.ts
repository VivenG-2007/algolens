import { createClient, SupabaseClient } from '@supabase/supabase-js';

class SupabaseService {
  private client: SupabaseClient | null = null;
  private isConfigured = false;

  // In-memory mock store for demo/development when keys aren't added yet
  private mockStore = {
    progress: new Map<string, any[]>(),
    bookmarks: new Map<string, string[]>(),
    attempts: new Map<string, any[]>(),
  };

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      supabaseUrl &&
      serviceKey &&
      !supabaseUrl.includes('your-project-ref') &&
      !serviceKey.includes('your-supabase-service-role-key')
    ) {
      try {
        this.client = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        this.isConfigured = true;
        console.log('[Supabase] Initialized server-side client successfully.');
      } catch (err: any) {
        console.warn('[Supabase] Initialization warning:', err.message);
      }
    } else {
      console.log('[Supabase] Credentials not set. Running with demo local persistence.');
    }
  }

  public isAvailable(): boolean {
    return this.isConfigured;
  }

  public async getProgress(userId: string): Promise<any[]> {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('algorithm_progress')
          .select('*')
          .eq('user_id', userId);
        if (!error && data) return data;
      } catch {}

      // Fallback: Check user_metadata in Supabase auth
      try {
        const { data: userData } = await this.client.auth.admin.getUserById(userId);
        if (userData?.user?.user_metadata?.progress) {
          const progObj = userData.user.user_metadata.progress;
          return Object.entries(progObj).map(([algoId, val]: [string, any]) => ({
            algorithm_id: algoId,
            status: val.status || 'in_progress',
            last_step: val.lastStep || 0,
            updated_at: val.updatedAt || new Date().toISOString(),
          }));
        }
      } catch {}
    }

    return this.mockStore.progress.get(userId) || [
      {
        algorithm_id: 'merge-sort',
        status: 'completed',
        last_step: 33,
        updated_at: new Date().toISOString(),
      },
    ];
  }

  public async saveProgress(
    userId: string,
    algorithmId: string,
    status: 'started' | 'in_progress' | 'completed',
    lastStep: number
  ): Promise<any> {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('algorithm_progress')
          .upsert(
            {
              user_id: userId,
              algorithm_id: algorithmId,
              status,
              last_step: lastStep,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,algorithm_id' }
          )
          .select()
          .single();
        if (!error && data) return data;
      } catch {}

      // Fallback: Save directly into Supabase auth user_metadata
      try {
        const { data: userData } = await this.client.auth.admin.getUserById(userId);
        const currentMeta = userData?.user?.user_metadata || {};
        const currentProg = currentMeta.progress || {};
        currentProg[algorithmId] = { status, lastStep, updatedAt: new Date().toISOString() };
        await this.client.auth.admin.updateUserById(userId, {
          user_metadata: { ...currentMeta, progress: currentProg },
        });
        return { user_id: userId, algorithm_id: algorithmId, status, last_step: lastStep };
      } catch {}
    }

    const userProg = this.mockStore.progress.get(userId) || [];
    const existingIdx = userProg.findIndex((p) => p.algorithm_id === algorithmId);
    const record = {
      user_id: userId,
      algorithm_id: algorithmId,
      status,
      last_step: lastStep,
      updated_at: new Date().toISOString(),
    };
    if (existingIdx >= 0) userProg[existingIdx] = record;
    else userProg.push(record);
    this.mockStore.progress.set(userId, userProg);
    return record;
  }

  public async getBookmarks(userId: string): Promise<string[]> {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('bookmarks')
          .select('algorithm_id')
          .eq('user_id', userId);
        if (!error && data) return data.map((row) => row.algorithm_id);
      } catch {}

      try {
        const { data: userData } = await this.client.auth.admin.getUserById(userId);
        if (userData?.user?.user_metadata?.bookmarks) {
          return userData.user.user_metadata.bookmarks;
        }
      } catch {}
    }
    return this.mockStore.bookmarks.get(userId) || ['binary-search', 'kmp'];
  }

  public async toggleBookmark(userId: string, algorithmId: string): Promise<{ bookmarked: boolean }> {
    if (this.isConfigured && this.client) {
      try {
        const { data: existing } = await this.client
          .from('bookmarks')
          .select('id')
          .eq('user_id', userId)
          .eq('algorithm_id', algorithmId)
          .maybeSingle();

        if (existing) {
          await this.client.from('bookmarks').delete().eq('id', existing.id);
          return { bookmarked: false };
        } else {
          await this.client.from('bookmarks').insert({ user_id: userId, algorithm_id: algorithmId });
          return { bookmarked: true };
        }
      } catch {}

      try {
        const { data: userData } = await this.client.auth.admin.getUserById(userId);
        const currentMeta = userData?.user?.user_metadata || {};
        const bms: string[] = currentMeta.bookmarks || [];
        const idx = bms.indexOf(algorithmId);
        let bookmarked = false;
        if (idx >= 0) {
          bms.splice(idx, 1);
        } else {
          bms.push(algorithmId);
          bookmarked = true;
        }
        await this.client.auth.admin.updateUserById(userId, {
          user_metadata: { ...currentMeta, bookmarks: bms },
        });
        return { bookmarked };
      } catch {}
    }

    const current = this.mockStore.bookmarks.get(userId) || [];
    const idx = current.indexOf(algorithmId);
    let bookmarked = false;
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(algorithmId);
      bookmarked = true;
    }
    this.mockStore.bookmarks.set(userId, current);
    return { bookmarked };
  }

  public async recordPracticeAttempt(attempt: {
    userId: string;
    algorithmId: string;
    questionId: string;
    selectedOption: string;
    isCorrect: boolean;
  }): Promise<any> {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('quiz_attempts')
          .insert({
            user_id: attempt.userId,
            algorithm_id: attempt.algorithmId,
            question_id: attempt.questionId,
            selected_option: attempt.selectedOption,
            is_correct: attempt.isCorrect,
            attempted_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (!error && data) return data;
      } catch {}

      // Save into Supabase auth user_metadata
      try {
        const { data: userData } = await this.client.auth.admin.getUserById(attempt.userId);
        const currentMeta = userData?.user?.user_metadata || {};
        const attemptsList = currentMeta.quiz_attempts || [];
        attemptsList.push({ ...attempt, attempted_at: new Date().toISOString() });
        await this.client.auth.admin.updateUserById(attempt.userId, {
          user_metadata: { ...currentMeta, quiz_attempts: attemptsList },
        });
      } catch {}
    }

    const userAttempts = this.mockStore.attempts.get(attempt.userId) || [];
    userAttempts.push({ ...attempt, attempted_at: new Date().toISOString() });
    this.mockStore.attempts.set(attempt.userId, userAttempts);
    return attempt;
  }

  public async getUserAttempts(userId: string): Promise<any[]> {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client
          .from('quiz_attempts')
          .select('*')
          .eq('user_id', userId)
          .order('attempted_at', { ascending: false });
        if (!error && data) return data;
      } catch (err: any) {
        console.warn('[Supabase] getUserAttempts fallback:', err.message);
      }
    }
    return this.mockStore.attempts.get(userId) || [];
  }

  public async getUserLearningSummary(userId: string): Promise<{
    completedAlgorithms: string[];
    inProgressAlgorithms: string[];
    weakAlgorithms: string[];
    recentErrors: string[];
    masteryPercentage: number;
    progressMap: Record<string, { status: string; lastStep: number }>;
  }> {
    const progressList = await this.getProgress(userId);
    const attempts = await this.getUserAttempts(userId);

    const progressMap: Record<string, { status: string; lastStep: number }> = {};
    const completedAlgorithms: string[] = [];
    const inProgressAlgorithms: string[] = [];

    progressList.forEach((p: any) => {
      progressMap[p.algorithm_id] = { status: p.status, lastStep: p.last_step || 0 };
      if (p.status === 'completed') completedAlgorithms.push(p.algorithm_id);
      else if (p.status === 'in_progress' || p.status === 'started') inProgressAlgorithms.push(p.algorithm_id);
    });

    const errorCounts: Record<string, number> = {};
    const recentErrors: string[] = [];

    attempts.forEach((a: any) => {
      if (!a.is_correct) {
        errorCounts[a.algorithm_id] = (errorCounts[a.algorithm_id] || 0) + 1;
        recentErrors.push(`Failed question ${a.question_id} on ${a.algorithm_id}`);
      }
    });

    const weakAlgorithms = Object.entries(errorCounts)
      .filter(([_, count]) => count >= 1)
      .map(([algo]) => algo);

    const totalAlgorithmsTracked = 13;
    const masteryPercentage = Math.min(
      100,
      Math.round((completedAlgorithms.length / totalAlgorithmsTracked) * 100)
    );

    return {
      completedAlgorithms,
      inProgressAlgorithms,
      weakAlgorithms,
      recentErrors: recentErrors.slice(0, 5),
      masteryPercentage,
      progressMap,
    };
  }

  // ============================================================
  // Supabase Authentication Operations
  // ============================================================
  public async signUp(
    email: string,
    password: string,
    username?: string,
    fullName?: string
  ): Promise<{
    user: { id: string; email: string; username: string; fullName: string };
    token: string;
  }> {
    const cleanUsername = username || email.split('@')[0];
    const cleanFullName = fullName || cleanUsername;

    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            username: cleanUsername,
            full_name: cleanFullName,
          },
        });

        if (error) {
          // If user already registered, sign in directly
          if (error.message.includes('already') || error.status === 422) {
            return this.signIn(email, password);
          }
          throw error;
        }

        const user = data.user;
        return {
          user: {
            id: user.id,
            email: user.email || email,
            username: cleanUsername,
            fullName: cleanFullName,
          },
          token: user.id,
        };
      } catch (err: any) {
        console.warn('[Supabase Auth] admin.createUser failed, using fallback:', err.message);
      }
    }

    // Local / Demo persistence fallback
    const mockId = `user_${Date.now()}`;
    return {
      user: {
        id: mockId,
        email,
        username: cleanUsername,
        fullName: cleanFullName,
      },
      token: mockId,
    };
  }

  public async signIn(
    email: string,
    password: string
  ): Promise<{
    user: { id: string; email: string; username: string; fullName: string };
    token: string;
  }> {
    if (this.isConfigured && this.client) {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      const user = data.user;
      return {
        user: {
          id: user.id,
          email: user.email || email,
          username: user.user_metadata?.username || email.split('@')[0],
          fullName: user.user_metadata?.full_name || user.email || 'Student',
        },
        token: data.session?.access_token || user.id,
      };
    }

    const mockId = `demo_user_${email.split('@')[0]}`;
    return {
      user: {
        id: mockId,
        email,
        username: email.split('@')[0],
        fullName: email.split('@')[0],
      },
      token: mockId,
    };
  }

  public async getUser(token: string): Promise<any> {
    if (this.isConfigured && this.client) {
      try {
        const { data, error } = await this.client.auth.getUser(token);
        if (!error && data?.user) return data.user;
        // Or if token is userId
        const { data: adminUser } = await this.client.auth.admin.getUserById(token);
        if (adminUser?.user) return adminUser.user;
      } catch {
        // Continue
      }
    }
    return {
      id: token,
      email: `${token}@algolens.edu`,
      user_metadata: { username: token },
    };
  }
}

export const supabaseService = new SupabaseService();

