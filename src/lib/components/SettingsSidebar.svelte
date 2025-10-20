<!-- src/lib/components/SettingsSidebar.svelte -->
<script lang="ts">
  export let categories: { id: string; name: string }[];
  export let activeCategory: string;
</script>

<aside class="w-64 p-4 rounded-lg">
  <nav>
    <ul class="space-y-2" role="tablist">
      {#each categories as category (category.id)}
        <li>
          <button
            id="tab-{category.id}"
            role="tab"
            aria-selected={activeCategory === category.id}
            aria-controls="panel-{category.id}"
            tabindex={activeCategory === category.id ? 0 : -1}
            class="w-full text-left px-4 py-2 rounded-md transition-colors duration-200 border cursor-pointer select-none
            {activeCategory === category.id
              ? 'border-white text-white'
              : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-transparent hover:border-white'}"
            on:click={() => (activeCategory = category.id)}
          >
            {category.name}
          </button>
        </li>
      {/each}
    </ul>
  </nav>
</aside>
