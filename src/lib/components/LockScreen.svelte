<script lang="ts">
  import Button from './Button.svelte';
  import { isLocked } from '$lib/stores/lockStore';
  import { appSettings } from '$lib/stores/appSettings';
  import { deriveKeyFromPin, decryptJson } from '$lib/utils/crypto';
  let pin: string = '';
  let error: string | null = null;

  async function unlock() {
    error = null;
    try {
      if (!$appSettings.pinEnabled) {
        isLocked.set(false);
        return;
      }
      const key = await deriveKeyFromPin(pin);
      if ($appSettings.encryptedLocalData) {
        // Try a decrypt to validate PIN. We do not need the data result here.
        await decryptJson(key, $appSettings.encryptedLocalData);
      }
      isLocked.set(false);
      pin = '';
    } catch (e) {
      error = 'Incorrect PIN';
    }
  }
</script>

{#if $isLocked}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div
      class="w-full max-w-sm rounded-lg p-4 bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 space-y-3"
    >
      <h3 class="text-lg font-semibold">App Locked</h3>
      <input
        type="password"
        placeholder="Enter PIN"
        class="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-[#111111]"
        bind:value={pin}
        on:keydown={(e) => e.key === 'Enter' && unlock()}
      />
      {#if error}<p class="text-red-500 text-sm">{error}</p>{/if}
      <div class="flex justify-end gap-2">
        <Button on:click={unlock}>Unlock</Button>
      </div>
    </div>
  </div>
{/if}
