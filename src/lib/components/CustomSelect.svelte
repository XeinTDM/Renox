<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { onMount, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();

  export let value: string;
  export let options: string[];

  let isOpen = false;
  let customSelectElement: HTMLElement;
  let buttonElement: HTMLButtonElement;
  let activeOptionIndex = -1;

  function toggleOpen() {
    isOpen = !isOpen;
    if (isOpen) {
      // Focus the selected option or the first option when opening
      activeOptionIndex = options.indexOf(value);
      if (activeOptionIndex === -1) {
        activeOptionIndex = 0;
      }
      // Defer focusing to allow the DOM to update
      setTimeout(() => {
        const activeOption = customSelectElement.querySelector(
          `[data-option-index="${activeOptionIndex}"]`,
        ) as HTMLElement;
        activeOption?.focus();
      }, 0);
    } else {
      buttonElement.focus(); // Return focus to the button when closing
    }
  }

  function selectOption(option: string) {
    value = option; // Update the bound value
    isOpen = false;
    dispatch('change', option);
    buttonElement.focus(); // Return focus to the button after selection
  }

  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!isOpen) {
          toggleOpen();
        } else if (activeOptionIndex !== -1) {
          selectOption(options[activeOptionIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        isOpen = false;
        buttonElement.focus();
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          toggleOpen();
        } else {
          activeOptionIndex = (activeOptionIndex + 1) % options.length;
          const nextOption = customSelectElement.querySelector(
            `[data-option-index="${activeOptionIndex}"]`,
          ) as HTMLElement;
          nextOption?.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          toggleOpen();
        } else {
          activeOptionIndex = (activeOptionIndex - 1 + options.length) % options.length;
          const prevOption = customSelectElement.querySelector(
            `[data-option-index="${activeOptionIndex}"]`,
          ) as HTMLElement;
          prevOption?.focus();
        }
        break;
    }
  }

  // Close dropdown if clicked outside
  function handleClickOutside(event: MouseEvent) {
    if (isOpen && customSelectElement && !customSelectElement.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div bind:this={customSelectElement} id="custom-select" class="relative inline-block w-48">
  <button
    type="button"
    bind:this={buttonElement}
    class="p-1 border rounded text-sm cursor-pointer focus:outline-none flex justify-between items-center"
    class:rounded-b-none={isOpen}
    on:click={toggleOpen}
    on:keydown={handleKeyDown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-controls="custom-select-listbox"
    id="custom-select-button"
  >
    {value}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 transform transition-transform duration-200"
      class:rotate-180={isOpen}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isOpen}
    <ul
      id="custom-select-listbox"
      role="listbox"
      aria-labelledby="custom-select-button"
      class="absolute z-10 w-full border border-t-0 rounded-b-lg bg-transparent backdrop-blur-sm"
      style="border-color: currentColor;"
      tabindex="-1"
    >
      {#each options as option, index (option)}
        <li>
          <button
            class="p-1 text-sm cursor-pointer hover:bg-gray-700 hover:text-white w-full text-left"
            on:click={() => selectOption(option)}
            on:keydown={handleKeyDown}
            role="option"
            aria-selected={value === option}
            data-option-index={index}
            tabindex="-1"
          >
            {option}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
