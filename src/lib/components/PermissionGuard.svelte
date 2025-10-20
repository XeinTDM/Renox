<script lang="ts">
  import { user } from '$lib/stores/userStore';
  import { hasPermission, canAccessResource } from '$lib/types/permissions';
  import type { UserRole } from '$lib/types/permissions';

  export let permission: string | null = null;
  export let resource: string | null = null;
  export let action: string | null = null;
  export let role: UserRole | null = null;
  export let fallback: string = '';

  $: hasAccess = (() => {
    // Additional validation to prevent bypass
    if (!$user.permissions.isActive) return false;
    if ($user.permissions.expiresAt && new Date($user.permissions.expiresAt) < new Date())
      return false;

    if (permission) {
      return hasPermission($user.permissions, permission);
    }
    if (resource && action) {
      return canAccessResource($user.permissions, resource, action);
    }
    if (role) {
      return $user.permissions.role === role;
    }
    return false;
  })();
</script>

{#if hasAccess}
  <slot />
{:else if fallback}
  <div class="text-gray-500 dark:text-gray-400 text-sm">
    {fallback}
  </div>
{/if}
