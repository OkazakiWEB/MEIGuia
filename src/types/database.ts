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
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
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
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          last_alert_sent: string | null
          last_alert_year: number | null
          onboarding_completed: boolean
          plano: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          ano_referencia?: number
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          last_alert_sent?: string | null
          last_alert_year?: number | null
          onboarding_completed?: boolean
          plano?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          ano_referencia?: number
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          last_alert_sent?: string | null
          last_alert_year?: number | null
          onboarding_completed?: boolean
          plano?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string | null
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

// ── Aliases de conveniência usados em todo o projeto ─────────────────────────
export type Profile        = Database["public"]["Tables"]["profiles"]["Row"]
export type NotaFiscal     = Database["public"]["Tables"]["notas_fiscais"]["Row"]
export type HistoricoAnual = Database["public"]["Tables"]["historico_anual"]["Row"]
