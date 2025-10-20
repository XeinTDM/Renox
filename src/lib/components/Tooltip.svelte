<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let content: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';

  let showTooltip = false;
  let tooltipElement: HTMLElement;
  let triggerElement: HTMLElement;

  const dispatch = createEventDispatcher();

  function handleMouseEnter() {
    showTooltip = true;
    dispatch('show');
  }

  function handleMouseLeave() {
    showTooltip = false;
    dispatch('hide');
  }

  // Position the tooltip dynamically
  $: if (showTooltip && tooltipElement) {
    tooltipElement.style.top = '';
    tooltipElement.style.left = '';
    tooltipElement.style.bottom = '';
    tooltipElement.style.right = '';
    tooltipElement.style.transform = '';
    tooltipElement.style.margin = '';

    switch (position) {
      case 'top':
        tooltipElement.style.left = '50%';
        tooltipElement.style.bottom = '100%';
        tooltipElement.style.marginBottom = '12px';
        tooltipElement.style.transform = 'translateX(-50%)';
        break;
      case 'bottom':
        tooltipElement.style.left = '50%';
        tooltipElement.style.top = '100%';
        tooltipElement.style.marginTop = '12px';
        tooltipElement.style.transform = 'translateX(-50%)';
        break;
      case 'left':
        tooltipElement.style.top = '50%';
        tooltipElement.style.right = '100%';
        tooltipElement.style.marginRight = '12px';
        tooltipElement.style.transform = 'translateY(-50%)';
        break;
      case 'right':
        tooltipElement.style.top = '50%';
        tooltipElement.style.left = '100%';
        tooltipElement.style.marginLeft = '12px';
        tooltipElement.style.transform = 'translateY(-50%)';
        break;
    }
  }
</script>

<div
  class="relative inline-block"
  role="tooltip"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  bind:this={triggerElement}
>
  <slot></slot>

  {#if showTooltip}
    <div
      bind:this={tooltipElement}
      class="absolute z-50 px-3 py-2 text-sm font-medium text-white bg-black border border-gray-700 rounded-lg shadow-sm whitespace-nowrap"
      style="pointer-events: none;"
    >
      {content}
      <!-- Arrow for the tooltip (border) -->
      <div
        class="absolute w-0 h-0 border-transparent border-solid
                    {position === 'top'
          ? 'border-t-gray-700 border-t-[9px] border-x-[9px] border-x-transparent left-1/2 -translate-x-1/2 bottom-[-9px]'
          : ''}
                    {position === 'bottom'
          ? 'border-b-gray-700 border-b-[9px] border-x-[9px] border-x-transparent left-1/2 -translate-x-1/2 top-[-9px]'
          : ''}
                    {position === 'right'
          ? 'border-r-gray-700 border-r-[9px] border-y-[9px] border-y-transparent top-1/2 -translate-y-1/2 right-[-9px]'
          : ''}
                    {position === 'left'
          ? 'border-l-gray-700 border-l-[9px] border-y-[9px] border-y-transparent top-1/2 -translate-y-1/2 right-[-9px]'
          : ''}
                "
      ></div>
      <!-- Arrow for the tooltip (fill) -->
      <div
        class="absolute w-0 h-0 border-transparent border-solid
                    {position === 'top'
          ? 'border-t-black border-t-[8px] border-x-[8px] border-x-transparent left-1/2 -translate-x-1/2 bottom-[-8px]'
          : ''}
                    {position === 'bottom'
          ? 'border-b-black border-b-[8px] border-x-[8px] border-x-transparent left-1/2 -translate-x-1/2 top-[-8px]'
          : ''}
                    {position === 'right'
          ? 'border-r-black border-r-[8px] border-y-[8px] border-y-transparent top-1/2 -translate-y-1/2 right-[-8px]'
          : ''}
                    {position === 'left'
          ? 'border-l-black border-l-[8px] border-y-[8px] border-y-transparent top-1/2 -translate-y-1/2 right-[-8px]'
          : ''}
                "
      ></div>
    </div>
  {/if}
</div>

<style lang="postcss">
  /* Add any specific styles here if needed, though Tailwind should handle most */
</style>
