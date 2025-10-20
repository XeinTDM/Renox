<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { appSettings } from '$lib/stores/appSettings';
</script>

<div class="p-4">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
    {$_('brandingSettings.title')}
  </h2>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
    <div class="flex flex-col gap-1">
      <label for="appName" class="text-sm text-gray-700 dark:text-gray-300"
        >{$_('brandingSettings.appName')}</label
      >
      <input
        id="appName"
        class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#111111]"
        value={$appSettings.brand.appName}
        on:input={(e) =>
          appSettings.update((s) => ({
            ...s,
            brand: { ...s.brand, appName: e.currentTarget?.value || '' },
          }))}
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="logoUrl" class="text-sm text-gray-700 dark:text-gray-300"
        >{$_('brandingSettings.logoUrl')}</label
      >
      <input
        id="logoUrl"
        class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#111111]"
        value={$appSettings.brand.logoUrl}
        on:input={(e) =>
          appSettings.update((s) => ({
            ...s,
            brand: { ...s.brand, logoUrl: e.currentTarget?.value || '' },
          }))}
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="websiteUrl" class="text-sm text-gray-700 dark:text-gray-300"
        >{$_('brandingSettings.websiteUrl')}</label
      >
      <input
        id="websiteUrl"
        class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#111111]"
        value={$appSettings.brand.websiteUrl}
        on:input={(e) =>
          appSettings.update((s) => ({
            ...s,
            brand: { ...s.brand, websiteUrl: e.currentTarget?.value || '' },
          }))}
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="supportUrl" class="text-sm text-gray-700 dark:text-gray-300"
        >{$_('brandingSettings.supportUrl')}</label
      >
      <input
        id="supportUrl"
        class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#111111]"
        value={$appSettings.brand.supportUrl}
        on:input={(e) =>
          appSettings.update((s) => ({
            ...s,
            brand: { ...s.brand, supportUrl: e.currentTarget?.value || '' },
          }))}
      />
    </div>
  </div>
  <div class="flex items-center gap-3 mt-3">
    <img src={$appSettings.brand.logoUrl} alt="Logo preview" class="w-10 h-10 rounded" />
    <span class="text-sm text-gray-600 dark:text-gray-400">{$_('brandingSettings.preview')}</span>
  </div>
</div>
