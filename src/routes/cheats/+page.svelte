<script lang="ts">
  import GameGrid from '$lib/components/GameGrid.svelte';
  import { PermissionGuard } from '$lib/components';
  import { cheats } from '$lib/stores/cheatStore';
  import { user } from '$lib/stores/userStore';
  import { showToast } from '$lib/stores/toastStore';
  import { Plus, Settings, BarChart3 } from '@lucide/svelte';
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';

  $: if ($cheats.length === 0) {
    showToast({ type: 'info', message: 'No cheats available' });
  }

  function addNewCheat() {
    showToast({
      type: 'info',
      title: 'Add Cheat',
      message: 'Add cheat functionality will be implemented',
    });
  }

  function viewAnalytics() {
    showToast({
      type: 'info',
      title: 'Analytics',
      message: 'Analytics functionality will be implemented',
    });
  }

  function manageCheats() {
    showToast({
      type: 'info',
      title: 'Manage Cheats',
      message: 'Cheat management functionality will be implemented',
    });
  }
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Cheat Management</h1>
      <p class="text-gray-600 dark:text-gray-400">Manage and launch your available cheats</p>
    </div>

    <div class="flex gap-2">
      <PermissionGuard permission="cheat:manage">
        <Button variant="outline" on:click={manageCheats}>
          <Settings class="w-4 h-4 mr-2" />
          Manage
        </Button>
      </PermissionGuard>

      <PermissionGuard permission="sales:view">
        <Button variant="outline" on:click={viewAnalytics}>
          <BarChart3 class="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </PermissionGuard>

      <PermissionGuard permission="cheat:create">
        <Button variant="default" on:click={addNewCheat}>
          <Plus class="w-4 h-4 mr-2" />
          Add Cheat
        </Button>
      </PermissionGuard>
    </div>
  </div>

  <!-- User Role Info -->
  <PermissionGuard permission="cheat:manage" fallback="">
    <Card>
      <div class="p-4">
        <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span class="font-medium">Role:</span>
          <span
            class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs"
          >
            {$user.permissions.role.charAt(0).toUpperCase() + $user.permissions.role.slice(1)}
          </span>
          <span class="text-gray-500">•</span>
          <span>You have management access to cheats</span>
        </div>
      </div>
    </Card>
  </PermissionGuard>

  <!-- Cheats Grid -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Available Cheats</h2>
      <span class="text-sm text-gray-500">{$cheats.length} cheats available</span>
    </div>

    <GameGrid items={$cheats} />
  </div>

  <!-- Management Actions for Resellers/Developers -->
  <PermissionGuard permission="cheat:manage">
    <Card>
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            on:click={() => showToast({ type: 'info', message: 'Update cheat status' })}
          >
            Update Status
          </Button>
          <Button
            variant="outline"
            on:click={() => showToast({ type: 'info', message: 'Configure cheat settings' })}
          >
            Configure
          </Button>
          <Button
            variant="outline"
            on:click={() => showToast({ type: 'info', message: 'View cheat logs' })}
          >
            View Logs
          </Button>
        </div>
      </div>
    </Card>
  </PermissionGuard>
</div>
