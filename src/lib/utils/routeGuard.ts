import { goto } from '$app/navigation';
import { user, type UserProfile } from '$lib/stores/userStore';
import { hasPermission, canAccessResource } from '$lib/types/permissions';
import { showToast } from '$lib/stores/toastStore';
import type { UserRole } from '$lib/types/permissions';

export interface RouteGuard {
  permission?: string;
  resource?: string;
  action?: string;
  role?: UserRole;
  redirectTo?: string;
  message?: string;
}

function snapshotUser(): UserProfile | null {
  let val: UserProfile | null = null;
  user.subscribe((v) => (val = v))();
  return val;
}

export function checkRouteAccess(guard: RouteGuard): boolean {
  const currentUser = snapshotUser();

  // Input validation
  if (!guard || typeof guard !== 'object') {
    console.warn('Invalid route guard provided');
    return false;
  }

  if (!currentUser || !currentUser.permissions) {
    console.warn('Invalid user state');
    return false;
  }

  if (!currentUser.permissions.isActive) {
    return false;
  }

  if (guard.permission) {
    if (typeof guard.permission !== 'string') {
      console.warn('Invalid permission format');
      return false;
    }
    return hasPermission(currentUser.permissions, guard.permission);
  }

  if (guard.resource && guard.action) {
    if (typeof guard.resource !== 'string' || typeof guard.action !== 'string') {
      console.warn('Invalid resource/action format');
      return false;
    }
    return canAccessResource(currentUser.permissions, guard.resource, guard.action);
  }

  if (guard.role) {
    if (!['user', 'reseller', 'developer', 'admin'].includes(guard.role)) {
      console.warn('Invalid role specified');
      return false;
    }
    return currentUser.permissions.role === guard.role;
  }

  return true;
}

export function protectRoute(guard: RouteGuard): void {
  if (!checkRouteAccess(guard)) {
    const message = guard.message || 'You do not have permission to access this page';
    showToast({
      type: 'error',
      title: 'Access Denied',
      message,
    });
    goto(guard.redirectTo || '/');
  }
}

export function requireAuth(): void {
  const currentUser = snapshotUser();
  if (!currentUser?.username) {
    showToast({
      type: 'error',
      title: 'Authentication Required',
      message: 'Please sign in to access this page',
    });
    goto('/auth');
  }
}

export function requireRole(role: UserRole): void {
  const currentUser = snapshotUser();
  if (currentUser?.permissions?.role !== role) {
    showToast({
      type: 'error',
      title: 'Access Denied',
      message: `This page requires ${role} role`,
    });
    goto('/');
  }
}

export function requirePermission(permission: string): void {
  const currentUser = snapshotUser();
  if (!currentUser || !hasPermission(currentUser.permissions, permission)) {
    showToast({
      type: 'error',
      title: 'Access Denied',
      message: 'You do not have the required permission',
    });
    goto('/');
  }
}
