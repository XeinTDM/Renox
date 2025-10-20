<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { appSettings } from '$lib/stores/appSettings';
  import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
  import Button from '$lib/components/Button.svelte';
  import { invoke } from '@tauri-apps/api/core';

  async function toggleDeveloperMode() {
    const newValue = !$appSettings.developerMode;
    try {
      // Optional backend call
    } catch (e) {
      console.error('Failed to set developer mode:', e);
      appSettings.update((settings) => ({
        ...settings,
        developerMode: !newValue,
      }));
    }
  }

  async function openDataFolder() {
    try {
      const { appDataDir } = await import('@tauri-apps/api/path');
      const opener = await import('@tauri-apps/plugin-opener');
      const dir = await appDataDir();
      await (opener as any).open(dir);
    } catch (e) {
      console.error('Failed to open data folder', e);
    }
  }

  async function openConfigFolder() {
    try {
      const { appConfigDir } = await import('@tauri-apps/api/path');
      const opener = await import('@tauri-apps/plugin-opener');
      const dir = await appConfigDir();
      await (opener as any).open(dir);
    } catch (e) {
      console.error('Failed to open config folder', e);
    }
  }
</script>

<div class="p-4">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
    {$_('developerSettings.title')}
  </h2>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('developerSettings.developerMode')}</p>
    <ToggleSwitch
      bind:checked={$appSettings.developerMode}
      on:change={toggleDeveloperMode}
      label={$_('developerSettings.developerMode')}
    />
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('developerSettings.verboseLogs')}</p>
    <ToggleSwitch
      bind:checked={$appSettings.verboseLogs}
      label={$_('developerSettings.verboseLogs')}
    />
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('developerSettings.openDataFolder')}</p>
    <Button
      variant="outline"
      on:click={openDataFolder}
      aria-label={$_('developerSettings.openDataFolder')}>{$_('developerSettings.open')}</Button
    >
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('developerSettings.openConfigFolder')}</p>
    <Button
      variant="outline"
      on:click={openConfigFolder}
      aria-label={$_('developerSettings.openConfigFolder')}>{$_('developerSettings.open')}</Button
    >
  </div>
</div>
