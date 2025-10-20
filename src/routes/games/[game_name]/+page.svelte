<script lang="ts">
  import { page } from '$app/stores';
  import { games } from '$lib/data/games';
  import { CheckCircle, XCircle, Info, ChevronLeft, ChevronRight } from '@lucide/svelte';
  import Button from '$lib/components/Button.svelte';
  import { ShoppingCart } from '@lucide/svelte';

  const gameNameParam = $page.params?.game_name ?? '';
  const gameName = gameNameParam.replace(/-/g, ' ');
  const game = games.find((g) => g.name.toLowerCase() === gameName.toLowerCase());
  let selectedPrice: string | undefined = game?.prices[0]?.type;

  function getStatusColor(status: string) {
    switch (status) {
      case 'operational':
        return 'text-green-500';
      case 'degraded':
        return 'text-yellow-500';
      case 'down':
        return 'text-red-500';
      case 'updating':
        return 'text-blue-500';
      case 'detected':
        return 'text-red-500';
      case 'maintenance':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'operational':
        return CheckCircle;
      case 'degraded':
      case 'updating':
      case 'maintenance':
        return Info;
      case 'down':
        return XCircle;
      default:
        return Info;
    }
  }
</script>

<div class="p-6 space-y-6">
  {#if game}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <div class="relative group">
          <img src={game.image} alt={game.name} class="w-full h-auto rounded-lg shadow-lg" />
          <button
            class="absolute left-2 top-1/2 -translate-y-1/2 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          <button
            class="absolute right-2 top-1/2 -translate-y-1/2 text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
        </div>
        <div class="grid grid-cols-5 gap-2 mt-2">
          {#each [1, 2, 3, 4, 5] as i (i)}
            <img
              src={game.image}
              alt="Thumbnail {i}"
              class="h-auto rounded-md cursor-pointer transition-transform duration-200 hover:scale-105"
            />
          {/each}
        </div>
        <div
          class="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800 mt-6 mb-4"
        >
          <div
            class="flex items-center gap-4 p-4 border border-gray-300 dark:border-gray-700 rounded-lg mb-4"
          >
            <svelte:component
              this={getStatusIcon(
                game.status.toLowerCase().includes('undetected') ||
                  game.status.toLowerCase().includes('expires') ||
                  game.status.toLowerCase().includes('not licensed')
                  ? 'operational'
                  : game.status.toLowerCase(),
              )}
              class="w-5 h-5 {getStatusColor(
                game.status.toLowerCase().includes('undetected') ||
                  game.status.toLowerCase().includes('expires') ||
                  game.status.toLowerCase().includes('not licensed')
                  ? 'operational'
                  : game.status.toLowerCase(),
              )}"
            />
            <div>
              <p class="font-semibold text-gray-800 dark:text-gray-200">Current Status:</p>
              <p
                class="text-sm {getStatusColor(
                  game.status.toLowerCase().includes('undetected') ||
                    game.status.toLowerCase().includes('expires') ||
                    game.status.toLowerCase().includes('not licensed')
                    ? 'operational'
                    : game.status.toLowerCase(),
                )}"
              >
                {game.status}
              </p>
            </div>
          </div>
          <p>This page provides detailed information for {game.name}.</p>
          <p>For more detailed information or to report an issue, please contact support.</p>
        </div>
      </div>
      <div class="space-y-4">
        <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-100">{game.name}</h1>
        <p class="text-gray-700 dark:text-gray-300">{game.description}</p>
        <div class="space-y-2">
          {#each game.prices as priceOption (priceOption.type)}
            <button
              class="flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors duration-200 w-full
              {selectedPrice === priceOption.type
                ? 'border-accent'
                : 'border-gray-300 dark:border-gray-700 hover:border-accent'}"
              on:click={() => (selectedPrice = priceOption.type)}
            >
              <span class="text-lg font-semibold text-gray-800 dark:text-gray-200"
                >{priceOption.type.charAt(0).toUpperCase() + priceOption.type.slice(1)}:</span
              >
              <span class="text-xl font-bold text-green-600 dark:text-green-400"
                >{priceOption.value}</span
              >
            </button>
          {/each}
        </div>
        <div class="mt-4">
          {#if game.licensed}
            <Button classes="w-full">Launch</Button>
          {:else}
            <Button
              variant="outline"
              classes="w-full p-2 gap-1 border-gray-600 dark:border-gray-400 hover:border-accent hover:text-accent"
            >
              <ShoppingCart width="16" height="16" />
              Buy License
            </Button>
          {/if}
        </div>
      </div>
    </div>
  {:else}
    <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Game Not Found</h1>
    <p class="text-gray-700 dark:text-gray-300">The game you are looking for could not be found.</p>
  {/if}
</div>
