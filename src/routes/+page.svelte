<script lang="ts">
  import { onMount } from 'svelte';
  import { games, filterOptions } from '$lib/data/games';
  import type { DisplayItem } from '$lib/types/displayItem';
  import Input from '$lib/components/Input.svelte';
  import Button from '$lib/components/Button.svelte';
  import GameGrid from '$lib/components/GameGrid.svelte';
  import { X } from '@lucide/svelte';
  import { Tooltip } from '$lib/components';
  import { goto } from '$app/navigation';

  let searchTerm: string = '';
  let showAnnouncement: boolean = true;
  import { filter } from '$lib/stores/filterStore';
  let filteredGames: DisplayItem[] = [];

  onMount(() => {
    const dismissed = localStorage.getItem('dismissedAnnouncement');
    if (dismissed === 'true') {
      showAnnouncement = false;
    }
  });

  $: {
    if (typeof window !== 'undefined') {
      if (showAnnouncement) {
        localStorage.removeItem('dismissedAnnouncement');
      } else {
        localStorage.setItem('dismissedAnnouncement', 'true');
      }
    }
  }

  function clearSearch() {
    searchTerm = '';
  }

  function matchesFilter(game: DisplayItem, currentFilterValue: string): boolean {
    const status = game.status.toLowerCase();
    switch (currentFilterValue) {
      case 'licensed':
        return game.licensed;
      case 'unlicensed':
        return !game.licensed;
      case 'detected':
        return status === 'detected';
      case 'undetected':
        return status === 'undetected';
      case 'maintenance':
        return status.includes('maintenance');
      case 'updating':
        return status.includes('updating');
      case 'expires':
        return status.includes('expires');
      default:
        return true;
    }
  }

  $: {
    filteredGames = games
      .filter((g) => g.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .filter((g) => matchesFilter(g, $filter));
  }
</script>

<div class="space-y-6">
  {#if showAnnouncement}
    <div class="flex items-center justify-between bg-red-700 text-white px-3 py-2 rounded-md">
      <p class="text-sm"><strong>Announcement:</strong> New update is live! Check our changelog.</p>
      <button
        on:click={() => (showAnnouncement = false)}
        class="p-1 hover:bg-red-800 rounded cursor-pointer"
        aria-label="Close announcement"
      >
        <X class="h-4 w-4" />
      </button>
    </div>
  {/if}

  <div class="flex items-center gap-2">
    <Input
      placeholder="Search games..."
      bind:value={searchTerm}
      classes=""
      ariaLabel="Search games"
    />
    <Tooltip content="Clear search term" position="left">
      <Button
        variant="outline"
        classes="p-2 gap-1 border-gray-600 dark:border-gray-400 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500"
        on:click={clearSearch}
      >
        <X class="w-4 h-4" />
        Clear
      </Button>
    </Tooltip>
  </div>

  <div class="flex flex-wrap gap-2 text-sm">
    {#each filterOptions as f (f.value)}
      <Button
        variant={$filter === f.value ? 'default' : 'outline'}
        classes={'border-gray-600 dark:border-gray-400 text-gray-500 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-500 ' +
          ($filter === f.value ? 'bg-red-500 text-white' : '')}
        on:click={() => {
          filter.set(f.value);
        }}
      >
        {f.label}
      </Button>
    {/each}
  </div>

  <div class="w-full">
    <GameGrid items={filteredGames} />
  </div>
</div>
