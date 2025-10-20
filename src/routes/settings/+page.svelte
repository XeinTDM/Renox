<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { appSettings } from '$lib/stores/appSettings';
  import SettingsSidebar from '$lib/components/SettingsSidebar.svelte';
  import AccountSettings from '$lib/components/settings/AccountSettings.svelte';
  import AppearanceSettings from '$lib/components/settings/AppearanceSettings.svelte';
  import GeneralSettings from '$lib/components/settings/GeneralSettings.svelte';
  import SecuritySettings from '$lib/components/settings/SecuritySettings.svelte';
  import BrandingSettings from '$lib/components/settings/BrandingSettings.svelte';
  import DeveloperSettings from '$lib/components/settings/DeveloperSettings.svelte';
  import BackupRestoreSettings from '$lib/components/settings/BackupRestoreSettings.svelte';

  let activeCategory: string = 'account'; // Default active category

  const categories = [
    { id: 'account', name: $_('settings.categories.account') },
    { id: 'appearance', name: $_('settings.categories.appearance') },
    { id: 'general', name: $_('settings.categories.general') },
    { id: 'security', name: $_('settings.categories.security') },
    { id: 'branding', name: $_('settings.categories.branding') },
    { id: 'developer', name: $_('settings.categories.developer') },
    { id: 'backup-restore', name: $_('settings.categories.backupRestore') },
  ];
</script>

<div class="flex h-full">
  <SettingsSidebar {categories} bind:activeCategory />

  <div class="flex-1 p-6 overflow-y-auto">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{$_('settings.title')}</h1>

    {#key $appSettings.locale}
      {#if activeCategory === 'account'}
        <div id="panel-account" role="tabpanel" aria-labelledby="tab-account" tabindex="0">
          <AccountSettings />
        </div>
      {:else if activeCategory === 'appearance'}
        <div id="panel-appearance" role="tabpanel" aria-labelledby="tab-appearance" tabindex="0">
          <AppearanceSettings />
        </div>
      {:else if activeCategory === 'general'}
        <div id="panel-general" role="tabpanel" aria-labelledby="tab-general" tabindex="0">
          <GeneralSettings />
        </div>
      {:else if activeCategory === 'security'}
        <div id="panel-security" role="tabpanel" aria-labelledby="tab-security" tabindex="0">
          <SecuritySettings />
        </div>
      {:else if activeCategory === 'branding'}
        <div id="panel-branding" role="tabpanel" aria-labelledby="tab-branding" tabindex="0">
          <BrandingSettings />
        </div>
      {:else if activeCategory === 'developer'}
        <div id="panel-developer" role="tabpanel" aria-labelledby="tab-developer" tabindex="0">
          <DeveloperSettings />
        </div>
      {:else if activeCategory === 'backup-restore'}
        <div
          id="panel-backup-restore"
          role="tabpanel"
          aria-labelledby="tab-backup-restore"
          tabindex="0"
        >
          <BackupRestoreSettings />
        </div>
      {:else}
        <p class="text-red-500">{$_('settings.errorCategoryNotFound')}</p>
      {/if}
    {/key}
  </div>
</div>
