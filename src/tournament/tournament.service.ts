import { Database } from "../database";
import { Redis } from "../redis";
import { Tournament } from "./tournament.types";
import { isAdminAuthenticated } from "./admin";

const db = Database.getInstance();
const redis = Redis.getInstance().client;

const CACHE_KEY_PREFIX = 'wv:tournament:';
const CACHE_TTL = 3600; // 1 hour in seconds

/**
 * Get a tournament by ID
 * @param id Tournament ID
 * @returns Object containing tournament data or error
 */
export async function getTournament(id: string): Promise<{ success: boolean, tournament?: Tournament, error?: string }> {
    try {
        // Try to get from cache first
        const cacheKey = `${CACHE_KEY_PREFIX}${id}`;
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log('Cache hit for tournament data');
                return { 
                    success: true, 
                    tournament: typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData 
                };
            }
            console.log('Cache miss for tournament data');
        } catch (cacheError) {
            console.error('Error accessing Redis cache:', cacheError);
            // Continue without cache
        }

        // Get tournament data from database
        const { data, error } = await db.client
            .from("spectre_tournament")
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error getting tournament data:', error);
            return { success: false, error: error.message || "Failed to retrieve tournament data" };
        }

        if (!data) {
            return { success: false, error: "Tournament not found" };
        }

        const tournament: Tournament = {
            id: data.id,
            name: data.name,
            description: data.description,
            start_date: data.start_date,
            end_date: data.end_date,
            status: data.status,
            is_public: data.is_public
        };

        // Cache the result
        try {
            await redis.set(cacheKey, JSON.stringify(tournament), {ex: CACHE_TTL});
        } catch (cacheError) {
            console.error('Error caching tournament data:', cacheError);
            // Continue without caching
        }

        return { success: true, tournament };
    } catch (error: any) {
        console.error('Error getting tournament data:', error);
        return { success: false, error: error?.message || 'Unknown error occurred' };
    }
}

/**
 * Get all tournaments
 * @param includePrivate Whether to include private tournaments (requires admin authentication)
 * @returns Object containing tournaments data or error
 */
export async function getAllTournaments(includePrivate: boolean = false): Promise<{ success: boolean, tournaments?: Tournament[], error?: string }> {
    try {
        // Check if user is requesting private tournaments and has admin access
        if (includePrivate && !isAdminAuthenticated()) {
            return { success: false, error: "Unauthorized access to private tournaments" };
        }

        // Try to get from cache first
        const cacheKey = `${CACHE_KEY_PREFIX}all:${includePrivate ? 'with-private' : 'public-only'}`;
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                console.log('Cache hit for tournaments list');
                return { 
                    success: true, 
                    tournaments: typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData 
                };
            }
            console.log('Cache miss for tournaments list');
        } catch (cacheError) {
            console.error('Error accessing Redis cache:', cacheError);
            // Continue without cache
        }

        // Build query
        let query = db.client
            .from("spectre_tournament")
            .select('*');
        
        // Filter out private tournaments for non-admin users
        if (!includePrivate) {
            query = query.eq('is_public', true);
        }

        // Execute query
        const { data, error } = await query;

        if (error) {
            console.error('Error getting tournaments list:', error);
            return { success: false, error: error.message || "Failed to retrieve tournaments list" };
        }

        if (!data || data.length === 0) {
            return { success: true, tournaments: [] };
        }

        const tournaments: Tournament[] = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            start_date: item.start_date,
            end_date: item.end_date,
            status: item.status,
            is_public: item.is_public
        }));

        // Cache the result
        try {
            await redis.set(cacheKey, JSON.stringify(tournaments), {ex: CACHE_TTL});
        } catch (cacheError) {
            console.error('Error caching tournaments list:', cacheError);
            // Continue without caching
        }

        return { success: true, tournaments };
    } catch (error: any) {
        console.error('Error getting tournaments list:', error);
        return { success: false, error: error?.message || 'Unknown error occurred' };
    }
} 