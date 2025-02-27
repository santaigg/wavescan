import Cookies from 'js-cookie';
import { AdminAuthResult } from './tournament.types';
import { config } from './config';

/**
 * Check if the user is authenticated as an admin
 * @returns boolean indicating if the user is authenticated
 */
export function isAdminAuthenticated(): boolean {
  // Check for the admin cookie
  const adminToken = Cookies.get(config.adminCookieName);
  
  return adminToken === config.adminTokenValue;
}

/**
 * Authenticate the user as an admin
 * @param password The admin password
 * @returns AdminAuthResult object with success status and optional message
 */
export function authenticateAdmin(password: string): AdminAuthResult {
  if (password === config.adminPassword) {
    // Set the admin cookie with a 24-hour expiration
    Cookies.set(config.adminCookieName, config.adminTokenValue, { expires: 1 });
    return { 
      success: true,
      message: 'Authentication successful'
    };
  }
  
  return { 
    success: false,
    message: 'Invalid password'
  };
}

/**
 * Log out the admin user
 * @returns AdminAuthResult object with success status and optional message
 */
export function logoutAdmin(): AdminAuthResult {
  try {
    Cookies.remove(config.adminCookieName);
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error logging out'
    };
  }
}

/**
 * Get the current admin token
 * @returns The admin token or null if not authenticated
 */
export function getAdminToken(): string | null {
  return Cookies.get(config.adminCookieName) || null;
} 