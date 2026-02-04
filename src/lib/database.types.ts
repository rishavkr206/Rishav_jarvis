export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant'
          content?: string
          created_at?: string
        }
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          file_type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          file_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          file_type?: string
          created_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          user_id: string
          model_name: string
          temperature: number
          max_tokens: number
          system_prompt: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          model_name?: string
          temperature?: number
          max_tokens?: number
          system_prompt?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          model_name?: string
          temperature?: number
          max_tokens?: number
          system_prompt?: string
          updated_at?: string
        }
      }
    }
  }
}
