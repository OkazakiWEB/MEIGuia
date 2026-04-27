// ============================================================
// Tipos gerados automaticamente pelo Supabase MCP
// Projeto: asdmlttsyoyfdrpudjwo — Portal MEIguia
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      contador_tokens: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          label: string | null
          last_accessed_at: string | null
          revoked: boolean
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          last_accessed_at?: string | null
          revoked?: boolean
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          label?: string | null
          last_accessed_at?: string | null
          revoked?: boolean
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contador_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_anual: {
        Row: {
          ano: number
          created_at: string | null
          id: string
          qtd_notas: number
          total: number
          user_id: string
        }
        Insert: {
          ano: number
          created_at?: string | null
          id?: string
          qtd_notas?: number
          total?: number
          user_id: string
        }
        Update: {
          ano?: number
          created_at?: string | null
          id?: string
          qtd_notas?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_anual_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_fiscais: {
        Row: {
          cliente: string | null
          created_at: string | null
          data: string
          descricao: string | null
          id: string
          numero_nf: string | null
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          cliente?: string | null
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          numero_nf?: string | null
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          cliente?: string | null
          created_at?: string | null
          data?: string
          descricao?: string | null
          id?: string
          numero_nf?: string | null
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_fiscais_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ano_referencia: number
          avatar_url: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          inactivity_email_sent_at: string | null
          last_alert_sent: string | null
          last_alert_year: number | null
          onboarding_completed: boolean
          plano: string
          pro_expires_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
          welcome_email_sent: boolean | null
        }
        Insert: {
          ano_referencia?: number
          avatar_url?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          inactivity_email_sent_at?: string | null
          last_alert_sent?: string | null
          last_alert_year?: number | null
          onboarding_completed?: boolean
          plano?: string
          pro_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          welcome_email_sent?: boolean | null
        }
        Update: {
          ano_referencia?: number
          avatar_url?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          inactivity_email_sent_at?: string | null
          last_alert_sent?: string | null
          last_alert_year?: number | null
          onboarding_completed?: boolean
          plano?: string
          pro_expires_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
          welcome_email_sent?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_faturamento_anual: {
        Args: { p_ano?: number; p_user_id: string }
        Returns: number
      }
      get_notas_mes_atual: { Args: { p_user_id: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

// Atalhos de tipos comuns
export type NotaFiscal      = Tables<"notas_fiscais">;
export type Profile         = Tables<"profiles">;
export type ContadorToken   = Tables<"contador_tokens">;

// Tipo manual para das_pagamentos (adicionado via migration)
export type DasPagamento = {
  id: string;
  user_id: string;
  competencia: string;   // "2025-05-01"
  vencimento: string;    // "2025-05-20"
  status: "pendente" | "pago" | "atrasado";
  pago_em: string | null;
  comprovante_url: string | null;
  created_at: string;
  updated_at: string;
};
