<script lang="ts">
  import { _ } from 'svelte-i18n';
  import changelogData from '$lib/data/changelog.json';
</script>

<div class="p-6 space-y-4">
  <h1 class="text-2xl font-bold">{$_('changelog.title')}</h1>

  {#each changelogData as entry (entry.version)}
    <div class="p-4 border rounded-lg">
      <h2 class="text-lg font-semibold">
        Version {entry.version} <span class="text-sm text-gray-500">({entry.date})</span>
      </h2>
      <ul class="list-disc list-inside mt-2 space-y-1">
        {#each entry.changes as change (change)}
          <li>{change}</li>
        {/each}
      </ul>
    </div>
  {/each}
</div>
