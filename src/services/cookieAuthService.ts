import Cookies from 'js-cookie';
import { User } from '../stores/authStore';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  isAuthenticated: boolean;
  sessionExpiry: number;
  lastUpdated: number;
}

export class CookieAuthService {
  private static readonly COOKIE_NAME = 'royal_session';
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  private static readonly REFRESH_THRESHOLD = 24 * 60 * 60 * 1000; // Refresh if older than 1 day
  // Add a flag to control logging
  private static readonly DEBUG_MODE = false; // Set to false in production

  /**
   * Save user session to secure cookie
   */
  static saveSession(user: User): void {
    try {
      const session: UserSession = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        isAuthenticated: true,
        sessionExpiry: Date.now() + this.SESSION_DURATION,
        lastUpdated: Date.now(),
      };

      // Save to secure cookie with SameSite and Secure flags
      Cookies.set(this.COOKIE_NAME, JSON.stringify(session), {
        expires: 7, // 7 days
        secure: window.location.protocol === 'https:', // Only secure in production
        sameSite: 'strict',
        httpOnly: false, // Client-side access needed
      });

      if (this.DEBUG_MODE) {
        console.log('🍪 Session saved to cookie:', { userId: user.id, role: user.role });
      }
    } catch (error) {
      console.error('❌ Failed to save session to cookie:', error);
    }
  }

  /**
   * Load user session from cookie
   */
  static loadSession(): UserSession | null {
    try {
      const cookieData = Cookies.get(this.COOKIE_NAME);
      if (!cookieData) {
        if (this.DEBUG_MODE) {
          console.log('🍪 No session cookie found');
        }
        return null;
      }

      const session: UserSession = JSON.parse(cookieData);

      // Check if session is expired
      if (Date.now() > session.sessionExpiry) {
        if (this.DEBUG_MODE) {
          console.log('🍪 Session expired, clearing cookie');
        }
        this.clearSession();
        return null;
      }

      if (this.DEBUG_MODE) {
        console.log('🍪 Session loaded from cookie:', { 
          userId: session.userId, 
          role: session.role,
          expiresIn: Math.round((session.sessionExpiry - Date.now()) / (1000 * 60 * 60)) + 'h'
        });
      }
      
      return session;
    } catch (error) {
      console.error('❌ Failed to load session from cookie:', error);
      this.clearSession(); // Clear corrupted cookie
      return null;
    }
  }

  /**
   * Convert session to User object
   */
  static sessionToUser(session: UserSession): User {
    return {
      id: session.userId,
      email: session.email,
      name: session.name,
      role: session.role,
      phone: session.phone,
      avatar: session.avatar,
      createdAt: new Date(session.lastUpdated),
    };
  }

  /**
   * Check if session needs to be refreshed from Firestore
   */
  static shouldRefreshSession(session: UserSession): boolean {
    const timeSinceUpdate = Date.now() - session.lastUpdated;
    return timeSinceUpdate > this.REFRESH_THRESHOLD;
  }

  /**
   * Update session with fresh data
   */
  static updateSession(updates: Partial<UserSession>): void {
    const currentSession = this.loadSession();
    if (!currentSession) return;

    const updatedSession: UserSession = {
      ...currentSession,
      ...updates,
      lastUpdated: Date.now(),
    };

    Cookies.set(this.COOKIE_NAME, JSON.stringify(updatedSession), {
      expires: 7,
      secure: window.location.protocol === 'https:',
      sameSite: 'strict',
      httpOnly: false,
    });

    console.log('🍪 Session updated:', updates);
  }

  /**
   * Clear session cookie (logout)
   */
  static clearSession(): void {
    Cookies.remove(this.COOKIE_NAME);
    console.log('🍪 Session cleared');
  }

  /**
   * Get user role from cookie (fast, offline-capable)
   */
  static getUserRole(): string | null {
    const session = this.loadSession();
    return session?.role || null;
  }

  /**
   * Check if user is admin (fast, offline-capable)
   */
  static isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin';
  }

  /**
   * Check if user is staff or admin (fast, offline-capable)
   */
  static isStaffOrAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'admin' || role === 'staff';
  }

  /**
   * Check if user is authenticated (fast, offline-capable)
   */
  static isAuthenticated(): boolean {
    const session = this.loadSession();
    return session?.isAuthenticated || false;
  }

  /**
   * Get user ID from cookie
   */
  static getUserId(): string | null {
    const session = this.loadSession();
    return session?.userId || null;
  }

  /**
   * Get user email from cookie
   */
  static getUserEmail(): string | null {
    const session = this.loadSession();
    return session?.email || null;
  }

  /**
   * Extend session expiry (when user is active)
   */
  static extendSession(): void {
    const session = this.loadSession();
    if (!session) return;

    this.updateSession({
      sessionExpiry: Date.now() + this.SESSION_DURATION,
    });
  }

  /**
   * Get session info for debugging
   */
  static getSessionInfo(): Partial<UserSession> | null {
    const session = this.loadSession();
    if (!session) return null;

    return {
      userId: session.userId,
      email: session.email,
      role: session.role,
      isAuthenticated: session.isAuthenticated,
      sessionExpiry: session.sessionExpiry,
      lastUpdated: session.lastUpdated,
    };
  }
} 