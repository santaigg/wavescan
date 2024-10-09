import { Database } from "../database";

const db = Database.getInstance();


export function validMatchId(matchId: string): boolean {
    // Checks if the match id is a valid UUID
    const uuidRegex = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/;
    return uuidRegex.test(matchId);
}

export async function getMatch(matchId: string) {
    const lowerCaseMatchId = matchId.toLowerCase();

    if (!validMatchId(lowerCaseMatchId)) {
        return { success: false, error: "Invalid match id" };
    }

    const { data, error } = await db.client
        .from('spectre_match')
        .select('*, spectre_match_team(*, spectre_match_player(*))')
        .eq('id', lowerCaseMatchId);

    if (error) {
        console.error(error);
        return { success: false, error: "Failed to fetch match data" };
    }

    return {
        success: true,
        match: data[0]
    }
}

export async function checkMatch(matchId: string) {
    const lowerCaseMatchId = matchId.toLowerCase();

    if (!validMatchId(lowerCaseMatchId)) {
        return { success: false, error: "Invalid match id" };
    }

    // Calls the game service to see if the match is ready for processing
    const getMatch = await fetch(`${process.env.SMOKESHIFT_APP_URL}/game-service/match-data/${lowerCaseMatchId}`);
    const match = await getMatch.json();

    if (match.error) {
        return { success: false, error: "Failed to fetch match data" };
    }
    if(match.spectre_match.queue_name === "PLACEHOLDER") {
        return { success: false, error: "Match is not ready for processing" };
    }

    return {
        success: true,
        game_service_response: match
    }
}

export async function addMatch(matchId: string) {
    const lowerCaseMatchId = matchId.toLowerCase();

    if (!validMatchId(lowerCaseMatchId)) {
        return { success: false, error: "Invalid match id" };
    }

    // Checks if the match exists, if not it will call the game service to add the match
    const matchExistsInGameService = await checkMatch(lowerCaseMatchId);
    if (matchExistsInGameService.success) {
        return { success: true, game_service_response: matchExistsInGameService.game_service_response };
    }

    const addMatch = await fetch(`${process.env.SMOKESHIFT_APP_URL}/data-dump-service/dump-match/${lowerCaseMatchId}`);
    const match = await addMatch.json();

    if (match.error) {
        return { success: false, error: "Failed to add match" };
    }

    return {
        success: true,
        data_dump_service_response: match
    }
}
