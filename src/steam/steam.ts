

function isValidSteamId(steamId: string): boolean {
    // Generate a regex to check STEAMID64
    const regex = new RegExp(/^(\d{17})$/);
    return regex.test(steamId);
}

/**
 * Get the player ID from a Steam ID
 * @param steamId - The Steam ID
 * @returns { success: boolean, error?: string, player_id?: string }
 */
export async function getPlayerIdFromSteamId(steamId: string): Promise<{ success: boolean, error?: string, player_id?: string }> {
    if (!isValidSteamId(steamId)) {
        return { success: false, error: "Invalid Steam ID" };
    }

    const steam_profile = await fetch(`https://collective-production.up.railway.app/getPlayerIdentityFromPlatform/STEAM/${steamId}`);
    const steam_profile_json = await steam_profile.json();

    if (steam_profile_json.error) {
        return { success: false, error: steam_profile_json.error };
    }  

    if (!steam_profile_json.playerId) {
        return { success: false, error: "Player ID not found" };
    }

    if(steam_profile_json.playerId === "ERROR") {
        return { success: false, error: "Player not found" };
    }

    return { success: true, player_id: steam_profile_json.playerId };
}