import { Redis } from "../redis";
import { TournamentData, MatchStats, PlayerStats } from "./tournament.types";
import { isAdminAuthenticated } from "./admin";
import { config } from "./config";

const redis = Redis.getInstance().client;

/**
 * Helper function to create a default player
 */
export const createDefaultPlayer = (id: string, name: string, handle: string, sponsor: string): PlayerStats => ({
  id,
  name,
  handle,
  sponsor,
  kills: 0,
  deaths: 0,
  assists: 0,
  kd: 0,
  avatarUrl: `https://randomuser.me/api/portraits/men/${Math.floor(Math.random() * 70)}.jpg`,
  socialLink: `https://twitter.com/${handle.toLowerCase()}`
});

/**
 * Helper function to create a default match
 */
export const createDefaultMatch = (id: string, round: string): MatchStats => ({
  id,
  team1: {
    name: "TBD Team 1",
    score: 0,
    players: [
      createDefaultPlayer(`${id}_t1p1`, "Player 1", "Player1", "Monark"),
      createDefaultPlayer(`${id}_t1p2`, "Player 2", "Player2", "Vector"),
      createDefaultPlayer(`${id}_t1p3`, "Player 3", "Player3", "Bloom"),
    ]
  },
  team2: {
    name: "TBD Team 2",
    score: 0,
    players: [
      createDefaultPlayer(`${id}_t2p1`, "Player 1", "Player1", "Ghostlink"),
      createDefaultPlayer(`${id}_t2p2`, "Player 2", "Player2", "Morrgen"),
      createDefaultPlayer(`${id}_t2p3`, "Player 3", "Player3", "Umbra"),
    ]
  },
  status: "upcoming",
  round,
  map: "Canal",
  scheduledTime: "TBD"
});

/**
 * Default tournament data
 */
export const defaultTournamentData: TournamentData = {
  id: "default",
  name: "Optic Gaming 3v3 Tournament",
  streamUrl: "https://www.youtube.com/embed/gUxWaHvGAuU?autoplay=1&mute=1",
  matches: [
    {
      id: "match1",
      team1: {
        name: "Team Scump",
        score: 13,
        players: [
          {
            id: "player1",
            name: "Seth Abner",
            handle: "Scump",
            sponsor: "Monark",
            kills: 24,
            deaths: 12,
            assists: 8,
            kd: 2.0,
            avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
            socialLink: "https://twitter.com/scump"
          },
          {
            id: "player2",
            name: "Jordan Kaplan",
            handle: "JKap",
            sponsor: "Vector",
            kills: 18,
            deaths: 14,
            assists: 6,
            kd: 1.29,
            avatarUrl: "https://randomuser.me/api/portraits/men/41.jpg",
            socialLink: "https://twitter.com/jkap"
          },
          {
            id: "player3",
            name: "Thomas Wilson",
            handle: "Tempo",
            sponsor: "Bloom",
            kills: 16,
            deaths: 15,
            assists: 10,
            kd: 1.07,
            avatarUrl: "https://randomuser.me/api/portraits/men/55.jpg",
            socialLink: "https://twitter.com/tempo"
          }
        ]
      },
      team2: {
        name: "Team Shotzzy",
        score: 7,
        players: [
          {
            id: "player5",
            name: "Anthony Cuevas-Castro",
            handle: "Shotzzy",
            sponsor: "Ghostlink",
            kills: 19,
            deaths: 16,
            assists: 5,
            kd: 1.19,
            avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
            socialLink: "https://twitter.com/shotzzy"
          },
          {
            id: "player6",
            name: "Brandon Green",
            handle: "Dashy",
            sponsor: "Morrgen",
            kills: 15,
            deaths: 18,
            assists: 7,
            kd: 0.83,
            avatarUrl: "https://randomuser.me/api/portraits/men/28.jpg",
            socialLink: "https://twitter.com/dashy"
          },
          {
            id: "player7",
            name: "Dylan Henderson",
            handle: "Envoy",
            sponsor: "Umbra",
            kills: 12,
            deaths: 19,
            assists: 9,
            kd: 0.63,
            avatarUrl: "https://randomuser.me/api/portraits/men/36.jpg",
            socialLink: "https://twitter.com/envoy"
          }
        ]
      },
      status: "completed",
      round: "Quarter Finals",
      map: "Canal"
    },
    {
      id: "match2",
      team1: {
        name: "Team FormaL",
        score: 9,
        players: [
          {
            id: "player9",
            name: "Matthew Piper",
            handle: "FormaL",
            sponsor: "Pinnacle",
            kills: 22,
            deaths: 18,
            assists: 6,
            kd: 1.22,
            avatarUrl: "https://randomuser.me/api/portraits/men/52.jpg",
            socialLink: "https://twitter.com/formal"
          },
          {
            id: "player10",
            name: "Ian Porter",
            handle: "Crimsix",
            sponsor: "Muu",
            kills: 19,
            deaths: 16,
            assists: 8,
            kd: 1.19,
            avatarUrl: "https://randomuser.me/api/portraits/men/57.jpg",
            socialLink: "https://twitter.com/crimsix"
          },
          {
            id: "player11",
            name: "Alec Sanderson",
            handle: "Arcitys",
            sponsor: "Ryker",
            kills: 17,
            deaths: 15,
            assists: 9,
            kd: 1.13,
            avatarUrl: "https://randomuser.me/api/portraits/men/62.jpg",
            socialLink: "https://twitter.com/arcitys"
          }
        ]
      },
      team2: {
        name: "Team Scump",
        score: 9,
        players: [
          {
            id: "player1",
            name: "Seth Abner",
            handle: "Scump",
            sponsor: "Monark",
            kills: 21,
            deaths: 17,
            assists: 7,
            kd: 1.24,
            avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
            socialLink: "https://twitter.com/scump"
          },
          {
            id: "player2",
            name: "Jordan Kaplan",
            handle: "JKap",
            sponsor: "Vector",
            kills: 18,
            deaths: 18,
            assists: 6,
            kd: 1.0,
            avatarUrl: "https://randomuser.me/api/portraits/men/41.jpg",
            socialLink: "https://twitter.com/jkap"
          },
          {
            id: "player3",
            name: "Thomas Wilson",
            handle: "Tempo",
            sponsor: "Bloom",
            kills: 16,
            deaths: 19,
            assists: 8,
            kd: 0.84,
            avatarUrl: "https://randomuser.me/api/portraits/men/55.jpg",
            socialLink: "https://twitter.com/tempo"
          }
        ]
      },
      status: "live",
      round: "Semi Finals",
      map: "Highrise"
    },
    {
      id: "match3",
      team1: {
        name: "Team Shotzzy",
        score: 0,
        players: [
          {
            id: "player5",
            name: "Anthony Cuevas-Castro",
            handle: "Shotzzy",
            sponsor: "Ghostlink",
            kills: 0,
            deaths: 0,
            assists: 0,
            kd: 0,
            avatarUrl: "https://randomuser.me/api/portraits/men/22.jpg",
            socialLink: "https://twitter.com/shotzzy"
          },
          {
            id: "player6",
            name: "Brandon Green",
            handle: "Dashy",
            sponsor: "Morrgen",
            kills: 0,
            deaths: 0,
            assists: 0,
            kd: 0,
            avatarUrl: "https://randomuser.me/api/portraits/men/28.jpg",
            socialLink: "https://twitter.com/dashy"
          },
          {
            id: "player7",
            name: "Dylan Henderson",
            handle: "Envoy",
            sponsor: "Umbra",
            kills: 0,
            deaths: 0,
            assists: 0,
            kd: 0,
            avatarUrl: "https://randomuser.me/api/portraits/men/36.jpg",
            socialLink: "https://twitter.com/envoy"
          }
        ]
      },
      team2: {
        name: "Winner of Semi Finals",
        score: 0,
        players: [
          {
            id: "tbd1",
            name: "TBD",
            handle: "TBD",
            sponsor: "tbd",
            kills: 0,
            deaths: 0,
            assists: 0,
            kd: 0
          },
          {
            id: "tbd2",
            name: "TBD",
            handle: "TBD",
            sponsor: "tbd",
            kills: 0,
            deaths: 0,
            assists: 0,
            kd: 0
          },
          {
            id: "tbd3",
            name: "TBD",
            handle: "TBD",
            sponsor: "tbd",
            kills: 0,
            deaths: 0,
            assists: 0,
            kd: 0
          }
        ]
      },
      status: "upcoming",
      round: "Finals",
      map: "Rust"
    },
  ],
};

/**
 * Fetch tournament data from Redis
 * @param tournamentId Tournament ID
 * @returns Tournament data or default if not found
 */
export async function fetchTournament(tournamentId: string): Promise<{ success: boolean, data?: TournamentData, error?: string }> {
  try {
    console.log(`Fetching tournament data for ID: ${tournamentId}`);
    
    // Try to get from Redis
    const redisKey = `${config.tournamentKeyPrefix}${tournamentId}`;
    const cachedData = await redis.get(redisKey);
    
    if (cachedData) {
      console.log('Cache hit for tournament data');
      const tournamentData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
      return { 
        success: true, 
        data: tournamentData
      };
    }
    
    console.log('Cache miss for tournament data, using default');
    
    // If not found, use default data and save it
    const defaultData = {
      ...defaultTournamentData,
      id: tournamentId
    };
    
    // Save default data to Redis
    await redis.set(redisKey, JSON.stringify(defaultData), {ex: config.cacheTTL});
    
    return { 
      success: true, 
      data: defaultData
    };
  } catch (error: any) {
    console.error('Error fetching tournament data:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error occurred'
    };
  }
}

/**
 * Update tournament data in Redis
 * @param tournamentId Tournament ID
 * @param data Tournament data to update
 * @returns Updated tournament data
 */
export async function updateTournament(tournamentId: string, data: TournamentData): Promise<{ success: boolean, data?: TournamentData, error?: string }> {
  try {
    
    console.log(`Updating tournament data for ID: ${tournamentId}`);
    
    // Ensure the ID in the data matches the requested ID
    const tournamentData = {
      ...data,
      id: tournamentId
    };
    
    // Save to Redis
    const redisKey = `${config.tournamentKeyPrefix}${tournamentId}`;
    await redis.set(redisKey, JSON.stringify(tournamentData), {ex: config.cacheTTL});
    
    return { 
      success: true, 
      data: tournamentData
    };
  } catch (error: any) {
    console.error('Error updating tournament data:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error occurred'
    };
  }
}

/**
 * Add a match to tournament
 * @param tournamentId Tournament ID
 * @param match Match data to add
 * @returns Updated tournament data
 */
export async function addMatch(tournamentId: string, match: MatchStats): Promise<{ success: boolean, data?: TournamentData, error?: string }> {
  try {
    // Check if user is authenticated as admin
    if (!isAdminAuthenticated()) {
      return { success: false, error: "Unauthorized: Admin authentication required" };
    }
    
    console.log(`Adding match to tournament ID: ${tournamentId}`);
    
    // Get current tournament data
    const { success, data, error } = await fetchTournament(tournamentId);
    
    if (!success || !data) {
      return { success: false, error: error || "Failed to fetch tournament data" };
    }
    
    // Add the new match
    const updatedData = {
      ...data,
      matches: [...data.matches, match]
    };
    
    // Save the updated data
    return await updateTournament(tournamentId, updatedData);
  } catch (error: any) {
    console.error('Error adding match:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error occurred'
    };
  }
}

/**
 * Update a match in tournament
 * @param tournamentId Tournament ID
 * @param matchId Match ID to update
 * @param updatedMatch Updated match data
 * @returns Updated tournament data
 */
export async function updateMatch(tournamentId: string, matchId: string, updatedMatch: MatchStats): Promise<{ success: boolean, data?: TournamentData, error?: string }> {
  try {
    // Check if user is authenticated as admin
    if (!isAdminAuthenticated()) {
      return { success: false, error: "Unauthorized: Admin authentication required" };
    }
    
    console.log(`Updating match ${matchId} in tournament ID: ${tournamentId}`);
    
    // Get current tournament data
    const { success, data, error } = await fetchTournament(tournamentId);
    
    if (!success || !data) {
      return { success: false, error: error || "Failed to fetch tournament data" };
    }
    
    // Find the match to update
    const matchIndex = data.matches.findIndex(m => m.id === matchId);
    
    if (matchIndex === -1) {
      return { success: false, error: `Match with ID ${matchId} not found` };
    }
    
    // Update the match
    const updatedMatches = [...data.matches];
    updatedMatches[matchIndex] = {
      ...updatedMatch,
      id: matchId // Ensure ID remains the same
    };
    
    const updatedData = {
      ...data,
      matches: updatedMatches
    };
    
    // Save the updated data
    return await updateTournament(tournamentId, updatedData);
  } catch (error: any) {
    console.error('Error updating match:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error occurred'
    };
  }
}

/**
 * Delete a match from tournament
 * @param tournamentId Tournament ID
 * @param matchId Match ID to delete
 * @returns Updated tournament data
 */
export async function deleteMatch(tournamentId: string, matchId: string): Promise<{ success: boolean, data?: TournamentData, error?: string }> {
  try {
    // Check if user is authenticated as admin
    if (!isAdminAuthenticated()) {
      return { success: false, error: "Unauthorized: Admin authentication required" };
    }
    
    console.log(`Deleting match ${matchId} from tournament ID: ${tournamentId}`);
    
    // Get current tournament data
    const { success, data, error } = await fetchTournament(tournamentId);
    
    if (!success || !data) {
      return { success: false, error: error || "Failed to fetch tournament data" };
    }
    
    // Remove the match
    const updatedMatches = data.matches.filter(match => match.id !== matchId);
    
    // Check if any matches were removed
    if (updatedMatches.length === data.matches.length) {
      return { success: false, error: `Match with ID ${matchId} not found` };
    }
    
    const updatedData = {
      ...data,
      matches: updatedMatches
    };
    
    // Save the updated data
    return await updateTournament(tournamentId, updatedData);
  } catch (error: any) {
    console.error('Error deleting match:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error occurred'
    };
  }
}

/**
 * Reset tournament data to default
 * @param tournamentId Tournament ID
 * @returns Default tournament data
 */
export async function resetTournamentData(tournamentId: string): Promise<{ success: boolean, data?: TournamentData, error?: string }> {
  try {
    // Check if user is authenticated as admin
    if (!isAdminAuthenticated()) {
      return { success: false, error: "Unauthorized: Admin authentication required" };
    }
    
    console.log(`Resetting tournament data for ID: ${tournamentId}`);
    
    // Create default data with the specified ID
    const defaultData = {
      ...defaultTournamentData,
      id: tournamentId
    };
    
    // Save to Redis
    const redisKey = `${config.tournamentKeyPrefix}${tournamentId}`;
    await redis.set(redisKey, JSON.stringify(defaultData), {ex: config.cacheTTL});
    
    return { 
      success: true, 
      data: defaultData
    };
  } catch (error: any) {
    console.error('Error resetting tournament data:', error);
    return { 
      success: false, 
      error: error?.message || 'Unknown error occurred'
    };
  }
} 