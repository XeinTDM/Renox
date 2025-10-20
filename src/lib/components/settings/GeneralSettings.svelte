<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { appSettings } from '$lib/stores/appSettings';
  import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
  import Button from '$lib/components/Button.svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { showToast } from '$lib/stores/toastStore';
  import { Bell } from '@lucide/svelte';

  async function toggleLaunchOnStartup() {
    const newValue = !$appSettings.launchOnStartup;
    try {
      await invoke('set_autostart', { enable: newValue });
      showToast({
        type: 'success',
        title: 'Autostart',
        message: newValue ? 'App will start on login' : 'Autostart disabled',
        notificationType: 'generalSounds',
      });
    } catch (e) {
      console.error('Failed to set autostart:', e);
      appSettings.update((settings) => ({
        ...settings,
        launchOnStartup: !newValue,
      }));
      showToast({
        type: 'error',
        title: 'Autostart',
        message: 'Failed to update autostart',
        notificationType: 'generalSounds',
      });
    }
  }

  async function toggleMinimizeToTray() {
    const newValue = !$appSettings.minimizeToTray;
    try {
      await invoke('set_minimize_to_tray', { enable: newValue });
      showToast({
        type: 'success',
        title: 'Window',
        message: newValue ? 'Minimized to tray' : 'Restored from tray',
        notificationType: 'generalSounds',
      });
    } catch (e) {
      console.error('Failed to set minimize to tray:', e);
      appSettings.update((settings) => ({
        ...settings,
        minimizeToTray: !newValue,
      }));
      showToast({
        type: 'error',
        title: 'Window',
        message: 'Failed to update window state',
        notificationType: 'generalSounds',
      });
    }
  }

  async function toggleAutoUpdateCheats() {
    const newValue = !$appSettings.autoUpdateCheats;
    try {
      // Optional backend call
      showToast({
        type: 'success',
        title: 'Cheat Updates',
        message: newValue ? 'Auto-update enabled' : 'Auto-update disabled',
        notificationType: 'cheatUpdates',
      });
    } catch (e) {
      console.error('Failed to set auto-update cheats:', e);
      appSettings.update((settings) => ({
        ...settings,
        autoUpdateCheats: !newValue,
      }));
      showToast({
        type: 'error',
        title: 'Cheat Updates',
        message: 'Failed to update auto-update setting',
        notificationType: 'cheatUpdates',
      });
    }
  }

  async function toggleHardwareAcceleration() {
    const newValue = !$appSettings.hardwareAcceleration;
    try {
      // Optional backend call
      showToast({
        type: 'success',
        title: 'Performance',
        message: newValue ? 'Hardware acceleration enabled' : 'Hardware acceleration disabled',
        notificationType: 'generalSounds',
      });
    } catch (e) {
      console.error('Failed to set hardware acceleration:', e);
      appSettings.update((settings) => ({
        ...settings,
        hardwareAcceleration: !newValue,
      }));
      showToast({
        type: 'error',
        title: 'Performance',
        message: 'Failed to update hardware acceleration setting',
        notificationType: 'generalSounds',
      });
    }
  }
</script>

<div class="space-y-6">
  <!-- Startup & Window -->
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {$_('settings.startupAndWindow')}
    </h2>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.launchOnStartup')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.launchOnStartup}
        on:change={toggleLaunchOnStartup}
        label={$_('general.launchOnStartup')}
      />
    </div>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.minimizeToTray')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.minimizeToTray}
        on:change={toggleMinimizeToTray}
        label={$_('general.minimizeToTray')}
      />
    </div>
  </div>

  <!-- Performance -->
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {$_('settings.performance')}
    </h2>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.hardwareAcceleration')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.hardwareAcceleration}
        on:change={toggleHardwareAcceleration}
        label={$_('general.hardwareAcceleration')}
      />
    </div>
  </div>

  <!-- Notifications -->
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {$_('settings.notifications')}
    </h2>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.notifications.generalSounds')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.notifications.generalSounds}
        label={$_('general.notifications.generalSounds')}
      />
    </div>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.notifications.appUpdates')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.notifications.appUpdates}
        label={$_('general.notifications.appUpdates')}
      />
    </div>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.notifications.cheatUpdates')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.notifications.cheatUpdates}
        label={$_('general.notifications.cheatUpdates')}
      />
    </div>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.notifications.errors')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.notifications.errors}
        label={$_('general.notifications.errors')}
      />
    </div>
  </div>

  <!-- Localization -->
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {$_('settings.localization')}
    </h2>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.language')}</p>
      <select
        aria-label="Select language"
        class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#111111]"
        value={$appSettings.locale}
        on:change={(e) => {
          appSettings.update((s) => ({ ...s, locale: e.currentTarget?.value || 'en' }));
        }}
      >
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
        <option value="pt">Português</option>
      </select>
    </div>
  </div>

  <!-- Cheat Management -->
  <div class="p-4">
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
      {$_('settings.cheatManagement')}
    </h2>
    <div class="flex items-center justify-between mt-2">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.autoUpdateCheats')}</p>
      <ToggleSwitch
        bind:checked={$appSettings.autoUpdateCheats}
        on:change={toggleAutoUpdateCheats}
        label={$_('general.autoUpdateCheats')}
      />
    </div>
    <div class="flex items-center justify-between mt-4">
      <p class="text-gray-700 dark:text-gray-300">{$_('general.scanForNewCheatsOnStartup')}</p>
      <ToggleSwitch checked={true} label={$_('general.scanForNewCheatsOnStartup')} />
    </div>
  </div>
</div>
