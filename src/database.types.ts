export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      debug_logs: {
        Row: {
          id: number
          message: string | null
          timestamp: string | null
        }
        Insert: {
          id?: number
          message?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: number
          message?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      game_messages: {
        Row: {
          correlation_id: string
          created_at: string
          message: Json
          source: string
        }
        Insert: {
          correlation_id: string
          created_at?: string
          message: Json
          source: string
        }
        Update: {
          correlation_id?: string
          created_at?: string
          message?: Json
          source?: string
        }
        Relationships: []
      }
      game_responses: {
        Row: {
          correlation_id: string
          created_at: string
          response: Json
        }
        Insert: {
          correlation_id: string
          created_at?: string
          response: Json
        }
        Update: {
          correlation_id?: string
          created_at?: string
          response?: Json
        }
        Relationships: []
      }
      spectre_crew: {
        Row: {
          competition_count: number
          created_at: string
          created_date: string | null
          division_id: string | null
          first_place_count: number | null
          home_turf: string | null
          id: string
          last_place_count: number | null
          league_champion_count: number | null
          name: string
          promotions_count: number
          record_score: number | null
          relegations_count: number
          spotlight_duration_time_minutes: number
          spotlight_start_hour: number
          status: string | null
          total_score: number
          updated_at: string | null
          updated_date: string | null
        }
        Insert: {
          competition_count?: number
          created_at?: string
          created_date?: string | null
          division_id?: string | null
          first_place_count?: number | null
          home_turf?: string | null
          id: string
          last_place_count?: number | null
          league_champion_count?: number | null
          name?: string
          promotions_count?: number
          record_score?: number | null
          relegations_count?: number
          spotlight_duration_time_minutes?: number
          spotlight_start_hour?: number
          status?: string | null
          total_score?: number
          updated_at?: string | null
          updated_date?: string | null
        }
        Update: {
          competition_count?: number
          created_at?: string
          created_date?: string | null
          division_id?: string | null
          first_place_count?: number | null
          home_turf?: string | null
          id?: string
          last_place_count?: number | null
          league_champion_count?: number | null
          name?: string
          promotions_count?: number
          record_score?: number | null
          relegations_count?: number
          spotlight_duration_time_minutes?: number
          spotlight_start_hour?: number
          status?: string | null
          total_score?: number
          updated_at?: string | null
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_crew_division_id_fkey"
            columns: ["division_id"]
            isOneToOne: false
            referencedRelation: "spectre_division"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_division: {
        Row: {
          created_at: string
          id: string
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          name: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      spectre_match: {
        Row: {
          created_at: string
          id: string
          is_abandoned_match: boolean
          is_ranked: boolean
          match_date: string | null
          queue_game_map: string | null
          queue_game_mode: string | null
          queue_name: string | null
          raw_match_data: Json
          region: string | null
          surrendered_team: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          is_abandoned_match?: boolean
          is_ranked?: boolean
          match_date?: string | null
          queue_game_map?: string | null
          queue_game_mode?: string | null
          queue_name?: string | null
          raw_match_data: Json
          region?: string | null
          surrendered_team?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_abandoned_match?: boolean
          is_ranked?: boolean
          match_date?: string | null
          queue_game_map?: string | null
          queue_game_mode?: string | null
          queue_name?: string | null
          raw_match_data?: Json
          region?: string | null
          surrendered_team?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spectre_match_player: {
        Row: {
          created_at: string
          crew: string | null
          crew_score: number
          current_rank_id: number
          current_ranked_rating: number
          division: string | null
          id: number
          is_anonymous_player: boolean
          num_assists: number
          num_deaths: number
          num_kills: number
          num_ranked_matches: number
          player: string
          previous_rank_id: number
          previous_ranked_rating: number
          saved_player_name: string
          saved_sponsor_name: string
          selected_banner_catalog_id: string
          selected_sponsor: string
          team: string
          teammate_index: number
          total_damage_done: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          crew?: string | null
          crew_score?: number
          current_rank_id?: number
          current_ranked_rating?: number
          division?: string | null
          id?: number
          is_anonymous_player?: boolean
          num_assists?: number
          num_deaths?: number
          num_kills?: number
          num_ranked_matches?: number
          player: string
          previous_rank_id?: number
          previous_ranked_rating?: number
          saved_player_name?: string
          saved_sponsor_name?: string
          selected_banner_catalog_id?: string
          selected_sponsor?: string
          team: string
          teammate_index?: number
          total_damage_done?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          crew?: string | null
          crew_score?: number
          current_rank_id?: number
          current_ranked_rating?: number
          division?: string | null
          id?: number
          is_anonymous_player?: boolean
          num_assists?: number
          num_deaths?: number
          num_kills?: number
          num_ranked_matches?: number
          player?: string
          previous_rank_id?: number
          previous_ranked_rating?: number
          saved_player_name?: string
          saved_sponsor_name?: string
          selected_banner_catalog_id?: string
          selected_sponsor?: string
          team?: string
          teammate_index?: number
          total_damage_done?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_match_player_crew_fkey"
            columns: ["crew"]
            isOneToOne: false
            referencedRelation: "spectre_crew"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectre_match_player_division_fkey"
            columns: ["division"]
            isOneToOne: false
            referencedRelation: "spectre_division"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectre_match_player_player_fkey"
            columns: ["player"]
            isOneToOne: false
            referencedRelation: "spectre_player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectre_match_player_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "spectre_match_team"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_match_team: {
        Row: {
          created_at: string
          current_rank_id: number | null
          current_ranked_rating: number | null
          fans_per_round: number | null
          fans_per_round_won: number | null
          id: string
          is_full_team_in_party: boolean
          match: string
          num_ranked_matches: number | null
          previous_rank_id: number | null
          previous_ranked_rating: number | null
          ranked_rating_delta: number | null
          rounds_played: number
          rounds_won: number
          team: string | null
          team_index: number
          updated_at: string | null
          used_team_rank: boolean
          xp_per_round: number
          xp_per_round_won: number
        }
        Insert: {
          created_at?: string
          current_rank_id?: number | null
          current_ranked_rating?: number | null
          fans_per_round?: number | null
          fans_per_round_won?: number | null
          id?: string
          is_full_team_in_party?: boolean
          match: string
          num_ranked_matches?: number | null
          previous_rank_id?: number | null
          previous_ranked_rating?: number | null
          ranked_rating_delta?: number | null
          rounds_played?: number
          rounds_won?: number
          team?: string | null
          team_index: number
          updated_at?: string | null
          used_team_rank?: boolean
          xp_per_round?: number
          xp_per_round_won?: number
        }
        Update: {
          created_at?: string
          current_rank_id?: number | null
          current_ranked_rating?: number | null
          fans_per_round?: number | null
          fans_per_round_won?: number | null
          id?: string
          is_full_team_in_party?: boolean
          match?: string
          num_ranked_matches?: number | null
          previous_rank_id?: number | null
          previous_ranked_rating?: number | null
          ranked_rating_delta?: number | null
          rounds_played?: number
          rounds_won?: number
          team?: string | null
          team_index?: number
          updated_at?: string | null
          used_team_rank?: boolean
          xp_per_round?: number
          xp_per_round_won?: number
        }
        Relationships: [
          {
            foreignKeyName: "spectre_match_team_match_fkey"
            columns: ["match"]
            isOneToOne: false
            referencedRelation: "spectre_match"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectre_match_team_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "spectre_team"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_player: {
        Row: {
          created_at: string
          crew_id: string | null
          discriminator: string
          display_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          crew_id?: string | null
          discriminator?: string
          display_name?: string
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          crew_id?: string | null
          discriminator?: string
          display_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_player_crew_id_fkey"
            columns: ["crew_id"]
            isOneToOne: false
            referencedRelation: "spectre_crew"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_player_account: {
        Row: {
          account_id: string
          created_at: string
          display_name: string
          id: string
          player: string
          provider_type: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          display_name?: string
          id?: string
          player: string
          provider_type: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          display_name?: string
          id?: string
          player?: string
          provider_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_player_account_player_fkey"
            columns: ["player"]
            isOneToOne: false
            referencedRelation: "spectre_player"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_player_banner: {
        Row: {
          alteration_data: Json | null
          attachment_item_catalog_id: string | null
          attachment_item_instance_id: string | null
          created_at: string
          item_catalog_id: string | null
          item_instance_id: string
          item_type: string
          player: string
          updated_at: string | null
        }
        Insert: {
          alteration_data?: Json | null
          attachment_item_catalog_id?: string | null
          attachment_item_instance_id?: string | null
          created_at?: string
          item_catalog_id?: string | null
          item_instance_id: string
          item_type?: string
          player: string
          updated_at?: string | null
        }
        Update: {
          alteration_data?: Json | null
          attachment_item_catalog_id?: string | null
          attachment_item_instance_id?: string | null
          created_at?: string
          item_catalog_id?: string | null
          item_instance_id?: string
          item_type?: string
          player?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_player_banner_player_fkey"
            columns: ["player"]
            isOneToOne: true
            referencedRelation: "spectre_player"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_player_stats: {
        Row: {
          created_at: string
          current_solo_rank: number
          highest_team_rank: number
          last_updated_rank_rating: string | null
          player: string
          rank_rating: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          current_solo_rank?: number
          highest_team_rank?: number
          last_updated_rank_rating?: string | null
          player: string
          rank_rating?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          current_solo_rank?: number
          highest_team_rank?: number
          last_updated_rank_rating?: string | null
          player?: string
          rank_rating?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_player_stats_player_fkey"
            columns: ["player"]
            isOneToOne: true
            referencedRelation: "spectre_player"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_team: {
        Row: {
          created_at: string
          created_date: string | null
          id: string
          last_played: string | null
          team_data: Json | null
          team_name: string
          team_size: number
          updated_at: string | null
          updated_date: string | null
        }
        Insert: {
          created_at?: string
          created_date?: string | null
          id: string
          last_played?: string | null
          team_data?: Json | null
          team_name?: string
          team_size?: number
          updated_at?: string | null
          updated_date?: string | null
        }
        Update: {
          created_at?: string
          created_date?: string | null
          id?: string
          last_played?: string | null
          team_data?: Json | null
          team_name?: string
          team_size?: number
          updated_at?: string | null
          updated_date?: string | null
        }
        Relationships: []
      }
      spectre_team_member: {
        Row: {
          created_at: string
          id: string
          player: string
          team: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          player: string
          team: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          player?: string
          team?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_team_member_player_fkey"
            columns: ["player"]
            isOneToOne: false
            referencedRelation: "spectre_player"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spectre_team_member_team_fkey"
            columns: ["team"]
            isOneToOne: false
            referencedRelation: "spectre_team"
            referencedColumns: ["id"]
          },
        ]
      }
      spectre_team_stats: {
        Row: {
          casual_matches_played_count: number
          casual_matches_played_season_count: number
          casual_mmr: number
          created_at: string
          current_team_rank: number
          ranked_matches_played_count: number
          ranked_matches_played_season_count: number
          ranked_mmr: number
          team: string
          team_rank_points: number
          updated_at: string | null
        }
        Insert: {
          casual_matches_played_count?: number
          casual_matches_played_season_count?: number
          casual_mmr?: number
          created_at?: string
          current_team_rank?: number
          ranked_matches_played_count?: number
          ranked_matches_played_season_count?: number
          ranked_mmr?: number
          team: string
          team_rank_points?: number
          updated_at?: string | null
        }
        Update: {
          casual_matches_played_count?: number
          casual_matches_played_season_count?: number
          casual_mmr?: number
          created_at?: string
          current_team_rank?: number
          ranked_matches_played_count?: number
          ranked_matches_played_season_count?: number
          ranked_mmr?: number
          team?: string
          team_rank_points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "spectre_team_stats_id_fkey"
            columns: ["team"]
            isOneToOne: true
            referencedRelation: "spectre_team"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_players_by_display_name: {
        Args: {
          name: string
        }
        Returns: {
          created_at: string
          crew_id: string | null
          discriminator: string
          display_name: string
          id: string
          updated_at: string | null
        }[]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
