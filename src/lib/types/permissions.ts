export type UserRole = 'user' | 'reseller' | 'developer' | 'admin';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface Role {
  id: UserRole;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs
}

export interface UserPermissions {
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  expiresAt?: string;
}

// Define all available permissions
export const PERMISSIONS: Record<string, Permission> = {
  // User permissions
  'cheat:view': {
    id: 'cheat:view',
    name: 'View Cheats',
    description: 'Can view available cheats',
    resource: 'cheat',
    action: 'view',
  },
  'cheat:launch': {
    id: 'cheat:launch',
    name: 'Launch Cheats',
    description: 'Can launch cheats',
    resource: 'cheat',
    action: 'launch',
  },
  'license:view': {
    id: 'license:view',
    name: 'View Licenses',
    description: 'Can view own licenses',
    resource: 'license',
    action: 'view',
  },
  'license:add': {
    id: 'license:add',
    name: 'Add Licenses',
    description: 'Can add licenses to account',
    resource: 'license',
    action: 'add',
  },

  // Reseller permissions
  'cheat:manage': {
    id: 'cheat:manage',
    name: 'Manage Cheats',
    description: 'Can manage cheat status and settings',
    resource: 'cheat',
    action: 'manage',
  },
  'user:view': {
    id: 'user:view',
    name: 'View Users',
    description: 'Can view user accounts',
    resource: 'user',
    action: 'view',
  },
  'license:manage': {
    id: 'license:manage',
    name: 'Manage Licenses',
    description: 'Can create and manage licenses',
    resource: 'license',
    action: 'manage',
  },
  'sales:view': {
    id: 'sales:view',
    name: 'View Sales',
    description: 'Can view sales data',
    resource: 'sales',
    action: 'view',
  },

  // Developer permissions
  'cheat:create': {
    id: 'cheat:create',
    name: 'Create Cheats',
    description: 'Can create new cheats',
    resource: 'cheat',
    action: 'create',
  },
  'cheat:delete': {
    id: 'cheat:delete',
    name: 'Delete Cheats',
    description: 'Can delete cheats',
    resource: 'cheat',
    action: 'delete',
  },
  'reseller:manage': {
    id: 'reseller:manage',
    name: 'Manage Resellers',
    description: 'Can manage reseller accounts',
    resource: 'reseller',
    action: 'manage',
  },
  'system:settings': {
    id: 'system:settings',
    name: 'System Settings',
    description: 'Can modify system settings',
    resource: 'system',
    action: 'settings',
  },

  // Admin permissions
  'user:manage': {
    id: 'user:manage',
    name: 'Manage Users',
    description: 'Can manage all user accounts',
    resource: 'user',
    action: 'manage',
  },
  'role:manage': {
    id: 'role:manage',
    name: 'Manage Roles',
    description: 'Can manage user roles and permissions',
    resource: 'role',
    action: 'manage',
  },
  'system:admin': {
    id: 'system:admin',
    name: 'System Administration',
    description: 'Full system administration access',
    resource: 'system',
    action: 'admin',
  },
};

// Define roles with their permissions
export const ROLES: Record<UserRole, Role> = {
  user: {
    id: 'user',
    name: 'User',
    description: 'Standard user with basic access',
    permissions: ['cheat:view', 'cheat:launch', 'license:view', 'license:add'],
  },
  reseller: {
    id: 'reseller',
    name: 'Reseller',
    description: 'Reseller with management capabilities',
    permissions: [
      'cheat:view',
      'cheat:launch',
      'cheat:manage',
      'license:view',
      'license:add',
      'license:manage',
      'user:view',
      'sales:view',
    ],
  },
  developer: {
    id: 'developer',
    name: 'Developer',
    description: 'Cheat developer with full cheat management',
    permissions: [
      'cheat:view',
      'cheat:launch',
      'cheat:manage',
      'cheat:create',
      'cheat:delete',
      'license:view',
      'license:add',
      'license:manage',
      'user:view',
      'reseller:manage',
      'system:settings',
    ],
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system administrator',
    permissions: Object.keys(PERMISSIONS),
  },
};

// Helper functions
export function hasPermission(userPermissions: UserPermissions, permissionId: string): boolean {
  if (!userPermissions.isActive) return false;
  if (userPermissions.expiresAt && new Date(userPermissions.expiresAt) < new Date()) return false;
  return userPermissions.permissions.includes(permissionId);
}

export function hasRole(userPermissions: UserPermissions, role: UserRole): boolean {
  return userPermissions.role === role;
}

export function getRolePermissions(role: UserRole): string[] {
  return ROLES[role]?.permissions || [];
}

export function canAccessResource(
  userPermissions: UserPermissions,
  resource: string,
  action: string,
): boolean {
  const permissionId = `${resource}:${action}`;
  return hasPermission(userPermissions, permissionId);
}
