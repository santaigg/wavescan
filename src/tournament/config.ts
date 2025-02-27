/**
 * Tournament module configuration
 */

export const config = {
  // Admin authentication
  adminCookieName: process.env.ADMIN_COOKIE_NAME,
  adminTokenValue: process.env.ADMIN_TOKEN_VALUE,
  adminPassword: process.env.ADMIN_PASSWORD,
  
  // Redis cache
  tournamentKeyPrefix: process.env.TOURNAMENT_KEY_PREFIX || 'wv:tournament:data:',
  cacheTTL: parseInt(process.env.TOURNAMENT_CACHE_TTL || '86400', 10), // 1 day in seconds
}; 