<script lang="ts">
  export let checked: boolean;
  export let label: string = '';
  let id = `toggle-${Math.random().toString(36).substr(2, 9)}`;
</script>

<label for={id} class="relative inline-flex items-center cursor-pointer">
  <input type="checkbox" {id} bind:checked on:change class="sr-only peer" />
  <div
    class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-accent-600)]"
  ></div>
  {#if label}
    <span class="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">{label}</span>
  {/if}
</label>
