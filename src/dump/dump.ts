import { Redis } from "../redis";
import { validPlayerId } from "../player/player";
export async function dumpPlayer(playerId: string) {
    const lowerCasePlayerId = playerId.toLowerCase();

    // Validate the player id
    if (!validPlayerId(lowerCasePlayerId)) {
        return {
            success: false,
            error: "Invalid player id"
        }
    }
    
    const client = Redis.getInstance().client;
    
    const cache_key = `player_dump:${lowerCasePlayerId}`;
    const cached = await client.get(cache_key) as {
        id: string;
        last_updated: number;
        initially_dumped: boolean;
        in_progress: boolean;
    } | null;
    if (cached && cached !== null) {
        // If the player is currently being dumped, return an error.
        if (cached.in_progress) {
            return {
                success: false,
                error: "Player is currently being dumped!",
                error_code: "IN_PROGRESS"
            }
        }
        // Check cache expiration. 
        // If it's been less than 30 minutes and the player was not initially dumped, do nothing.
        if (Date.now() - cached.last_updated < 1800000 && cached.initially_dumped === false) {
            return {
                success: false,
                error: "Player already dumped recently!"
            }
        }

        // If it's been less than 10 minutes and the player was initially dumped, do nothing.
        if (Date.now() - cached.last_updated >= 600000 && cached.initially_dumped === true) {
            return {
                success: false,
                error: "Player already dumped recently!"
            }
        }
    }

    // If the cache doesn't exist, create it with initially_dumped set to false.
    if (!cached) {
        await client.set(cache_key, {
            id: lowerCasePlayerId,
            last_updated: Date.now(),
            initially_dumped: false,
            in_progress: true,
        });
    } else {
        await client.set(cache_key, {
        ...cached,
            in_progress: true,
        });
    }

    // Start the dump process asynchronously
    dumpPlayerAsync(lowerCasePlayerId, cache_key);

    return {
        success: true,
        message: "Dump process initiated. It may take some time to complete."
    };
    
}

async function dumpPlayerAsync(playerId: string, cache_key: string) {
    const client = Redis.getInstance().client;
    try {
        const dump_player_res = await fetch(`${process.env.SMOKESHIFT_APP_URL}/data-dump-service/dump-player-matches/${playerId}`);
        const dump_player = await dump_player_res.json();

        if (dump_player?.success) {
            await client.set(cache_key, {
                id: playerId,
                last_updated: Date.now(),
                initially_dumped: true,
                in_progress: false,
            });
        }
    } catch (error) {
        console.error(`Error dumping player ${playerId}:`, error);
    }
}