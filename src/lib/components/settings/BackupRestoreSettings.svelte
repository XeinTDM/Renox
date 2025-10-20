<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { appSettings } from '$lib/stores/appSettings';
  import Button from '$lib/components/Button.svelte';
  import { showToast } from '$lib/stores/toastStore';
  import { confirmationStore } from '$lib/stores/confirmationStore';

  function exportSettings() {
    const dataStr = JSON.stringify($appSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importSettings(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);

      // Validate and merge with current settings
      const merged = { ...$appSettings, ...imported };
      appSettings.set(merged);

      showToast({
        type: 'success',
        title: $_('backupRestoreSettings.toast.import'),
        message: $_('backupRestoreSettings.toast.settingsImportedSuccessfully'),
        notificationType: 'generalSounds',
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: $_('backupRestoreSettings.toast.import'),
        message: $_('backupRestoreSettings.toast.failedToImportSettings'),
        notificationType: 'generalSounds',
      });
    }
  }

  function resetToDefaults() {
    confirmationStore.showConfirmation(
      $_('backupRestoreSettings.confirmation.resetSettingsTitle'),
      $_('backupRestoreSettings.confirmation.resetSettingsMessage'),
      () => {
        const defaultSettings = {
          launchOnStartup: false,
          minimizeToTray: false,
          autoUpdateCheats: true,
          notificationSounds: true,
          hardwareAcceleration: true,
          developerMode: false,
          accentColor: 'red' as const,
          density: 'cozy' as const,
          autoLockMinutes: null as number | null,
          fontScale: 1 as const,
          verboseLogs: false,
          brand: {
            appName: 'Rubi Loader',
            logoUrl: '/favicon.svg',
            websiteUrl: 'https://example.com',
            supportUrl: 'https://example.com/support',
          },
          locale: 'en',
          pinEnabled: false,
          encryptedLocalData: null as string | null,
          lockOnMinimize: false,
          scanOnStartup: true,
        };
        appSettings.set(defaultSettings as any);

        showToast({
          type: 'success',
          title: $_('backupRestoreSettings.toast.reset'),
          message: $_('backupRestoreSettings.toast.settingsResetToDefaults'),
          notificationType: 'generalSounds',
        });
      },
    );
  }
</script>

<div class="p-4">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
    {$_('backupRestoreSettings.title')}
  </h2>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('backupRestoreSettings.exportSettings')}</p>
    <Button
      variant="outline"
      on:click={exportSettings}
      aria-label={$_('backupRestoreSettings.exportSettings')}
      >{$_('backupRestoreSettings.exportJson')}</Button
    >
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('backupRestoreSettings.importSettings')}</p>
    <input type="file" accept=".json" on:change={importSettings} class="hidden" id="import-file" />
    <Button
      variant="outline"
      on:click={() => document.getElementById('import-file')?.click()}
      aria-label={$_('backupRestoreSettings.importSettings')}
      >{$_('backupRestoreSettings.importJson')}</Button
    >
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('backupRestoreSettings.resetToDefaults')}</p>
    <Button
      variant="outline"
      on:click={resetToDefaults}
      aria-label={$_('backupRestoreSettings.resetToDefaults')}
      >{$_('backupRestoreSettings.reset')}</Button
    >
  </div>
</div>
