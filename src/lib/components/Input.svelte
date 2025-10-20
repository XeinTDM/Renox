<script lang="ts">
  export let placeholder: string = '';
  export let value: string = '';
  export let classes: string = '';
  export let ariaLabel: string | undefined = undefined;
</script>

<input
  type="text"
  {placeholder}
  bind:value
  class={'w-full px-3 py-2 bg-gray-100 dark:bg-[#111111] text-gray-900 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600 focus:outline-none focus:caret-red-500 ' +
    classes}
  aria-label={ariaLabel}
  {...$$restProps}
/>
