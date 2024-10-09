import { Match_Team, PlayerExtendedStats, PlayerFullProfile, PlayerMatch, PlayerProfile, SeasonStats } from "./player.types";
import { Database } from "../database";
import { Steam } from "../steam";

const db = Database.getInstance();
const steam = Steam.getInstance();

export async function getPlayerProfile(
	playerId: string,
): Promise<PlayerProfile | { error: string }> {
	const { data, error } = await db.client
		.from("spectre_player")
		.select(
			"*, spectre_player_stats ( * ), spectre_player_banner ( * ), spectre_player_account ( * )",
		)
		.eq("id", playerId);
	if (error) {
		return { error: error.message };
	}
	if (data && data?.length > 0) {
		const player = data[0];
		let steam_profile = null;
		// Get Steam Account
		if (
			player.spectre_player_account &&
			player.spectre_player_account?.length > 0
		) {
			const steam_account = player.spectre_player_account.find(
				(account) => account.provider_type.toLowerCase() === "steam",
			);
			if (steam_account) {
				const steam_account_id = steam_account.account_id;
				const steam_accounts =
					await steam.client.getUserSummary(steam_account_id);

				// If we get an array, use the first account
				if (steam_accounts && Array.isArray(steam_accounts)) {
					steam_profile = {
						id: steam_account_id,
						...steam_accounts[0],
					};
				} else {
					steam_profile = {
						id: steam_account_id,
						...steam_accounts,
					};
				}
			}
		}

		// Player Profile Payload
		const player_profile = {
			id: player.id,
			name: player.display_name,
			discriminator: player.discriminator,
			steam_profile: {
				id: steam_profile?.id,
				avatar: steam_profile?.avatar,
				url: steam_profile?.url,
			},
			stats: {
				rank_rating: player?.spectre_player_stats?.rank_rating || 0,
				current_solo_rank: player?.spectre_player_stats?.current_solo_rank || 0,
				highest_team_rank: player?.spectre_player_stats?.highest_team_rank || 0,
				rank_rating_last_updated:
					player?.spectre_player_stats?.last_updated_rank_rating || null,
			},
		};
		return { ...player_profile };
	} else {
		return { error: "Player not found" };
	}
}

/**
 * Retrieves the full profile of a player, including match history and extended stats.
 * @param playerId - The unique identifier of the player.
 * @returns A promise that resolves to the player's full profile or an error object.
 */
export async function getPlayerFullProfile(
	playerId: string
): Promise<PlayerFullProfile | { error: string }> {
	const player_profile = await getPlayerProfile(playerId);
	if ("error" in player_profile) {
		return player_profile;
	}

	const { data, error } = await db.client
		.from("spectre_player")
		.select(
			"*, spectre_match_player ( *, spectre_match_team ( *, spectre_match ( *, spectre_match_team ( *, spectre_match_player ( * ) ) ) ) )"
		)
		.eq("id", playerId);

	if (error) {
		return { error: error.message };
	}

	if (!data || data.length === 0) {
		return { ...player_profile, matches: [] };
	}

	const player_matches = data[0]?.spectre_match_player;
	if (!player_matches || player_matches.length === 0) {
		return { ...player_profile, matches: [] };
	}

	const matches = player_matches.map(processMatch).filter((match): match is PlayerMatch => match !== undefined);

    const sorted_matches = matches.sort((a, b) => b.match_date.getTime() - a.match_date.getTime());

	const extended_stats = calculateExtendedStats(matches, playerId);

	return {
		...player_profile,
		matches: sorted_matches,
		extended_stats,
	} as PlayerFullProfile;
}

/**
 * Processes a raw match data into a structured PlayerMatch object.
 * @param match - The raw match data from the database.
 * @returns A structured PlayerMatch object or undefined if processing fails.
 */
function processMatch(match: any): PlayerMatch | undefined {
    if (!match?.spectre_match_team?.spectre_match) return undefined;

    const spectre_match = match.spectre_match_team.spectre_match;
    const spectre_match_teams = spectre_match.spectre_match_team;

    if (!spectre_match_teams || spectre_match_teams.length === 0) return undefined;

    const player_team = spectre_match_teams[0];
    const opponent_team = spectre_match_teams.length > 1 ? spectre_match_teams[1] : null;

    const match_rounds = opponent_team 
        ? Math.max(player_team.rounds_won, opponent_team.rounds_won)
        : player_team.rounds_won;

    const winner = calculateWinner(spectre_match, player_team, opponent_team);

    return {
        id: spectre_match.id,
        region: spectre_match.region,
        is_ranked: spectre_match.is_ranked,
        queue_name: spectre_match.queue_name,
        map: spectre_match.queue_game_map,
        game_mode: spectre_match.queue_game_mode,
        surrended_team: spectre_match.surrendered_team,
        is_abandoned: spectre_match.is_abandoned_match,
        match_date: new Date(spectre_match.match_date),
        rounds: match_rounds,
        winner,
        player_team: processTeam(player_team),
        opponent_team: opponent_team ? processTeam(opponent_team) : null,
    };
}

/**
 * Calculates the winner of a match.
 * @param spectre_match - The match data.
 * @param player_team - The player's team data.
 * @param opponent_team - The opponent's team data (can be null).
 * @returns -1 for draw, 0 for loss, 1 for win.
 */
function calculateWinner(spectre_match: any, player_team: any, opponent_team: any | null): -1 | 0 | 1 {
    if (spectre_match.surrendered_team !== -1) {
        return spectre_match.surrendered_team ?? 1; // If there's no opponent, assume win
    }
    if (!opponent_team) return 1; // If there's no opponent, it's a win

    return player_team.rounds_won > opponent_team.rounds_won ? 1 :
        player_team.rounds_won < opponent_team.rounds_won ? 0 : -1;
}

/**
 * Processes team data into a structured Match_Team object.
 * @param team - The raw team data from the database.
 * @returns A structured Match_Team object.
 */
function processTeam(team: any): Match_Team {
    return {
        id: team.id,
        team_id: team.team,
        team_index: team.team_index,
        rounds_won: team.rounds_won,
        rounds_played: team.rounds_played,
        xp_earned: calculateXpEarned(team),
        fans_earned: calculateFansEarned(team),
        used_team_rank: team.used_team_rank,
        team_rank: team.current_rank_id,
        previous_team_rank: team.previous_rank_id,
        num_ranked_matches: team.num_ranked_matches,
        ranked_rating: team.current_ranked_rating,
        ranked_rating_delta: team.ranked_rating_delta,
        previous_ranked_rating: team.previous_ranked_rating,
        is_full_party: team.is_full_team_in_party,
        players: team.spectre_match_player?.map(processPlayer).filter(Boolean) ?? [],
    };
}

/**
 * Calculates the XP earned by a team.
 * @param team - The team data.
 * @returns The total XP earned.
 */
function calculateXpEarned(team: any): number {
	if (team.xp_per_round && team.rounds_played && team.xp_per_round_won && team.rounds_won) {
		return team.xp_per_round * team.rounds_played + team.xp_per_round_won * team.rounds_won;
	}
	return 0;
}

/**
 * Calculates the fans earned by a team.
 * @param team - The team data.
 * @returns The total fans earned.
 */
function calculateFansEarned(team: any): number {
	if (team.fans_per_round && team.rounds_played && team.fans_per_round_won && team.rounds_won) {
		return team.fans_per_round * team.rounds_played + team.fans_per_round_won * team.rounds_won;
	}
	return 0;
}

/**
 * Processes player data into a structured player object.
 * @param player - The raw player data from the database.
 * @returns A structured player object or null if essential data is missing.
 */
function processPlayer(player: any): any | null {
    if (!player || !player.player) return null;

    return {
        id: player.player,
        name: player.saved_player_name || 'Unknown',
        kills: player.num_kills || 0,
        assists: player.num_assists || 0,
        deaths: player.num_deaths || 0,
        damage_dealt: player.total_damage_done || 0,
        teammate_index: player.teammate_index || 0,
        sponsor_id: player.selected_sponsor || '',
        sponsor_name: player.saved_sponsor_name || '',
        ranked_rating: player.current_ranked_rating || 0,
        previous_ranked_rating: player.previous_ranked_rating || 0,
        ranked_rating_delta: (player.current_ranked_rating - player.previous_ranked_rating) || 0,
        rank_id: player.current_rank_id || '',
        previous_rank_id: player.previous_rank_id || '',
        banner_id: player.selected_banner_catalog_id || '',
        crew_score: player.crew_score || 0,
        crew_id: player.crew || '',
        team_id: player.team || '',
        division_id: player.division || '',
        num_ranked_matches: player.num_ranked_matches || 0,
        is_anonymous: player.is_anonymous_player || false,
    };
}

/**
 * Calculates extended stats for a player based on their match history.
 * @param matches - The player's match history.
 * @param playerId - The unique identifier of the player.
 * @returns The calculated extended stats.
 */
function calculateExtendedStats(matches: PlayerMatch[], playerId: string): PlayerFullProfile['extended_stats'] {
    const extended_stats: PlayerFullProfile['extended_stats'] = {
        season_stats: {},
        last_20_matches_avg_stats: initializeExtendedStats(),
        map_stats: {},
        sponsor_stats: {},
    };

    matches.forEach((match, index) => {
        const player = match.player_team.players.find(p => p.id === playerId);
        if (!player) return;

        const season = getSeason(match.match_date);
        if (!extended_stats.season_stats[season]) {
            extended_stats.season_stats[season] = initializeSeasonStats(season);
        }
        updateExtendedStats(extended_stats.season_stats[season], player, match);

        if (!extended_stats.map_stats[match.map]) {
            extended_stats.map_stats[match.map] = initializeExtendedStats();
        }
        updateExtendedStats(extended_stats.map_stats[match.map], player, match);

        if (player.sponsor_id && !extended_stats.sponsor_stats[player.sponsor_id]) {
            extended_stats.sponsor_stats[player.sponsor_id] = {
                ...initializeExtendedStats(),
                sponsor_id: player.sponsor_id,
                sponsor_name: player.sponsor_name,
            };
        }
        if (player.sponsor_id) {
            updateExtendedStats(extended_stats.sponsor_stats[player.sponsor_id], player, match);
        }

        if (index < 20) {
            updateExtendedStats(extended_stats.last_20_matches_avg_stats, player, match);
        }
    });

    finalizeExtendedStats(extended_stats);

    return extended_stats;
}

/**
 * Initializes an extended stats object with default values.
 * @returns An initialized PlayerExtendedStats object.
 */
function initializeExtendedStats(): PlayerExtendedStats {
	return {
		total_kills: 0,
		total_assists: 0,
		total_deaths: 0,
		total_damage_dealt: 0,
		total_wins: 0,
		total_losses: 0,
		total_draws: 0,
		total_rounds_played: 0,
		top_damage_dealt: 0,
		top_kills: 0,
		top_assists: 0,
		top_deaths: 0,
		average_win_percentage: 0,
		average_damage_per_round: 0,
		average_kills_per_round: 0,
		average_assists_per_round: 0,
		average_deaths_per_round: 0,
	};
}

/**
 * Updates extended stats with data from a single match.
 * @param stats - The stats object to update.
 * @param player - The player's data for the match.
 * @param match - The match data.
 */
function updateExtendedStats(stats: PlayerExtendedStats | SeasonStats, player: any, match: PlayerMatch) {
	stats.total_kills += player.kills;
	stats.total_assists += player.assists;
	stats.total_deaths += player.deaths;
	stats.total_damage_dealt += player.damage_dealt;
	stats.total_rounds_played += match.rounds;

	if (match.winner === 1) stats.total_wins++;
	else if (match.winner === 0) stats.total_losses++;
	else stats.total_draws++;

	stats.top_damage_dealt = Math.max(stats.top_damage_dealt, player.damage_dealt);
	stats.top_kills = Math.max(stats.top_kills, player.kills);
	stats.top_assists = Math.max(stats.top_assists, player.assists);
	stats.top_deaths = Math.max(stats.top_deaths, player.deaths);

	if ('top_rank_rating' in stats && stats.season !== 'Beta') {
		if (player.ranked_rating > stats.top_rank_rating) {
			stats.top_rank_rating = player.ranked_rating;
			stats.top_rank_id = player.rank_id;
		}
	}
}

/**
 * Finalizes extended stats by calculating averages and percentages.
 * @param extended_stats - The extended stats object to finalize.
 */
function finalizeExtendedStats(extended_stats: PlayerFullProfile['extended_stats']) {
	const finalizeStats = (stats: PlayerExtendedStats) => {
		const total_matches = stats.total_wins + stats.total_losses + stats.total_draws;
		stats.average_win_percentage = (stats.total_wins / total_matches) * 100;
		stats.average_damage_per_round = stats.total_damage_dealt / stats.total_rounds_played;
		stats.average_kills_per_round = stats.total_kills / stats.total_rounds_played;
		stats.average_assists_per_round = stats.total_assists / stats.total_rounds_played;
		stats.average_deaths_per_round = stats.total_deaths / stats.total_rounds_played;
	};
    if(extended_stats) {
        Object.values(extended_stats.season_stats).forEach(finalizeStats);
        Object.values(extended_stats.map_stats).forEach(finalizeStats);
        Object.values(extended_stats.sponsor_stats).forEach(finalizeStats);
        finalizeStats(extended_stats.last_20_matches_avg_stats);
    }
}

/**
 * Determines the season for a given match date.
 * @param matchDate - The date of the match.
 * @returns The season identifier as a string.
 */
function getSeason(matchDate: Date): string {
	const gameReleaseDate = new Date('2024-09-03');
	
	if (matchDate < gameReleaseDate) {
		return 'Beta';
	}

	const year = matchDate.getFullYear();
	const month = matchDate.getMonth();
	const dayOfMonth = matchDate.getDate();

	const monthsSinceRelease = (year - gameReleaseDate.getFullYear()) * 12 + month - gameReleaseDate.getMonth();
	const seasonNumber = Math.floor(monthsSinceRelease / 4);

	if (year === 2024 && month === 8 && dayOfMonth >= 3) {
		return '2024-S0';
	}

	return `${year}-S${seasonNumber}`;
}

/**
 * Initializes a season stats object.
 * @param season - The season identifier.
 * @returns An initialized SeasonStats object.
 */
function initializeSeasonStats(season: string): SeasonStats {
	return {
		...initializeExtendedStats(),
		season: season,
		top_rank_id: season === 'Beta' ? 'Beta' : '',
		top_rank_rating: 0
	};
}