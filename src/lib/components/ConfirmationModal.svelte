<script lang="ts">
  import { confirmationStore } from '$lib/stores/confirmationStore';
  import Button from './Button.svelte';

  let show = false;
  let title = '';
  let message = '';
  let onConfirm: (() => void) | null = null;
  let onCancel: (() => void) | null = null;

  confirmationStore.subscribe((value) => {
    show = value.show;
    title = value.title;
    message = value.message;
    onConfirm = value.onConfirm;
    onCancel = value.onCancel;
  });

  function handleConfirm() {
    if (onConfirm) {
      onConfirm();
    }
    confirmationStore.hideConfirmation();
  }

  function handleCancel() {
    if (onCancel) {
      onCancel();
    }
    confirmationStore.hideConfirmation();
  }
</script>

{#if show}
  <div
    class="fixed inset-0 flex items-center justify-center z-50 p-4"
    style="background-color: rgba(0, 0, 0, 0.2);"
    on:click|self={handleCancel}
    on:keydown={(e) => {
      if (e.key === 'Escape') handleCancel();
    }}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="bg-[#111111] border border-gray-800 rounded-lg p-6 shadow-xl max-w-sm w-full space-y-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-title"
      aria-describedby="confirmation-message"
    >
      <h3 id="confirmation-title" class="text-xl font-bold text-white">
        {title}
      </h3>
      <p id="confirmation-message" class="text-gray-300">
        {message}
      </p>
      <div class="flex justify-end space-x-3">
        <Button variant="outline" on:click={handleCancel}>Cancel</Button>
        <Button variant="destructive" on:click={handleConfirm}>Confirm</Button>
      </div>
    </div>
  </div>
{/if}
