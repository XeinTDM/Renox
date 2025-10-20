<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { appSettings } from '$lib/stores/appSettings';
  import ToggleSwitch from '$lib/components/ToggleSwitch.svelte';
  import Button from '$lib/components/Button.svelte';
  import { showToast } from '$lib/stores/toastStore';

  let pinInput: string = '';

  async function savePin() {
    try {
      const { deriveKeyFromPin, encryptJson } = await import('$lib/utils/crypto');
      const key = await deriveKeyFromPin(pinInput);
      // Encrypt a tiny blob to validate key and seed storage
      const blob = await encryptJson(key, { seeded: true, t: Date.now() });
      appSettings.update((s) => ({ ...s, encryptedLocalData: blob }));
      pinInput = '';
      showToast({
        type: 'success',
        title: $_('securitySettings.toast.pin'),
        message: $_('securitySettings.toast.pinSaved'),
        notificationType: 'generalSounds',
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: $_('securitySettings.toast.pin'),
        message: $_('securitySettings.toast.failedToSavePin'),
        notificationType: 'generalSounds',
      });
    }
  }

  async function encryptNow() {
    try {
      // Here you can gather whatever local data should be protected, demo with settings snapshot
      const data = $appSettings;
      const { deriveKeyFromPin, encryptJson } = await import('$lib/utils/crypto');
      const key = await deriveKeyFromPin(pinInput || '');
      const blob = await encryptJson(key, data);
      appSettings.update((s) => ({ ...s, encryptedLocalData: blob }));
      showToast({
        type: 'success',
        title: $_('securitySettings.toast.encryption'),
        message: $_('securitySettings.toast.localDataEncrypted'),
        notificationType: 'generalSounds',
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: $_('securitySettings.toast.encryption'),
        message: $_('securitySettings.toast.failedToEncryptData'),
        notificationType: 'generalSounds',
      });
    }
  }
</script>

<div class="p-4">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
    {$_('securitySettings.title')}
  </h2>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('securitySettings.enablePinAppLock')}</p>
    <ToggleSwitch
      bind:checked={$appSettings.pinEnabled}
      label={$_('securitySettings.enablePinAppLock')}
    />
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('securitySettings.lockOnMinimize')}</p>
    <ToggleSwitch
      bind:checked={$appSettings.lockOnMinimize}
      label={$_('securitySettings.lockOnMinimize')}
    />
  </div>
  {#if $appSettings.pinEnabled}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
      <div class="flex flex-col gap-1">
        <label for="pinInput" class="text-sm text-gray-700 dark:text-gray-300"
          >{$_('securitySettings.setChangePin')}</label
        >
        <input
          id="pinInput"
          type="password"
          class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#111111]"
          bind:value={pinInput}
        />
        <Button variant="outline" on:click={savePin}>{$_('securitySettings.savePin')}</Button>
      </div>
      <div class="flex flex-col gap-1">
        <label for="encryptButton" class="text-sm text-gray-700 dark:text-gray-300"
          >{$_('securitySettings.encryptLocalDataNow')}</label
        >
        <Button id="encryptButton" on:click={encryptNow}>{$_('securitySettings.encrypt')}</Button>
      </div>
    </div>
  {/if}
</div>
