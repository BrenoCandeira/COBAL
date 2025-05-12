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
      profiles: {
        Row: {
          id: string
          nome_completo: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome_completo: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_completo?: string
          created_at?: string
          updated_at?: string
        }
      }
      entregas: {
        Row: {
          id: string
          nome_preso: string
          prontuario: string
          ala: string
          cela: string
          data_entrega: string
          itens: Json
          observacoes: string | null
          servidor_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_preso: string
          prontuario: string
          ala: string
          cela: string
          data_entrega: string
          itens: Json
          observacoes?: string | null
          servidor_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_preso?: string
          prontuario?: string
          ala?: string
          cela?: string
          data_entrega?: string
          itens?: Json
          observacoes?: string | null
          servidor_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}