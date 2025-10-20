<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Button from '$lib/components/Button.svelte';
  import { user } from '$lib/stores/userStore';
  import Input from '$lib/components/Input.svelte';
  import ProfileCard from '$lib/components/ProfileCard.svelte';
  import { PermissionGuard } from '$lib/components';
  import { ROLES, PERMISSIONS } from '$lib/types/permissions';
  import { showToast } from '$lib/stores/toastStore';
  import { confirmationStore } from '$lib/stores/confirmationStore';
  import { Shield, Crown, User, Users } from '@lucide/svelte';

  // --- Reactive Translations ---
  $: roleAndPermissionsTitle = $_('accountSettings.roleAndPermissions.title');
  $: yourPermissionsText = $_('accountSettings.roleAndPermissions.yourPermissions');
  $: manageRolesText = $_('accountSettings.roleAndPermissions.manageRoles');

  $: manageLicensesTitle = $_('accountSettings.manageLicenses.title');
  $: removeLicenseText = $_('accountSettings.manageLicenses.remove');
  $: noActiveLicensesText = $_('accountSettings.manageLicenses.noActiveLicenses');
  $: enterLicenseKeyPlaceholder = $_('accountSettings.manageLicenses.enterLicenseKey');
  $: addLicenseText = $_('accountSettings.manageLicenses.addLicense');

  $: twoFactorAuthTitle = $_('accountSettings.twoFactorAuth.title');
  $: twoFactorAuthDescription = $_('accountSettings.twoFactorAuth.description');
  $: manage2FAText = $_('accountSettings.twoFactorAuth.manage2FA');

  // Toast translations
  $: toastLicenseTitle = $_('accountSettings.manageLicenses.toast.license');
  $: toastEnterLicenseKey = $_('accountSettings.manageLicenses.toast.enterLicenseKey');
  $: toastLicenseAlreadyAdded = $_('accountSettings.manageLicenses.toast.licenseAlreadyAdded');
  $: toastLicenseAdded = $_('accountSettings.manageLicenses.toast.licenseAdded');
  $: toastRemoveLicenseTitle = $_('accountSettings.manageLicenses.toast.removeLicenseTitle');
  $: toastLicenseRemoved = $_('accountSettings.manageLicenses.toast.licenseRemoved');

  // Dynamic translations (permissions, roles)
  $: currentRoleName = $_('roles.' + $user.permissions.role + '.name');
  $: currentRoleDescription = $_('roles.' + $user.permissions.role + '.description');

  // This is a helper function to get dynamic permission names reactively
  const getPermissionName = (id: string) => {
    let name = '';
    _.subscribe((t) => {
      name = t('permissions.' + id + '.name');
    })();
    return name;
  };

  let newLicenseKey = '';

  function addLicense() {
    const key = newLicenseKey.trim();
    if (key === '') {
      showToast({
        type: 'error',
        title: toastLicenseTitle,
        message: toastEnterLicenseKey,
        notificationType: 'generalSounds',
      });
      return;
    }
    user.update((current) => {
      if (current.licenses.includes(key)) {
        showToast({
          type: 'info',
          title: toastLicenseTitle,
          message: toastLicenseAlreadyAdded,
          notificationType: 'generalSounds',
        });
        return current;
      }
      const updated = { ...current, licenses: [...current.licenses, key] };
      showToast({
        type: 'success',
        title: toastLicenseTitle,
        message: toastLicenseAdded,
        notificationType: 'generalSounds',
      });
      return updated;
    });
    newLicenseKey = '';
  }

  function removeLicense(licenseToRemove: string) {
    // Note: The confirmation message itself is dynamic and needs the store directly.
    confirmationStore.showConfirmation(
      toastRemoveLicenseTitle,
      $_('accountSettings.manageLicenses.toast.removeLicenseConfirm', {
        values: { licenseToRemove },
      }),
      () => {
        user.update((current) => {
          const updated = {
            ...current,
            licenses: current.licenses.filter((license) => license !== licenseToRemove),
          };
          showToast({
            type: 'info',
            title: toastLicenseTitle,
            message: toastLicenseRemoved,
            notificationType: 'generalSounds',
          });
          return updated;
        });
      },
    );
  }

  function getRoleIcon(role: string) {
    switch (role) {
      case 'admin':
        return Crown;
      case 'developer':
        return Shield;
      case 'reseller':
        return Users;
      default:
        return User;
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'admin':
        return 'text-red-500';
      case 'developer':
        return 'text-blue-500';
      case 'reseller':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  }
</script>

<div class="space-y-6">
  <!-- Role and Permissions -->
  <ProfileCard title={roleAndPermissionsTitle}>
    <div class="space-y-4">
      <div class="flex items-center gap-3">
        <svelte:component
          this={getRoleIcon($user.permissions.role)}
          class="w-5 h-5 {getRoleColor($user.permissions.role)}"
        />
        <div>
          <h3 class="font-semibold">{currentRoleName}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">{currentRoleDescription}</p>
        </div>
      </div>

      <div class="space-y-2">
        <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">{yourPermissionsText}</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          {#each $user.permissions.permissions as permissionId (permissionId)}
            {#if PERMISSIONS[permissionId]}
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-gray-600 dark:text-gray-400"
                  >{getPermissionName(permissionId)}</span
                >
              </div>
            {/if}
          {/each}
        </div>
      </div>

      <PermissionGuard permission="role:manage">
        <div class="pt-2 border-t">
          <Button variant="outline" size="sm">
            <Shield class="w-4 h-4 mr-2" />
            {manageRolesText}
          </Button>
        </div>
      </PermissionGuard>
    </div>
  </ProfileCard>

  <ProfileCard title={manageLicensesTitle}>
    {#if $user.licenses.length > 0}
      <ul class="space-y-3">
        {#each $user.licenses as license (license)}
          <li class="flex justify-between items-center p-3 rounded-md border">
            <span class="font-mono text-sm">{license}</span>
            <Button on:click={() => removeLicense(license)} variant="destructive" size="sm">
              {removeLicenseText}
            </Button>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="text-gray-500 dark:text-gray-400">{noActiveLicensesText}</p>
    {/if}
    <div class="flex gap-2 pt-4">
      <Input
        type="text"
        placeholder={enterLicenseKeyPlaceholder}
        bind:value={newLicenseKey}
        classes="flex-grow"
      />
      <Button on:click={addLicense} variant="default" classes="whitespace-nowrap"
        >{addLicenseText}</Button
      >
    </div>
  </ProfileCard>

  <ProfileCard title={twoFactorAuthTitle}>
    <p class="text-gray-500 dark:text-gray-400">
      {twoFactorAuthDescription}
    </p>
    <Button variant="default">{manage2FAText}</Button>
  </ProfileCard>
</div>
