import { writable, get } from 'svelte/store';
import type { UserRole, UserPermissions } from '../types/permissions';
import { ROLES, hasPermission, canAccessResource } from '../types/permissions';
import * as secure from '../utils/secureStorage';

export interface UserProfile {
  username: string | null;
  licenses: string[];
  permissions: UserPermissions;
}

const storageKey = 'userProfile.secure';
const browser = typeof window !== 'undefined';

function createPersistentUserStore() {
  let initialValue: UserProfile = {
    username: null,
    licenses: [],
    permissions: {
      role: 'user',
      permissions: ROLES.user.permissions,
      isActive: true,
    },
  };

  // Initial value is default; we asynchronously hydrate below

  const { subscribe, set, update } = writable<UserProfile>(initialValue);

  return {
    subscribe,
    set: (value: UserProfile) => {
      if (browser) {
        secure.setItem(storageKey, value);
      }
      set(value);
    },
    update: (fn: (value: UserProfile) => UserProfile) => {
      update((currentValue) => {
        const newValue = fn(currentValue);
        if (browser) {
          secure.setItem(storageKey, newValue);
        }
        return newValue;
      });
    },
    // Async hydrate secure profile on startup/mount
    hydrate: () => {
      if (!browser) return;
      secure
        .getItem<UserProfile>(storageKey)
        .then((secureValue) => {
          let parsed: UserProfile | null = secureValue;
          if (!parsed) {
            const legacy = localStorage.getItem('userProfile');
            if (legacy) {
              parsed = JSON.parse(legacy);
              secure.setItem(storageKey, parsed);
              localStorage.removeItem('userProfile');
            }
          }
          if (parsed) {
            if (!parsed.permissions) {
              parsed.permissions = {
                role: 'user',
                permissions: ROLES.user.permissions,
                isActive: true,
              };
            }
            const roleKey = (parsed.permissions.role as UserRole) ?? 'user';
            if (!ROLES[roleKey]) {
              parsed.permissions = {
                role: 'user',
                permissions: ROLES.user.permissions,
                isActive: true,
              };
            }
            const expectedPermissions = ROLES[roleKey].permissions;
            const hasValidPermissions = (parsed.permissions.permissions as string[]).every(
              (p: string) => expectedPermissions.indexOf(p) !== -1,
            );
            if (!hasValidPermissions) {
              parsed.permissions.permissions = expectedPermissions;
            }
            set(parsed as UserProfile);
          }
        })
        .catch((e) => {
          console.error('Failed to hydrate secure user profile', e);
        });
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem('userProfile');
        secure.removeItem(storageKey);
        localStorage.removeItem('rubi_offline_session');
      }
      set({
        username: null,
        licenses: [],
        permissions: {
          role: 'user',
          permissions: ROLES.user.permissions,
          isActive: true,
        },
      });
    },
    // Permission helper methods
    hasPermission: (permissionId: string) => {
      const currentUser = get(user);
      return currentUser ? hasPermission(currentUser.permissions, permissionId) : false;
    },
    canAccessResource: (resource: string, action: string) => {
      const currentUser = get(user);
      return currentUser ? canAccessResource(currentUser.permissions, resource, action) : false;
    },
    updateRole: (role: UserRole) => {
      // Only allow role changes if user has role management permission
      let currentUser: UserProfile | undefined;
      subscribe((value) => {
        currentUser = value;
      })();
      if (!currentUser || !hasPermission(currentUser.permissions, 'role:manage')) {
        console.warn('Unauthorized role change attempt');
        return;
      }

      update((currentValue) => ({
        ...currentValue,
        permissions: {
          ...currentValue.permissions,
          role,
          permissions: ROLES[role].permissions,
        },
      }));
    },
  };
}

export const user = createPersistentUserStore();
