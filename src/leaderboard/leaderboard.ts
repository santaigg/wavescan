import { Database } from "../database";
import { Redis } from "../redis";

const db = Database.getInstance();
const redis = Redis.getInstance().client;

const CACHE_KEY_PREFIX = 'wv:solo_ranked_leaderboard';
const CACHE_TTL = 600; // 10 minutes in seconds

export async function getSoloRankedLeaderboard(season?: number) {
    // Create a cache key that includes the season if provided
    const CACHE_KEY = season !== undefined ? `${CACHE_KEY_PREFIX}:season:${season}` : CACHE_KEY_PREFIX;
    
    // Try to get the leaderboard from cache
    const cachedLeaderboard = await redis.get(CACHE_KEY);

    if (cachedLeaderboard) {
        console.log(`Cache hit for solo ranked leaderboard${season !== undefined ? ` for season ${season}` : ''}`);
        return { leaderboard: typeof cachedLeaderboard === 'string' ? JSON.parse(cachedLeaderboard) : cachedLeaderboard };
    }

    // If not in cache, fetch from database
    const { data, error } = await db.client.rpc(
        'get_solo_ranked_leaderboard', 
        season !== undefined ? { season } : {}
    );

    if (error) {
        return { error: error.message };
    }

    const leaderboard = data.map((player: any, index: number) => ({
        ...player,
        rank: index + 1
    }));

    // Cache the result
    await redis.set(CACHE_KEY, JSON.stringify(leaderboard), {ex: CACHE_TTL});

    return { leaderboard };
}