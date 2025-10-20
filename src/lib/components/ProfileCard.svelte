<script lang="ts">
  export let title: string;
</script>

<div class="p-4 rounded-lg">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
  <div class="mt-2 space-y-2">
    <slot />
  </div>
</div>
