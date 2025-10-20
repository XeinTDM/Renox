<script lang="ts">
  import { onMount } from 'svelte';
  import { activityLog, type UserActivity } from '$lib/stores/activityLogStore';
  import { createEventDispatcher } from 'svelte';
  import CustomSelect from '$lib/components/CustomSelect.svelte';

  const dispatch = createEventDispatcher();

  let filterType: string = 'All'; // State for current filter
  let filteredActivity: UserActivity[] = [];
  const activityTypes = ['All', 'Login', 'License Added', 'Profile Update'];

  onMount(() => {
    // Simulate fetching activity data
    activityLog.set([
      { id: 1, type: 'Login', timestamp: new Date('2025-07-30T10:00:00Z') },
      { id: 2, type: 'License Added', timestamp: new Date('2025-07-30T11:30:00Z') },
      { id: 3, type: 'Profile Update', timestamp: new Date('2025-07-31T09:00:00Z') },
      { id: 4, type: 'Login', timestamp: new Date('2025-08-01T14:00:00Z') },
      { id: 5, type: 'License Added', timestamp: new Date('2025-08-02T08:00:00Z') },
    ]);
  });

  // Reactively update filteredActivity when activityLog or filterType changes
  $: filteredActivity =
    filterType === 'All'
      ? $activityLog
      : $activityLog.filter((activity) => activity.type === filterType);

  function formatTimestamp(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString(undefined, options);
  }

  function clearActivity() {
    activityLog.set([]);
    dispatch('clear'); // Dispatch event for parent component if needed
  }
</script>

<div class="p-4 border rounded-lg">
  <h2 class="text-lg font-semibold flex items-center justify-between">
    <span>Recent Activity</span>
    <div class="flex items-center space-x-2">
      <CustomSelect bind:value={filterType} options={activityTypes} />
      <button
        on:click={clearActivity}
        class="text-white hover:text-red-500 cursor-pointer"
        aria-label="Clear Activity"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm-1 3a1 1 0 100 2h8a1 1 0 100-2H6z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </h2>
  <div class="mt-2 space-y-2">
    {#if filteredActivity.length > 0}
      <ul class="list-disc pl-5">
        {#each filteredActivity as activity (activity.id)}
          <li>
            {activity.type} at {formatTimestamp(activity.timestamp)}
          </li>
        {/each}
      </ul>
    {:else}
      <p>No recent activity for the selected filter.</p>
    {/if}
  </div>
</div>
