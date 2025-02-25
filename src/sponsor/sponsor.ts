import { Database } from "../database";
import { Redis } from "../redis";
import { GlobalSponsorStats } from "./sponsor.types"

const db = Database.getInstance();
const redis = Redis.getInstance().client;

const CACHE_KEY = 'wv:global_sponsor_stats';
const CACHE_TTL = 3600; // 1 hour in seconds

/**
 * Get global statistics for all sponsors
 * @returns Object containing sponsor statistics
 */
export async function getGlobalSponsorStats(): Promise<{ success: boolean, stats?: GlobalSponsorStats, error?: string }> {
    try {
        console.log('Starting global sponsor stats calculation');
        
        // Try to get the stats from cache first
        try {
            const cachedStats = await redis.get(CACHE_KEY);
            if (cachedStats) {
                console.log('Cache hit for global sponsor stats');
                return { 
                    success: true, 
                    stats: typeof cachedStats === 'string' ? JSON.parse(cachedStats) : cachedStats 
                };
            }
            console.log('Cache miss for global sponsor stats');
        } catch (cacheError) {
            console.error('Error accessing Redis cache:', cacheError);
            // Continue without cache
        }

        // Use a more efficient query to get all the data we need in one go
        console.log('Fetching match player data');
        const { data: playerData, error: playerError } = await db.client
            .from("spectre_match_player")
            .select(`
                id,
                player,
                team,
                selected_sponsor,
                saved_sponsor_name,
                num_kills,
                num_deaths,
                num_assists
            `)
            .not('selected_sponsor', 'is', null);

        if (playerError) {
            console.error('Error getting player data:', playerError);
            return { success: false, error: playerError.message || "Failed to retrieve player data" };
        }

        if (!playerData || playerData.length === 0) {
            console.log('No player data found with sponsors');
            return { success: true, stats: { total_players: 0, sponsors: [] } };
        }

        console.log(`Found ${playerData.length} player records with sponsors`);

        // Count unique players
        const uniquePlayers = new Set();
        let nullPlayerCount = 0;
        
        playerData.forEach((player: any) => {
            if (player.player) {
                uniquePlayers.add(player.player);
            } else {
                nullPlayerCount++;
            }
        });
        
        console.log(`Found ${uniquePlayers.size} unique players and ${nullPlayerCount} records with null player IDs`);

        // Analyze sponsors per player
        const playerSponsorsMap = new Map();
        playerData.forEach((player: any) => {
            if (player.player) {
                if (!playerSponsorsMap.has(player.player)) {
                    playerSponsorsMap.set(player.player, new Set());
                }
                if (player.selected_sponsor) {
                    playerSponsorsMap.get(player.player).add(player.selected_sponsor);
                }
            }
        });
        
        // Count how many players use multiple sponsors
        let singleSponsorPlayers = 0;
        let multiSponsorPlayers = 0;
        let maxSponsorsPerPlayer = 0;
        
        playerSponsorsMap.forEach((sponsors) => {
            if (sponsors.size === 1) {
                singleSponsorPlayers++;
            } else if (sponsors.size > 1) {
                multiSponsorPlayers++;
                maxSponsorsPerPlayer = Math.max(maxSponsorsPerPlayer, sponsors.size);
            }
        });
        
        console.log(`Players with single sponsor: ${singleSponsorPlayers}`);
        console.log(`Players with multiple sponsors: ${multiSponsorPlayers}`);
        console.log(`Maximum sponsors used by a single player: ${maxSponsorsPerPlayer}`);

        // Group by sponsor
        const sponsorMap = new Map();
        
        // Extract team IDs for match outcome calculation
        const teamIds = new Set();
        
        playerData.forEach((player: any) => {
            const sponsorId = player.selected_sponsor;
            const sponsorName = player.saved_sponsor_name || 'Unknown';
            
            if (!sponsorMap.has(sponsorId)) {
                sponsorMap.set(sponsorId, {
                    sponsor_id: sponsorId,
                    sponsor_name: sponsorName,
                    picks: 0,
                    total_kills: 0,
                    total_deaths: 0,
                    total_assists: 0,
                    total_wins: 0,
                    total_losses: 0,
                    total_draws: 0
                });
            }
            
            const sponsor = sponsorMap.get(sponsorId);
            sponsor.picks++;
            sponsor.total_kills += player.num_kills || 0;
            sponsor.total_deaths += player.num_deaths || 0;
            sponsor.total_assists += player.num_assists || 0;
            
            // Add team ID to set for later query
            if (player.team) {
                teamIds.add(player.team);
            }
        });

        console.log(`Processing ${sponsorMap.size} unique sponsors`);

        // Get match teams data in batches to avoid URI too large errors
        if (teamIds.size > 0) {
            console.log('Fetching match team data');
            
            // Convert Set to Array
            const teamIdsArray = Array.from(teamIds);
            // Create batches of 100 IDs
            const BATCH_SIZE = 100;
            const batches = [];
            
            for (let i = 0; i < teamIdsArray.length; i += BATCH_SIZE) {
                batches.push(teamIdsArray.slice(i, i + BATCH_SIZE));
            }
            
            console.log(`Split ${teamIdsArray.length} team IDs into ${batches.length} batches`);
            
            // Process each batch
            const teamsData = [];
            let hasTeamsError = false;
            let teamsError = null;
            
            for (let i = 0; i < batches.length; i++) {
                const batch = batches[i];
                console.log(`Processing batch ${i+1}/${batches.length} with ${batch.length} team IDs`);
                
                const { data: batchData, error: batchError } = await db.client
                    .from("spectre_match_team")
                    .select(`
                        id, 
                        match,
                        team_index,
                        rounds_won
                    `)
                    .in('id', batch);
                
                if (batchError) {
                    console.error(`Error getting match teams batch ${i+1}:`, batchError);
                    hasTeamsError = true;
                    teamsError = batchError;
                    // Continue with other batches
                } else if (batchData && batchData.length > 0) {
                    teamsData.push(...batchData);
                }
            }

            if (hasTeamsError) {
                console.error('Error getting match teams:', teamsError);
            } else if (teamsData && teamsData.length > 0) {
                console.log(`Found ${teamsData.length} team records`);
                
                // Create maps for efficient lookups
                const teamMap = new Map();
                const matchIds = new Set();
                
                teamsData.forEach((team: any) => {
                    teamMap.set(team.id, team);
                    if (team.match) {
                        matchIds.add(team.match);
                    }
                });
                
                // Get match data for surrenders in batches as well
                console.log('Fetching match surrender data');
                const matchIdsArray = Array.from(matchIds);
                const matchBatches = [];
                
                for (let i = 0; i < matchIdsArray.length; i += BATCH_SIZE) {
                    matchBatches.push(matchIdsArray.slice(i, i + BATCH_SIZE));
                }
                
                console.log(`Split ${matchIdsArray.length} match IDs into ${matchBatches.length} batches`);
                
                const matchesData = [];
                let hasMatchesError = false;
                let matchesError = null;
                
                for (let i = 0; i < matchBatches.length; i++) {
                    const batch = matchBatches[i];
                    console.log(`Processing match batch ${i+1}/${matchBatches.length} with ${batch.length} match IDs`);
                    
                    const { data: batchData, error: batchError } = await db.client
                        .from("spectre_match")
                        .select('id, surrendered_team')
                        .in('id', batch);
                    
                    if (batchError) {
                        console.error(`Error getting match data batch ${i+1}:`, batchError);
                        hasMatchesError = true;
                        matchesError = batchError;
                        // Continue with other batches
                    } else if (batchData && batchData.length > 0) {
                        matchesData.push(...batchData);
                    }
                }
                
                const surrenderMap = new Map();
                if (!hasMatchesError && matchesData) {
                    matchesData.forEach((match: any) => {
                        surrenderMap.set(match.id, match.surrendered_team);
                    });
                    console.log(`Found ${matchesData.length} match records with surrender data`);
                }
                
                // Create a map of matches to teams
                const matchTeamsMap = new Map();
                teamsData.forEach((team: any) => {
                    if (!matchTeamsMap.has(team.match)) {
                        matchTeamsMap.set(team.match, []);
                    }
                    matchTeamsMap.get(team.match).push(team);
                });
                
                // Process win/loss for each player
                console.log('Processing win/loss data');
                for (const player of playerData) {
                    const sponsorId = player.selected_sponsor;
                    const sponsor = sponsorMap.get(sponsorId);
                    const teamId = player.team;
                    
                    if (!sponsor || !teamId) continue;
                    
                    const team = teamMap.get(teamId);
                    if (!team || !team.match) continue;
                    
                    const teamsInMatch = matchTeamsMap.get(team.match);
                    if (!teamsInMatch || teamsInMatch.length < 2) continue;
                    
                    const opposingTeams = teamsInMatch.filter((t: any) => t.team_index !== team.team_index);
                    if (opposingTeams.length === 0) continue;
                    
                    // Use the first opposing team for comparison
                    const opposingTeam = opposingTeams[0];
                    
                    // Check for surrender
                    const surrenderedTeam = surrenderMap.get(team.match);
                    if (surrenderedTeam !== undefined && surrenderedTeam !== null) {
                        if (surrenderedTeam === team.team_index) {
                            sponsor.total_losses++;
                        } else {
                            sponsor.total_wins++;
                        }
                    }
                    // Normal match outcome
                    else if (team.rounds_won > opposingTeam.rounds_won) {
                        sponsor.total_wins++;
                    } else if (team.rounds_won < opposingTeam.rounds_won) {
                        sponsor.total_losses++;
                    } else {
                        sponsor.total_draws++;
                    }
                }
            }
        }

        // Create the final stats object
        const sponsorStats: GlobalSponsorStats = {
            total_players: uniquePlayers.size,
            sponsors: Array.from(sponsorMap.values())
        };

        // Cache the result
        try {
            console.log('Caching sponsor stats');
            await redis.set(CACHE_KEY, JSON.stringify(sponsorStats), {ex: CACHE_TTL});
        } catch (cacheError) {
            console.error('Error caching sponsor stats:', cacheError);
            // Continue without caching
        }

        console.log('Completed global sponsor stats calculation');
        return { success: true, stats: sponsorStats };
    } catch (error: any) {
        console.error('Error getting global sponsor stats:', error);
        return { success: false, error: error?.message || 'Unknown error occurred' };
    }
} 