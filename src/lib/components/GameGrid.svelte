<script lang="ts">
  import Card from './Card.svelte';
  import Button from './Button.svelte';
  import { ShoppingCart } from '@lucide/svelte';
  import { getStatusColorClass } from '../utils/getStatusColor';
  import { goto } from '$app/navigation';
  export let items: {
    id: number;
    name: string;
    image: string;
    status: string;
    licensed: boolean;
  }[] = [];
  let displayLimit = 9; // Initial number of games to display
  const loadMore = () => {
    displayLimit += 9; // Load 9 more games at a time
  };
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
  {#each items.slice(0, displayLimit) as item (item.id)}
    <Card
      classes="relative bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-gray-500 border border-gray-300 dark:border-transparent transition-transform duration-200 ease-out hover:scale-[1.02] hover:shadow-lg cursor-pointer"
      onClick={() => goto(`/games/${item.name.toLowerCase().replace(/\s/g, '-')}`)}
    >
      <img src={item.image} alt={item.name} class="w-full h-40 object-cover rounded-t-2xl" />
      <div class="space-y-2 p-4">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold">{item.name}</h2>
          <span class={`px-2 py-1 rounded text-sm font-medium ${getStatusColorClass(item.status)}`}>
            {item.status}
          </span>
        </div>
        <div class="flex gap-2">
          {#if item.licensed}
            <Button
              classes="w-full"
              on:click={(e) => {
                e.stopPropagation();
                goto(`/games/${item.name.toLowerCase().replace(/\s/g, '-')}`);
              }}>Launch</Button
            >
          {:else}
            <Button
              variant="outline"
              classes="w-full p-2 gap-1 border-gray-600 dark:border-gray-400 hover:border-accent hover:text-accent"
              on:click={(e) => {
                e.stopPropagation();
                goto(`/games/${item.name.toLowerCase().replace(/\s/g, '-')}`);
              }}
            >
              View Details
            </Button>
          {/if}
        </div>
      </div>
    </Card>
  {/each}
</div>

{#if items.length > displayLimit}
  <div class="col-span-full flex justify-center mt-4">
    <Button
      on:click={loadMore}
      classes="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      Load More
    </Button>
  </div>
{/if}
