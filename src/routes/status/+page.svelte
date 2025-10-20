<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { CheckCircle, XCircle, Info } from '@lucide/svelte';
  import { games } from '$lib/data/games';
  import { goto } from '$app/navigation';

  // In a real application, this data would come from an API or a store
  const services = [
    ...games.map((game) => ({
      name: game.name,
      status:
        game.status.toLowerCase().includes('undetected') ||
        game.status.toLowerCase().includes('expires') ||
        game.status.toLowerCase().includes('not licensed')
          ? 'operational'
          : game.status.toLowerCase(),
      lastUpdated: '2025-08-06 10:00 AM', // Placeholder, as games data doesn't have this
      statusText: game.status,
      timestamp:
        game.status.toLowerCase().includes('updating') ||
        game.status.toLowerCase().includes('detected') ||
        game.status.toLowerCase().includes('maintenance')
          ? `(since ${new Date().toLocaleTimeString()})`
          : undefined,
    })),
    {
      name: 'Payment Gateway',
      status: 'operational',
      lastUpdated: '2025-08-06 09:50 AM',
      statusText: 'Operational',
      timestamp: undefined as string | undefined,
    },
  ];

  let systemStatus: 'operational' | 'degraded' | 'down' = 'operational';
  type ServiceWithText = {
    name: string;
    status: string;
    lastUpdated: string;
    statusText: string;
    timestamp?: string;
  };
  let statusMessages: { name: string; status: string; statusTerm: string; timestamp?: string }[] =
    [];

  $: {
    let hasDegraded = false;
    let hasDown = false;
    let newStatusMessages: {
      name: string;
      status: string;
      statusTerm: string;
      timestamp?: string;
    }[] = [];

    (services as ServiceWithText[]).forEach((service) => {
      if (service.status === 'degraded') {
        hasDegraded = true;
        newStatusMessages = [
          ...newStatusMessages,
          {
            name: service.name,
            status: service.status,
            statusTerm: $_('statusPage.statusTerms.' + service.status),
            timestamp: service.timestamp,
          },
        ];
      } else if (service.status === 'down') {
        hasDown = true;
        newStatusMessages = [
          ...newStatusMessages,
          {
            name: service.name,
            status: service.status,
            statusTerm: $_('statusPage.statusTerms.' + service.status),
            timestamp: service.timestamp,
          },
        ];
      } else if (service.status === 'updating') {
        hasDegraded = true;
        newStatusMessages = [
          ...newStatusMessages,
          {
            name: service.name,
            status: service.status,
            statusTerm: $_('statusPage.statusTerms.' + service.status),
            timestamp: service.timestamp,
          },
        ];
      } else if (service.status === 'detected') {
        hasDown = true;
        newStatusMessages = [
          ...newStatusMessages,
          {
            name: service.name,
            status: service.status,
            statusTerm: $_('statusPage.statusTerms.' + service.status),
            timestamp: service.timestamp,
          },
        ];
      } else if (service.status === 'maintenance') {
        hasDegraded = true;
        newStatusMessages = [
          ...newStatusMessages,
          {
            name: service.name,
            status: service.status,
            statusTerm: $_('statusPage.statusTerms.' + service.status),
            timestamp: service.timestamp,
          },
        ];
      }
    });

    statusMessages = newStatusMessages; // Reassign the array

    if (hasDown) {
      systemStatus = 'down';
    } else if (hasDegraded) {
      systemStatus = 'degraded';
    } else {
      systemStatus = 'operational';
    }
  }

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

  function getOverallStatusClasses(status: 'operational' | 'degraded' | 'down') {
    return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-500';
  }
</script>

<div class="p-6 space-y-6">
  <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{$_('status.title')}</h1>

  {#if systemStatus !== 'operational'}
    <div
      class="p-4 rounded-lg flex items-start gap-4 border {getOverallStatusClasses(systemStatus)}"
    >
      <svelte:component
        this={getStatusIcon(systemStatus)}
        class="w-6 h-6 flex-shrink-0 {getStatusColor(systemStatus)}"
      />
      <div>
        {#each statusMessages as message (message.name)}
          <p class="text-sm">
            {message.name}: <span class={getStatusColor(message.status)}>{message.statusTerm}</span>
            {message.timestamp || ''}
          </p>
        {/each}
      </div>
    </div>
  {/if}

  <div class="space-y-4">
    {#each services as service (service.name)}
      <button
        class="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-700 rounded-lg w-full {service.name !==
        'Payment Gateway'
          ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
          : ''}"
        on:click={() => {
          if (service.name !== 'Payment Gateway') {
            goto(`/games/${service.name.toLowerCase().replace(/\s/g, '-')}`);
          }
        }}
        disabled={service.name === 'Payment Gateway'}
      >
        <div class="flex items-center gap-4">
          <svelte:component
            this={getStatusIcon(service.status)}
            class="w-5 h-5 {getStatusColor(service.status)}"
          />
          <div>
            <p class="font-semibold text-gray-800 dark:text-gray-200">{service.name}</p>
            <p class="text-sm {getStatusColor(service.status)}">
              {$_('statusPage.statusTerms.' + service.status)}
            </p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-600 dark:text-gray-400">{$_('statusPage.lastUpdated')}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">{service.lastUpdated}</p>
        </div>
      </button>
    {/each}
  </div>

  <div
    class="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800"
  >
    <p>{$_('statusPage.updateInfo')}</p>
    <p>{$_('statusPage.supportInfo')}</p>
  </div>
</div>
