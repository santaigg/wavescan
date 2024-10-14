import { Redis } from "../redis";
import { validPlayerId } from "../player/player";

const QUEUE_KEY = 'wv:player_dump_queue';
const PRIORITY_QUEUE_KEY = 'wv:player_dump_priority_queue';
interface DumpPlayerResult {
    success: boolean;
    error?: string;
    error_code?: string;
    message?: string;
    queue_position?: number;
    is_priority?: boolean;
}

export async function dumpPlayer(playerId: string): Promise<DumpPlayerResult> {
    const lowerCasePlayerId = playerId.toLowerCase();
    if (!validPlayerId(lowerCasePlayerId)) {
        return { success: false, error: "Invalid player id" };
    }
    
    const client = Redis.getInstance().client;
    const cache_key = `wv:player_dump:${lowerCasePlayerId}`;
    const cached = await client.get(cache_key) as {
        id: string;
        last_updated: number;
        initially_dumped: boolean;
    } | null;

    // Check if player is already in either queue
    const inPriorityQueue = await client.lpos(PRIORITY_QUEUE_KEY, lowerCasePlayerId);
    const inRegularQueue = await client.lpos(QUEUE_KEY, lowerCasePlayerId);

    if (inPriorityQueue !== null || inRegularQueue !== null) {
        return { success: false, error: "Player is already in the dump queue!", error_code: "IN_QUEUE" };
    }

    if (cached) {
        if (Date.now() - cached.last_updated < 1800000 && !cached.initially_dumped) {
            return { success: false, error: "Player already dumped recently!" };
        }
        if (Date.now() - cached.last_updated < 600000 && cached.initially_dumped) {
            return { success: false, error: "Player already dumped recently!" };
        }
    }

    let queuePosition;
    let isPriority = false;

    if (cached?.initially_dumped) {
        // Player has been dumped before, add to priority queue
        queuePosition = await client.llen(PRIORITY_QUEUE_KEY);
        await client.rpush(PRIORITY_QUEUE_KEY, lowerCasePlayerId);
        isPriority = true;
    } else {
        // New player or never fully dumped, add to regular queue
        queuePosition = await client.llen(QUEUE_KEY);
        await client.rpush(QUEUE_KEY, lowerCasePlayerId);
    }
    
    await client.set(cache_key, {
        id: lowerCasePlayerId,
        last_updated: Date.now(),
        initially_dumped: cached ? cached.initially_dumped : false,
    });

    return {
        success: true,
        message: isPriority ? "Player added to priority dump queue." : "Player added to dump queue.",
        queue_position: queuePosition + 1,
        is_priority: isPriority
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