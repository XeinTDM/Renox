import { get } from 'svelte/store';
import { user } from '$lib/stores/userStore';
import { ROLES, PERMISSIONS, hasPermission, canAccessResource } from '$lib/types/permissions';
import type { UserRole } from '$lib/types/permissions';

export function testPermissions() {
  console.log('🧪 Testing Permissions System...');

  // Test role definitions
  console.log('📋 Available Roles:');
  Object.entries(ROLES).forEach(([roleId, role]) => {
    console.log(`  - ${role.name} (${roleId}): ${role.permissions.length} permissions`);
  });

  // Test permission definitions
  console.log('🔐 Available Permissions:');
  Object.entries(PERMISSIONS).forEach(([permissionId, permission]) => {
    console.log(`  - ${permission.name} (${permissionId}): ${permission.description}`);
  });

  // Test current user permissions
  const currentUser = get(user);
  if (!currentUser) {
    console.error('Current user not available for permission test.');
    return;
  }
  console.log('👤 Current User:');
  console.log(`  - Username: ${currentUser.username}`);
  console.log(`  - Role: ${currentUser.permissions.role}`);
  console.log(`  - Active: ${currentUser.permissions.isActive}`);
  console.log(`  - Permissions: ${currentUser.permissions.permissions.length}`);

  // Test permission checking
  console.log('✅ Permission Tests:');
  const testPermissions = ['cheat:view', 'cheat:manage', 'user:manage', 'system:admin'];

  testPermissions.forEach((permission) => {
    if (!currentUser) {
      console.error('Current user not available for permission test.');
      return;
    }
    const hasAccess = hasPermission(currentUser.permissions, permission);
    console.log(`  - ${permission}: ${hasAccess ? '✅' : '❌'}`);
  });

  // Test resource access
  console.log('🔍 Resource Access Tests:');
  const testResources = [
    { resource: 'cheat', action: 'view' },
    { resource: 'cheat', action: 'manage' },
    { resource: 'user', action: 'manage' },
    { resource: 'system', action: 'admin' },
  ];

  testResources.forEach(({ resource, action }) => {
    if (!currentUser) {
      console.error('Current user not available for permission test.');
      return;
    }
    const hasAccess = canAccessResource(currentUser.permissions, resource, action);
    console.log(`  - ${resource}:${action}: ${hasAccess ? '✅' : '❌'}`);
  });

  console.log('✅ Permissions test completed!');
}

export function simulateRoleChange(newRole: UserRole) {
  console.log(`🔄 Simulating role change to: ${newRole}`);

  user.update((current) => ({
    ...current,
    permissions: {
      ...current.permissions,
      role: newRole,
      permissions: ROLES[newRole].permissions,
    },
  }));

  console.log('✅ Role changed successfully!');
  testPermissions();
}

// Export test functions for development use
export const permissionTests = {
  testPermissions,
  simulateRoleChange,
  roles: ROLES,
  permissions: PERMISSIONS,
};
