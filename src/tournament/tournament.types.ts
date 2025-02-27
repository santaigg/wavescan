/**
 * Tournament-related type definitions
 */

/**
 * Admin authentication result
 */
export interface AdminAuthResult {
  success: boolean;
  message?: string;
}

/**
 * Tournament data structure
 */
export interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed';
  is_public: boolean;
}

/**
 * Player statistics for tournament
 */
export interface PlayerStats {
  id: string;
  name: string;
  handle: string;
  sponsor: string;
  kills: number;
  deaths: number;
  assists: number;
  kd: number;
  avatarUrl?: string;
  socialLink?: string;
}

/**
 * Match statistics for tournament
 */
export interface MatchStats {
  id: string;
  team1: {
    name: string;
    score: number;
    players: PlayerStats[];
  };
  team2: {
    name: string;
    score: number;
    players: PlayerStats[];
  };
  status: "upcoming" | "live" | "completed";
  round: string;
  scheduledTime?: string; // Optional scheduled time for upcoming matches
}

/**
 * Tournament data for frontend
 */
export interface TournamentData {
  id: string;
  name: string;
  streamUrl: string;
  matches: MatchStats[];
} 