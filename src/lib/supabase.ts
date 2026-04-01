import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 헬퍼
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          gender: '남' | '여' | '기타' | null
          birth_date: string | null
          major: string
          grade: number | null
          student_id: string
          status: '재학생' | '졸업생'
          role: 'member' | 'admin' | 'superadmin'
          age: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables<'profiles'>, 'age' | 'created_at' | 'updated_at'>
        Update: Partial<Tables<'profiles'>>
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string | null
          thumbnail_url: string | null
          media_urls: string[]
          tags: string[]
          tools_used: string[]
          is_public: boolean
          view_count: number
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables<'portfolios'>, 'id' | 'view_count' | 'like_count' | 'created_at' | 'updated_at'>
        Update: Partial<Tables<'portfolios'>>
      }
      studies: {
        Row: {
          id: string
          created_by: string
          title: string
          description: string | null
          category: string | null
          max_members: number
          current_count: number
          schedule: string | null
          location: string | null
          duration: string | null
          start_date: string | null
          end_date: string | null
          apply_deadline: string | null
          status: 'open' | 'closed' | 'ongoing' | 'ended'
          thumbnail_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Tables<'studies'>, 'id' | 'current_count' | 'created_at' | 'updated_at'>
        Update: Partial<Tables<'studies'>>
      }
      study_applicants: {
        Row: {
          id: string
          study_id: string
          user_id: string
          motivation: string | null
          status: 'pending' | 'approved' | 'rejected'
          applied_at: string
        }
        Insert: Omit<Tables<'study_applicants'>, 'id' | 'applied_at'>
        Update: Partial<Tables<'study_applicants'>>
      }
      site_settings: {
        Row: {
          key: string
          value: Record<string, unknown>
          updated_by: string | null
          updated_at: string
        }
        Insert: Omit<Tables<'site_settings'>, 'updated_at'>
        Update: Partial<Tables<'site_settings'>>
      }
    }
  }
}
