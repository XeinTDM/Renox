<script lang="ts">
  import Button from './Button.svelte';
  import { errorLogs, type ErrorEntry, clearErrorLogs } from '$lib/stores/errorLogStore';
  export let open = false;
  export let lastError: ErrorEntry | null = null;

  function copyLatest() {
    const payload = formatError(lastError ?? $errorLogs[0]);
    if (payload) navigator.clipboard.writeText(payload);
  }

  function formatError(e?: ErrorEntry) {
    if (!e) return '';
    return `Time: ${e.timeISO}\nType: ${e.type}\nMessage: ${e.message}\nStack: ${e.stack ?? 'n/a'}\nDetails: ${JSON.stringify(e.details ?? {}, null, 2)}`;
  }
</script>

{#if open}
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
    <div
      class="w-full max-w-2xl rounded-lg p-4 bg-white dark:bg-[#111111] border border-gray-300 dark:border-gray-700 space-y-3"
    >
      <h3 class="text-lg font-semibold">An error occurred</h3>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        Copy the report below and share with your developer.
      </p>
      <textarea
        readonly
        class="w-full h-48 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-[#111111] font-mono text-xs"
        >{formatError(lastError ?? $errorLogs[0])}</textarea
      >
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">Stored errors: {$errorLogs.length}</div>
        <div class="flex gap-2">
          <Button
            variant="outline"
            on:click={() => {
              clearErrorLogs();
            }}>Clear</Button
          >
          <Button variant="outline" on:click={copyLatest}>Copy</Button>
          <Button on:click={() => (open = false)}>Close</Button>
        </div>
      </div>
    </div>
  </div>
{/if}
