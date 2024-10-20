import { Database } from "../database";

const db = Database.getInstance();

export async function searchPlayer(playerName: string, limit = 10, offset = 0, partial = false) {
	// Full Text Search on display_name column in spectre_player table
    if(!partial) {
        const { data, error } = await db.client.from("spectre_player").select("*").textSearch("display_name", `${playerName}`).range(offset, offset + limit);
        if (error) {
            return { error: error.message };
        }
        return { data };
    }
    const { data, error } = await db.client.rpc('search_players_by_display_name', { name: playerName });
    if (error) {
        return { error: error.message };
    }
    return { data };
}
