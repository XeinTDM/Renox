import { get } from 'svelte/store';
import { user } from '../stores/userStore';
import { showToast } from '../stores/toastStore';
import { ROLES, type UserRole } from '../types/permissions';

const OFFLINE_SESSION_KEY = 'rubi_offline_session';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export interface OfflineSession {
  userId: string;
  role: UserRole | string;
  lastActivity: number;
  loginAttempts: number;
  lockoutUntil?: number;
  deviceId: string;
}

export class OfflineSecurityManager {
  private static instance: OfflineSecurityManager;
  private sessionTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.startOfflineMonitoring();
  }

  static getInstance(): OfflineSecurityManager {
    if (!OfflineSecurityManager.instance) {
      OfflineSecurityManager.instance = new OfflineSecurityManager();
    }
    return OfflineSecurityManager.instance;
  }

  private startOfflineMonitoring(): void {
    // Check session every 10 minutes for offline app
    this.sessionTimer = setInterval(
      () => {
        this.validateOfflineSession();
      },
      10 * 60 * 1000,
    );
  }

  private validateOfflineSession(): void {
    const currentUserValue = get(user);
    if (!currentUserValue || !currentUserValue.username) return;

    const sessionData = this.getOfflineSession();
    if (!sessionData) {
      this.logout();
      return;
    }

    const now = Date.now();

    // Check if user is locked out
    if (sessionData.lockoutUntil && now < sessionData.lockoutUntil) {
      const remainingTime = Math.ceil((sessionData.lockoutUntil - now) / 60000);
      showToast({
        type: 'error',
        title: 'Account Locked',
        message: `Too many failed attempts. Try again in ${remainingTime} minutes.`,
      });
      this.logout();
      return;
    }

    // Update last activity
    this.updateOfflineSession();
  }

  private getOfflineSession(): OfflineSession | null {
    try {
      const data = localStorage.getItem(OFFLINE_SESSION_KEY);
      return data ? (JSON.parse(data) as OfflineSession) : null;
    } catch {
      return null;
    }
  }

  private updateOfflineSession(): void {
    const currentUserValue = get(user);
    if (!currentUserValue || !currentUserValue.username) return;

    const sessionData: OfflineSession = {
      userId: currentUserValue.username,
      role: currentUserValue.permissions.role as UserRole,
      lastActivity: Date.now(),
      loginAttempts: 0,
      deviceId: this.getDeviceId(),
    };

    localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(sessionData));
  }

  private getDeviceId(): string {
    let deviceId = localStorage.getItem('rubi_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('rubi_device_id', deviceId);
    }
    return deviceId;
  }

  public validateLogin(username: string): boolean {
    const sessionData = this.getOfflineSession();

    // Check if account is locked
    if (sessionData?.lockoutUntil && Date.now() < sessionData.lockoutUntil) {
      return false;
    }

    // For offline app, we'll use a simple validation
    const validUsers = this.getValidUsers();
    const u = validUsers.find((u) => u.username === username);

    if (!u) {
      this.recordFailedAttempt();
      return false;
    }

    // Reset failed attempts on successful login
    this.resetFailedAttempts();
    return true;
  }

  private getValidUsers(): Array<{ username: string; role: UserRole }> {
    // In a real offline app, this would be stored securely
    return [
      { username: 'admin', role: 'admin' },
      { username: 'developer', role: 'developer' },
      { username: 'reseller', role: 'reseller' },
      { username: 'user', role: 'user' },
    ];
  }

  private recordFailedAttempt(): void {
    const existing = this.getOfflineSession() || ({ loginAttempts: 0 } as OfflineSession);
    const sessionData: OfflineSession = {
      userId: existing.userId || 'unknown',
      role: (existing.role as UserRole) || 'user',
      lastActivity: existing.lastActivity || Date.now(),
      loginAttempts: (existing.loginAttempts || 0) + 1,
      deviceId: existing.deviceId || this.getDeviceId(),
      lockoutUntil: existing.lockoutUntil,
    };

    if (sessionData.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      sessionData.lockoutUntil = Date.now() + LOCKOUT_DURATION;
      showToast({
        type: 'error',
        title: 'Account Locked',
        message: 'Too many failed attempts. Account locked for 30 minutes.',
      });
    }

    localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(sessionData));
  }

  private resetFailedAttempts(): void {
    const existing = this.getOfflineSession();
    if (existing) {
      existing.loginAttempts = 0;
      delete existing.lockoutUntil;
      localStorage.setItem(OFFLINE_SESSION_KEY, JSON.stringify(existing));
    }
  }

  private logout(): void {
    user.logout();
    localStorage.removeItem(OFFLINE_SESSION_KEY);
    if (typeof window !== 'undefined') {
      window.location.assign('/auth');
    }
  }

  public destroy(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Offline permission validation
  public validateOfflinePermission(permission: string): boolean {
    const currentUserValue = get(user);
    if (
      !currentUserValue ||
      !currentUserValue.permissions ||
      !currentUserValue.permissions.isActive
    )
      return false;

    const role = currentUserValue.permissions.role as UserRole;
    const rolePermissions = ROLES[role]?.permissions || ([] as string[]);

    return rolePermissions.indexOf(permission) !== -1;
  }

  // Local data encryption for sensitive information
  // Deprecated XOR helpers removed. Use secureStorage or crypto AES-GCM helpers instead.
}

// Export singleton instance
export const offlineSecurity = OfflineSecurityManager.getInstance();
