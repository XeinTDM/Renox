import { get } from 'svelte/store';
import { user } from '$lib/stores/userStore';
import { goto } from '$app/navigation';
import { showToast } from '$lib/stores/toastStore';
import * as secure from '$lib/utils/secureStorage';

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_KEY = 'rubi_session.secure';

export interface SessionData {
  lastActivity: number;
  userId: string;
  role: string;
}

export class SessionManager {
  private static instance: SessionManager;
  private sessionTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.startSessionMonitoring();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private startSessionMonitoring(): void {
    // Check session every 5 minutes
    this.sessionTimer = setInterval(
      () => {
        // fire-and-forget async validation
        this.validateSession();
      },
      5 * 60 * 1000,
    );
  }

  private async validateSession(): Promise<void> {
    const currentUserValue = get(user);
    if (!currentUserValue || !currentUserValue.username) return;

    const sessionData = await this.getSessionData();
    if (!sessionData) {
      this.logout();
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - sessionData.lastActivity;

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      showToast({
        type: 'error',
        title: 'Session Expired',
        message: 'Your session has expired. Please sign in again.',
      });
      this.logout();
      return;
    }

    // Update last activity
    this.updateSessionActivity();
  }

  private async getSessionData(): Promise<SessionData | null> {
    try {
      const value = await secure.getItem<SessionData>(SESSION_KEY);
      if (value) return value;
      const legacy = localStorage.getItem('rubi_session');
      if (legacy) {
        const parsed = JSON.parse(legacy) as SessionData;
        await secure.setItem(SESSION_KEY, parsed);
        localStorage.removeItem('rubi_session');
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  }

  private updateSessionActivity(): void {
    const currentUserValue = get(user);
    if (!currentUserValue || !currentUserValue.username) return;

    const sessionData: SessionData = {
      lastActivity: Date.now(),
      userId: currentUserValue.username,
      role: currentUserValue.permissions.role,
    };

    // persist securely
    secure.setItem(SESSION_KEY, sessionData);
  }

  private logout(): void {
    user.logout();
    secure.removeItem(SESSION_KEY);
    goto('/auth');
  }

  public updateActivity(): void {
    this.updateSessionActivity();
  }

  public destroy(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();
