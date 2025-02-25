/**
 * Interface for global sponsor statistics
 */
export interface GlobalSponsorStats { 
  total_players: number; // Players in scope
  sponsors: {
    sponsor_id: string;
    sponsor_name: string;
    picks: number; // Total times sponsor was most used for that player
    total_wins: number; // Total wins for that sponsor across all players
    total_draws: number; // Total draws for that sponsor across all players
    total_losses: number; // Total losses for that sponsor across all players
    total_kills: number; // Total kills for that sponsor across all players
    total_deaths: number; // Total deaths for that sponsor across all players
    total_assists: number; // Total assists for that sponsor across all players
  }[]
} 