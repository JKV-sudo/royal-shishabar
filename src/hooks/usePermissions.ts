import { CookieAuthService } from '../services/cookieAuthService';
import { useAuthStore } from '../stores/authStore';

/**
 * Hook for fast permission checks using cookies
 * These checks are offline-capable and don't require Firestore calls
 */
export const usePermissions = () => {
  const { user, isAuthenticated } = useAuthStore();

  return {
    // Fast role checks from cookies (offline-capable)
    isAdmin: CookieAuthService.isAdmin(),
    isStaffOrAdmin: CookieAuthService.isStaffOrAdmin(),
    isAuthenticated: CookieAuthService.isAuthenticated(),
    userRole: CookieAuthService.getUserRole(),
    userId: CookieAuthService.getUserId(),
    userEmail: CookieAuthService.getUserEmail(),
    
    // Store-based checks (for reactive updates)
    storeIsAuthenticated: isAuthenticated,
    storeUser: user,
    
    // Permission check functions
    canAccessAdmin: () => CookieAuthService.isAdmin(),
    canManageOrders: () => CookieAuthService.isStaffOrAdmin(),
    canManageMenu: () => CookieAuthService.isAdmin(),
    canManageEvents: () => CookieAuthService.isAdmin(),
    canManageUsers: () => CookieAuthService.isAdmin(),
    canCreateReservations: () => CookieAuthService.isAuthenticated(),
    canViewAnalytics: () => CookieAuthService.isAdmin(),
    canManageTables: () => CookieAuthService.isAdmin(),
    canManageSpecialOffers: () => CookieAuthService.isAdmin(),
    
    // Utility functions
    requiresAuth: (action: string) => {
      if (!CookieAuthService.isAuthenticated()) {
        console.warn(`⚠️ Action "${action}" requires authentication`);
        return false;
      }
      return true;
    },
    
    requiresAdmin: (action: string) => {
      if (!CookieAuthService.isAdmin()) {
        console.warn(`⚠️ Action "${action}" requires admin privileges`);
        return false;
      }
      return true;
    },
    
    requiresStaffOrAdmin: (action: string) => {
      if (!CookieAuthService.isStaffOrAdmin()) {
        console.warn(`⚠️ Action "${action}" requires staff or admin privileges`);
        return false;
      }
      return true;
    },
    
    // Debug info
    getSessionInfo: () => CookieAuthService.getSessionInfo(),
  };
}; 