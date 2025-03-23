import { createClient } from '@supabase/supabase-js';

// 環境変数を使用（本番環境では.envファイルで管理）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabaseクライアントを作成
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  // ノート一覧を取得
  async getNotes(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }

    return data || [];
  },

  // 特定のノートを取得
  async getNote(id: string): Promise<Note | null> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching note with id ${id}:`, error);
      throw error;
    }

    return data;
  },

  // 新しいノートを作成
  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([note])
      .select()
      .single();

    if (error) {
      console.error('Error creating note:', error);
      throw error;
    }

    return data;
  },

  // ノートを更新
  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'created_at' | 'updated_at'>>): Promise<Note> {
    // updated_atを現在時刻に更新
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('notes')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating note with id ${id}:`, error);
      throw error;
    }

    return data;
  },

  // ノートを削除
  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting note with id ${id}:`, error);
      throw error;
    }
  }
};