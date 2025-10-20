import { get } from 'svelte/store';
import { user } from '$lib/stores/userStore';
import * as secure from '$lib/utils/secureStorage';

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  chain?: { prevHash: string | null; hash: string };
}

export class AuditLogger {
  private static instance: AuditLogger;
  private events: AuditEvent[] = [];
  private loaded = false;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  private async ensureLoaded() {
    if (this.loaded) return;
    try {
      const existing = await secure.getItem<AuditEvent[]>('rubi_audit_log.secure');
      if (existing && Array.isArray(existing)) this.events = existing;
    } catch {}
    this.loaded = true;
  }

  async logEvent(
    action: string,
    resource: string,
    details: Record<string, unknown> = {},
  ): Promise<void> {
    await this.ensureLoaded();
    const currentUserValue = get(user);
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userId:
        currentUserValue && currentUserValue.username ? currentUserValue.username : 'anonymous',
      action,
      resource,
      details: {
        ...details,
        userRole: currentUserValue ? currentUserValue.permissions.role : 'unknown',
        userPermissions: currentUserValue ? currentUserValue.permissions.permissions : [],
      },
    };

    // Hash chain
    const prev = this.events[this.events.length - 1];
    const prevHash = prev?.chain?.hash || null;
    const hash = await this.computeHash({ ...event, chain: { prevHash, hash: '' } });
    event.chain = { prevHash, hash };

    this.events.push(event);
    await this.persistEvent();

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('🔒 Audit Event:', event);
    }
  }

  private async persistEvent(): Promise<void> {
    try {
      const logs = this.events.slice(-1000);
      await secure.setItem('rubi_audit_log.secure', logs);
      // cleanup legacy plaintext
      localStorage.removeItem('rubi_audit_log');
    } catch (error) {
      console.error('Failed to persist audit event:', error);
    }
  }

  private async computeHash(obj: unknown): Promise<string> {
    const data = JSON.stringify(obj);
    const enc = new TextEncoder().encode(data);
    const digest = await crypto.subtle.digest('SHA-256', enc);
    const bytes = new Uint8Array(digest);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
    return hex;
  }

  getEvents(limit = 100): AuditEvent[] {
    return this.events.slice(-limit);
  }

  getEventsByUser(userId: string): AuditEvent[] {
    return this.events.filter((event) => event.userId === userId);
  }

  getEventsByAction(action: string): AuditEvent[] {
    return this.events.filter((event) => event.action === action);
  }

  async clearEvents(): Promise<void> {
    this.events = [];
    await secure.setItem('rubi_audit_log.secure', this.events);
    localStorage.removeItem('rubi_audit_log');
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance();

// Predefined audit actions
export const AUDIT_ACTIONS = {
  LOGIN: 'user.login',
  LOGOUT: 'user.logout',
  PERMISSION_CHANGE: 'permission.change',
  ROLE_CHANGE: 'role.change',
  ADMIN_ACCESS: 'admin.access',
  LICENSE_ADD: 'license.add',
  LICENSE_REMOVE: 'license.remove',
  CHEAT_ACCESS: 'cheat.access',
  SETTINGS_CHANGE: 'settings.change',
} as const;
