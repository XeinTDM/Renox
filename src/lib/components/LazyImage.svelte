<script lang="ts">
  export let src: string;
  export let alt: string;
  export let classes: string = '';
  let loaded = false;

  function handleLoad() {
    loaded = true;
  }
</script>

<div class="relative {classes}">
  {#if !loaded}
    <div class="absolute inset-0 flex items-center justify-center">
      <!-- Simple spinner/placeholder -->
      <svg
        class="animate-spin h-5 w-5 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  {/if}
  <img
    {src}
    {alt}
    class="w-full h-full object-cover transition-opacity duration-500 {loaded
      ? 'opacity-100'
      : 'opacity-0'}"
    loading="lazy"
    on:load={handleLoad}
  />
</div>

<style>
  /* Add any specific styles for LazyImage if needed */
</style>
