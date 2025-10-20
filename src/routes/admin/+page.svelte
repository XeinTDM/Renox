<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { user } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { PermissionGuard } from '$lib/components';
  import { ROLES, PERMISSIONS } from '$lib/types/permissions';
  import { showToast } from '$lib/stores/toastStore';
  import { onMount } from 'svelte';
  import {
    Users,
    Shield,
    Settings,
    BarChart3,
    Package,
    Key,
    Gamepad2,
    UserCheck,
    UserX,
    Crown,
  } from '@lucide/svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';

  let activeTab = 'overview';

  onMount(() => {
    // Redirect if user doesn't have admin permissions
    if (!$user.permissions.isActive || $user.permissions.role === 'user') {
      showToast({
        type: 'error',
        title: $_('adminPage.accessDenied'),
        message: $_('adminPage.noPermission'),
      });
      goto('/');
      return;
    }

    // Additional check for minimum required permissions
    const hasAdminAccess = $user.permissions.permissions.some((p) =>
      ['system:admin', 'user:manage', 'cheat:manage', 'license:manage'].includes(p),
    );

    if (!hasAdminAccess) {
      showToast({
        type: 'error',
        title: $_('adminPage.accessDenied'),
        message: $_('adminPage.insufficientPermissions'),
      });
      goto('/');
    }
  });

  const adminTabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3, permission: 'system:admin' },
    { id: 'users', name: 'User Management', icon: Users, permission: 'user:manage' },
    { id: 'cheats', name: 'Cheat Management', icon: Gamepad2, permission: 'cheat:manage' },
    { id: 'licenses', name: 'License Management', icon: Key, permission: 'license:manage' },
    { id: 'roles', name: 'Role Management', icon: Shield, permission: 'role:manage' },
    { id: 'settings', name: 'System Settings', icon: Settings, permission: 'system:settings' },
  ];

  const stats = [
    { name: 'Total Users', value: '1,234', change: '+12%', changeType: 'positive' },
    { name: 'Active Licenses', value: '856', change: '+5%', changeType: 'positive' },
    { name: 'Revenue (30d)', value: '$12,450', change: '+8%', changeType: 'positive' },
    { name: 'Active Cheats', value: '8', change: '0%', changeType: 'neutral' },
  ];
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage your cheat distribution platform</p>
    </div>
    <div class="flex items-center gap-2">
      <Crown class="w-5 h-5 text-yellow-500" />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        {$user.permissions.role.charAt(0).toUpperCase() + $user.permissions.role.slice(1)}
      </span>
    </div>
  </div>

  <!-- Navigation Tabs -->
  <div class="border-b border-gray-200 dark:border-gray-700">
    <nav class="flex space-x-8">
      {#each adminTabs as tab (tab.id)}
        <PermissionGuard permission={tab.permission}>
          <button
            class="flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors {activeTab ===
            tab.id
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
            on:click={() => (activeTab = tab.id)}
          >
            <svelte:component this={tab.icon} class="w-4 h-4" />
            {tab.name}
          </button>
        </PermissionGuard>
      {/each}
    </nav>
  </div>

  <!-- Tab Content -->
  {#if activeTab === 'overview'}
    <div class="space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {#each stats as stat (stat.name)}
          <Card>
            <div class="p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div class="text-right">
                  <span
                    class="text-sm font-medium {stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-gray-500'}"
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        {/each}
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PermissionGuard permission="user:manage">
          <Card>
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <Users class="w-6 h-6 text-blue-500" />
                <h3 class="text-lg font-semibold">User Management</h3>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Manage user accounts, roles, and permissions
              </p>
              <Button variant="default" on:click={() => (activeTab = 'users')}>Manage Users</Button>
            </div>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="cheat:manage">
          <Card>
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <Gamepad2 class="w-6 h-6 text-green-500" />
                <h3 class="text-lg font-semibold">Cheat Management</h3>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Update cheat status, add new cheats, and manage configurations
              </p>
              <Button variant="default" on:click={() => (activeTab = 'cheats')}>
                Manage Cheats
              </Button>
            </div>
          </Card>
        </PermissionGuard>

        <PermissionGuard permission="license:manage">
          <Card>
            <div class="p-6">
              <div class="flex items-center gap-3 mb-4">
                <Key class="w-6 h-6 text-purple-500" />
                <h3 class="text-lg font-semibold">License Management</h3>
              </div>
              <p class="text-gray-600 dark:text-gray-400 mb-4">
                Generate licenses, track usage, and manage subscriptions
              </p>
              <Button variant="default" on:click={() => (activeTab = 'licenses')}>
                Manage Licenses
              </Button>
            </div>
          </Card>
        </PermissionGuard>
      </div>
    </div>
  {:else if activeTab === 'users'}
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">User Management</h2>
        <Button variant="default">
          <UserCheck class="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <div class="p-6">
          <p class="text-gray-600 dark:text-gray-400">
            User management interface will be implemented here.
          </p>
        </div>
      </Card>
    </div>
  {:else if activeTab === 'cheats'}
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">Cheat Management</h2>
        <PermissionGuard permission="cheat:create">
          <Button variant="default">
            <Package class="w-4 h-4 mr-2" />
            Add Cheat
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <div class="p-6">
          <p class="text-gray-600 dark:text-gray-400">
            Cheat management interface will be implemented here.
          </p>
        </div>
      </Card>
    </div>
  {:else if activeTab === 'licenses'}
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">License Management</h2>
        <Button variant="default">
          <Key class="w-4 h-4 mr-2" />
          Generate License
        </Button>
      </div>

      <Card>
        <div class="p-6">
          <p class="text-gray-600 dark:text-gray-400">
            License management interface will be implemented here.
          </p>
        </div>
      </Card>
    </div>
  {:else if activeTab === 'roles'}
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold">Role Management</h2>
        <Button variant="default">
          <Shield class="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      <Card>
        <div class="p-6">
          <div class="space-y-4">
            {#each Object.values(ROLES) as role (role.name)}
              <div class="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 class="font-semibold">{role.name}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
                </div>
                <div class="text-right">
                  <span class="text-sm text-gray-500">{role.permissions.length} permissions</span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </Card>
    </div>
  {:else if activeTab === 'settings'}
    <div class="space-y-6">
      <h2 class="text-2xl font-bold">System Settings</h2>

      <Card>
        <div class="p-6">
          <p class="text-gray-600 dark:text-gray-400">
            System settings interface will be implemented here.
          </p>
        </div>
      </Card>
    </div>
  {/if}
</div>
