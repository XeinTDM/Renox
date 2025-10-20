<script lang="ts">
  import { toasts, dismissToast, type Toast } from '$lib/stores/toastStore';
  import { X } from '@lucide/svelte';
  export let position: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' = 'top-right';
</script>

<div
  class="fixed z-50"
  class:top-4={position.startsWith('top')}
  class:bottom-4={position.startsWith('bottom')}
  class:right-4={position.endsWith('right')}
  class:left-4={position.endsWith('left')}
>
  {#each $toasts as toast (toast.id)}
    <div
      class="mb-3 w-80 rounded-lg border p-3 shadow-lg bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 border-l-4"
      class:border-l-green-500={toast.type === 'success'}
      class:border-l-red-500={toast.type === 'error'}
      class:border-l-gray-500={toast.type === 'info'}
    >
      <div class="flex items-start gap-2">
        <div class="mt-0.5">
          {#if toast.type === 'success'}
            <span class="inline-block w-2.5 h-2.5 bg-green-500 rounded-full"></span>
          {:else if toast.type === 'error'}
            <span class="inline-block w-2.5 h-2.5 bg-red-500 rounded-full"></span>
          {:else}
            <span class="inline-block w-2.5 h-2.5 bg-gray-500 rounded-full"></span>
          {/if}
        </div>
        <div class="flex-1 min-w-0">
          {#if toast.title}<p class="font-semibold text-sm mb-0.5">{toast.title}</p>{/if}
          <p class="text-sm leading-snug text-gray-800 dark:text-gray-200">{toast.message}</p>
        </div>
        <button
          class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
          on:click={() => dismissToast(toast.id)}
          aria-label="Dismiss"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  .top-4 {
    top: 1rem;
  }
  .bottom-4 {
    bottom: 1rem;
  }
  .right-4 {
    right: 1rem;
  }
  .left-4 {
    left: 1rem;
  }
</style>
