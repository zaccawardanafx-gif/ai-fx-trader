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
          weekly_pip_target_min: number | null
          weekly_pip_target_max: number | null
          max_risk_pips_per_trade: number | null
          weekly_trade_limit: number | null
          pip_target_per_rotation: number | null
          breakeven_trigger_pips: number | null
          trading_volume_chf: number | null
          leverage_enabled: boolean | null
          max_leverage: number | null
          selected_currency_pair: string | null
          technical_weight: number | null
          sentiment_weight: number | null
          macro_weight: number | null
          alert_frequency: string | null
          notify_email: boolean | null
          notify_whatsapp: boolean | null
          is_admin: boolean | null
          auto_generation_enabled: boolean | null
          auto_generation_interval: string | null
          auto_generation_time: string | null
          auto_generation_timezone: string | null
          auto_generation_paused: boolean | null
          last_auto_generation: string | null
          next_auto_generation: string | null
          auto_generation_retry_count: number | null
          auto_generation_last_error: string | null
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
          weekly_pip_target_min?: number | null
          weekly_pip_target_max?: number | null
          max_risk_pips_per_trade?: number | null
          weekly_trade_limit?: number | null
          pip_target_per_rotation?: number | null
          breakeven_trigger_pips?: number | null
          trading_volume_chf?: number | null
          leverage_enabled?: boolean | null
          max_leverage?: number | null
          selected_currency_pair?: string | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          alert_frequency?: string | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          is_admin?: boolean | null
          auto_generation_enabled?: boolean | null
          auto_generation_interval?: string | null
          auto_generation_time?: string | null
          auto_generation_timezone?: string | null
          auto_generation_paused?: boolean | null
          last_auto_generation?: string | null
          next_auto_generation?: string | null
          auto_generation_retry_count?: number | null
          auto_generation_last_error?: string | null
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
          weekly_pip_target_min?: number | null
          weekly_pip_target_max?: number | null
          max_risk_pips_per_trade?: number | null
          weekly_trade_limit?: number | null
          pip_target_per_rotation?: number | null
          breakeven_trigger_pips?: number | null
          trading_volume_chf?: number | null
          leverage_enabled?: boolean | null
          max_leverage?: number | null
          selected_currency_pair?: string | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          alert_frequency?: string | null
          notify_email?: boolean | null
          notify_whatsapp?: boolean | null
          is_admin?: boolean | null
          auto_generation_enabled?: boolean | null
          auto_generation_interval?: string | null
          auto_generation_time?: string | null
          auto_generation_timezone?: string | null
          auto_generation_paused?: boolean | null
          last_auto_generation?: string | null
          next_auto_generation?: string | null
          auto_generation_retry_count?: number | null
          auto_generation_last_error?: string | null
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
          currency_pair: string | null
          direction: string
          entry: number
          stop_loss: number
          take_profit: number
          pip_target: number | null
          expiry: string | null
          rationale: string | null
          rationale_fr: string | null
          technical_score: number | null
          sentiment_score: number | null
          macro_score: number | null
          confidence: number | null
          technical_weight: number | null
          sentiment_weight: number | null
          macro_weight: number | null
          status: string | null
          spot_price_at_generation: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          prompt_version?: number | null
          currency_pair?: string | null
          direction: string
          entry: number
          stop_loss: number
          take_profit: number
          pip_target?: number | null
          expiry?: string | null
          rationale?: string | null
          rationale_fr?: string | null
          technical_score?: number | null
          sentiment_score?: number | null
          macro_score?: number | null
          confidence?: number | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          status?: string | null
          spot_price_at_generation?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          prompt_version?: number | null
          currency_pair?: string | null
          direction?: string
          entry?: number
          stop_loss?: number
          take_profit?: number
          pip_target?: number | null
          expiry?: string | null
          rationale?: string | null
          rationale_fr?: string | null
          technical_score?: number | null
          sentiment_score?: number | null
          macro_score?: number | null
          confidence?: number | null
          technical_weight?: number | null
          sentiment_weight?: number | null
          macro_weight?: number | null
          status?: string | null
          spot_price_at_generation?: number | null
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
      auto_generation_schedule: {
        Row: {
          id: string
          user_id: string | null
          interval_type: string
          scheduled_time: string | null
          timezone: string | null
          is_active: boolean | null
          is_paused: boolean | null
          last_triggered: string | null
          next_trigger: string
          retry_count: number | null
          last_error: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          interval_type: string
          scheduled_time?: string | null
          timezone?: string | null
          is_active?: boolean | null
          is_paused?: boolean | null
          last_triggered?: string | null
          next_trigger: string
          retry_count?: number | null
          last_error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          interval_type?: string
          scheduled_time?: string | null
          timezone?: string | null
          is_active?: boolean | null
          is_paused?: boolean | null
          last_triggered?: string | null
          next_trigger?: string
          retry_count?: number | null
          last_error?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_generation_schedule_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string | null
          type: string
          title: string
          message: string
          is_read: boolean | null
          email_sent: boolean | null
          push_sent: boolean | null
          metadata: Record<string, unknown> | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          type: string
          title: string
          message: string
          is_read?: boolean | null
          email_sent?: boolean | null
          push_sent?: boolean | null
          metadata?: Record<string, unknown> | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string
          title?: string
          message?: string
          is_read?: boolean | null
          email_sent?: boolean | null
          push_sent?: boolean | null
          metadata?: Record<string, unknown> | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
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
      update_next_generation_time: {
        Args: {
          p_user_id: string
        }
        Returns: string | null
      }
      calculate_next_generation_time: {
        Args: {
          p_interval_type: string
          p_scheduled_time?: string | null
          p_timezone?: string
          p_current_time?: string
        }
        Returns: string
      }
      create_auto_generation_schedule: {
        Args: {
          p_user_id: string
          p_interval_type: string
          p_scheduled_time?: string | null
          p_timezone?: string
        }
        Returns: string
      }
      toggle_auto_generation_pause: {
        Args: {
          p_user_id: string
          p_paused: boolean
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
