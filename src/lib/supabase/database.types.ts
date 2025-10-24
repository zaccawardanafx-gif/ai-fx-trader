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
          username: string | null
          email: string | null
          risk_per_trade: number | null
          pip_target_min: number | null
          pip_target_max: number | null
          breakeven_trigger: number | null
          technical_weight: number | null
          sentiment_weight: number | null
          macro_weight: number | null
          alert_frequency: string | null
          notify_email: boolean | null
          notify_whatsapp: boolean | null
          is_admin: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          email?: string | null
          risk_per_trade?: number | null
          pip_target_min?: number | null
          pip_target_max?: number | null
          breakeven_trigger?: number | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          alert_frequency?: string | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          is_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          risk_per_trade?: number | null
          pip_target_min?: number | null
          pip_target_max?: number | null
          breakeven_trigger?: number | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          alert_frequency?: string | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          is_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_prompts: {
        Row: {
          id: string
          user_id: string | null
          version: number | null
          title: string | null
          prompt_text: string
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          version?: number | null
          title?: string | null
          prompt_text: string
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          version?: number | null
          title?: string | null
          prompt_text?: string
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      market_data: {
        Row: {
          id: number
          timestamp: string
          pair: string | null
          price: number
          high: number | null
          low: number | null
          open: number | null
          close: number | null
          volume: number | null
          source: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          timestamp: string
          pair?: string | null
          price: number
          high?: number | null
          low?: number | null
          open?: number | null
          close?: number | null
          volume?: number | null
          source?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          timestamp?: string
          pair?: string | null
          price?: number
          high?: number | null
          low?: number | null
          open?: number | null
          close?: number | null
          volume?: number | null
          source?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      technical_indicators: {
        Row: {
          id: number
          timestamp: string
          pair: string | null
          rsi: number | null
          macd: number | null
          macd_signal: number | null
          macd_histogram: number | null
          sma50: number | null
          sma200: number | null
          atr: number | null
          created_at: string | null
        }
        Insert: {
          id?: number
          timestamp: string
          pair?: string | null
          rsi?: number | null
          macd?: number | null
          macd_signal?: number | null
          macd_histogram?: number | null
          sma50?: number | null
          sma200?: number | null
          atr?: number | null
          created_at?: string | null
        }
        Update: {
          id?: number
          timestamp?: string
          pair?: string | null
          rsi?: number | null
          macd?: number | null
          macd_signal?: number | null
          macd_histogram?: number | null
          sma50?: number | null
          sma200?: number | null
          atr?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      sentiment_macro: {
        Row: {
          id: number
          timestamp: string
          sentiment_score: number | null
          macro_event: string | null
          impact: string | null
          source: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          timestamp: string
          sentiment_score?: number | null
          macro_event?: string | null
          impact?: string | null
          source?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          timestamp?: string
          sentiment_score?: number | null
          macro_event?: string | null
          impact?: string | null
          source?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      trade_ideas: {
        Row: {
          id: string
          user_id: string | null
          prompt_version: number | null
          entry: number
          stop_loss: number
          take_profit: number
          expiry: string | null
          rationale: string | null
          technical_weight: number | null
          sentiment_weight: number | null
          macro_weight: number | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          prompt_version?: number | null
          entry: number
          stop_loss: number
          take_profit: number
          expiry?: string | null
          rationale?: string | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          prompt_version?: number | null
          entry?: number
          stop_loss?: number
          take_profit?: number
          expiry?: string | null
          rationale?: string | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trade_ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
