import { createClient } from '@supabase/supabase-js';

// 環境変数を使用（本番環境では.envファイルで管理）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ユーザー情報の型定義
export type UserInfo = {
  id: string;
  email: string;
};

// 認証関連の機能
export const authApi = {
  // 現在のユーザー情報を取得
  async getCurrentUser(): Promise<UserInfo | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
    };
  },

  // サインアップ（新規ユーザー登録）
  async signUp(email: string, password: string): Promise<UserInfo | null> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('Error signing up:', error);
      throw error;
    }

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
      };
    }

    return null;
  },

  // サインイン（ログイン）
  async signIn(email: string, password: string): Promise<UserInfo | null> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      throw error;
    }

    if (data.user) {
      return {
        id: data.user.id,
        email: data.user.email || '',
      };
    }

    return null;
  },

  // サインアウト（ログアウト）
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  },
};

// Notesの型定義
export type Note = {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
};

// CRUD操作のためのヘルパー関数
export const notesApi = {
  // ノート一覧を取得（ユーザーIDによるフィルタリングを追加）
  async getNotes(): Promise<Note[]> {
    // 現在のユーザーを取得
    const user = await authApi.getCurrentUser();

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user?.id) // ユーザーIDでフィルタリング
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    return data || [];
  },

  // 特定のノートを取得（ユーザーIDによる保護を追加）
  async getNote(id: string): Promise<Note | null> {
    // 現在のユーザーを取得
    const user = await authApi.getCurrentUser();

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id) // ユーザーIDでフィルタリング
      .single();

    if (error) {
      console.error(`Error fetching note with id ${id}:`, error);
      throw error;
    }

    return data;
  },

  // 新しいノートを作成（ユーザーIDを自動で追加）
  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Note> {
    // 現在のユーザーを取得
    const user = await authApi.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const noteWithUserId = {
      ...note,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([noteWithUserId])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return data;
  },

  // ノートを更新（ユーザーIDによる保護を追加）
  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<Note> {
    // 現在のユーザーを取得
    const user = await authApi.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    // updated_atを現在時刻に更新
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notes')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .eq('user_id', user.id) // ユーザーIDでフィルタリング
      .select()
      .single();

    if (error) {
      console.error(`Error updating note with id ${id}:`, error);
      throw error;
    }

    return data;
  },

  // ノートを削除（ユーザーIDによる保護を追加）
  async deleteNote(id: string): Promise<void> {
    // 現在のユーザーを取得
    const user = await authApi.getCurrentUser();
    if (!user) {
      throw new Error('ユーザーがログインしていません');
    }

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // ユーザーIDでフィルタリング

    if (error) {
      console.error(`Error deleting note with id ${id}:`, error);
      throw error;
    }
  }
};