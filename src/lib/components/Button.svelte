<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let variant: 'default' | 'outline' | 'destructive' | 'ghost' = 'default';
  export let classes: string = '';

  const baseStyles =
    'px-4 py-2 rounded-md font-medium flex items-center transition-colors duration-200 cursor-pointer';

  const variants = {
    default: 'bg-accent text-white hover:bg-accent-600',
    outline:
      'border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700',
    ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-700',
    destructive: 'bg-accent text-white',
  };
</script>

<button
  class="{baseStyles} {variants[variant]} {classes}"
  on:click={(e) => {
    dispatch('click', e);
  }}
  {...$$restProps}
>
  <slot />
</button>
