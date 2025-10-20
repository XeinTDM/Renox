<script lang="ts">
  import { _ } from 'svelte-i18n';
  import Button from '$lib/components/Button.svelte';
  import { appSettings } from '$lib/stores/appSettings';
  import { theme } from '$lib/stores/theme';
</script>

<div class="p-4">
  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
    {$_('appearanceSettings.title')}
  </h2>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('appearanceSettings.accentColor.label')}</p>
    <div class="flex gap-2">
      {#each ['red', 'blue', 'violet', 'emerald', 'amber', 'pink', 'slate'] as color (color)}
        <button
          class="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600"
          class:bg-red-500={color === 'red'}
          class:bg-blue-500={color === 'blue'}
          class:bg-violet-500={color === 'violet'}
          class:bg-emerald-500={color === 'emerald'}
          class:bg-amber-500={color === 'amber'}
          class:bg-pink-500={color === 'pink'}
          class:bg-slate-500={color === 'slate'}
          class:ring-2={color === $appSettings.accentColor}
          class:ring-gray-800={color === $appSettings.accentColor && $theme === 'light'}
          class:ring-gray-200={color === $appSettings.accentColor && $theme === 'dark'}
          aria-label={$_('appearanceSettings.accentColor.selectAccent', { values: { color } })}
          on:click={() => appSettings.update((s) => ({ ...s, accentColor: color as any }))}
        ></button>
      {/each}
    </div>
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('appearanceSettings.fontSize.label')}</p>
    <div class="flex items-center gap-2">
      <select
        aria-label="Select font size"
        class="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-[#111111]"
        bind:value={$appSettings.fontScale}
        on:change={() =>
          appSettings.update((s) => ({ ...s, fontScale: Number($appSettings.fontScale) as any }))}
      >
        <option value="0.875">{$_('appearanceSettings.fontSize.small')}</option>
        <option value="1">{$_('appearanceSettings.fontSize.medium')}</option>
        <option value="1.125">{$_('appearanceSettings.fontSize.large')}</option>
        <option value="1.25">{$_('appearanceSettings.fontSize.xl')}</option>
      </select>
    </div>
  </div>
  <div class="flex items-center justify-between mt-2">
    <p class="text-gray-700 dark:text-gray-300">{$_('appearanceSettings.density.label')}</p>
    <div class="flex gap-2">
      <Button
        variant={$appSettings.density === 'cozy' ? 'default' : 'outline'}
        on:click={() => appSettings.update((s) => ({ ...s, density: 'cozy' }))}
        >{$_('appearanceSettings.density.cozy')}</Button
      >
      <Button
        variant={$appSettings.density === 'compact' ? 'default' : 'outline'}
        on:click={() => appSettings.update((s) => ({ ...s, density: 'compact' }))}
        >{$_('appearanceSettings.density.compact')}</Button
      >
    </div>
  </div>
</div>
