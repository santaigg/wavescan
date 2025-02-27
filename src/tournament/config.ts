/**
 * Tournament module configuration
 */

export const config = {
  // Admin authentication
  adminCookieName: process.env.ADMIN_COOKIE_NAME || 'optic_tournament_admin',
  adminTokenValue: process.env.ADMIN_TOKEN_VALUE || 'optic-admin-token',
  adminPassword: process.env.ADMIN_PASSWORD || 'opticadmin',
  
  // Redis cache
  tournamentKeyPrefix: process.env.TOURNAMENT_KEY_PREFIX || 'wv:tournament:data:',
  cacheTTL: parseInt(process.env.TOURNAMENT_CACHE_TTL || '86400', 10), // 1 day in seconds
}; 