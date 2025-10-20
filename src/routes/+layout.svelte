<script lang="ts">
  import '../app.css';
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { dev } from '$app/environment';
  import {
    Gamepad,
    User,
    Settings,
    Download,
    Github,
    Twitter,
    MessageCircle,
    Sun,
    Moon,
    Lock,
    Shield,
  } from '@lucide/svelte';

  import Button from '$lib/components/Button.svelte';
  import { Tooltip, ToastContainer } from '$lib/components';
  import LockScreen from '$lib/components/LockScreen.svelte';
  import ErrorReportModal from '$lib/components/ErrorReportModal.svelte';
  import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';

  import { theme } from '$lib/stores/theme';
  import { latestVersion } from '$lib/stores/versionStore';
  import { user } from '$lib/stores/userStore';
  import { appStatus } from '$lib/stores/appStatus';
  import { appSettings } from '$lib/stores/appSettings';
  import { isLocked } from '$lib/stores/lockStore';
  import { errorLogs, addErrorEntry, type ErrorEntry } from '$lib/stores/errorLogStore';

  import { invoke } from '@tauri-apps/api/core';
  import { initI18n, waitLocale } from '$lib/utils/i18n';

  initI18n();

  const lastError = writable<ErrorEntry | null>(null);
  const showErrorReport = writable(false);

  let hasHydrated = false;

  onMount(() => {
    (async () => {
      // Hydrate secure user profile as early as possible
      if (typeof (user as any).hydrate === 'function' && !hasHydrated) {
        await (user as any).hydrate();
        hasHydrated = true;
      }
      if (dev) {
        user.set({
          username: 'RubiDev',
          licenses: ['DEV-LICENSE'],
          permissions: {
            role: 'admin',
            permissions: [
              'cheat:view',
              'cheat:launch',
              'cheat:manage',
              'cheat:create',
              'cheat:delete',
              'license:view',
              'license:add',
              'license:manage',
              'user:view',
              'user:manage',
              'role:manage',
              'system:settings',
              'system:admin',
            ],
            isActive: true,
          },
        });
      }
    })();

    const unsubscribeUser = user.subscribe((currentUser) => {
      const isAuthenticated = currentUser && currentUser.username !== null;

      if (!dev && !isAuthenticated && $page.url.pathname !== '/auth') {
        goto('/auth');
      }
    });
    // Require PIN to decrypt on boot
    if ($appSettings.pinEnabled && $appSettings.encryptedLocalData) {
      isLocked.set(true);
    }

    // Global error handlers
    function handleWindowError(e: ErrorEvent) {
      const entry: ErrorEntry = {
        id: crypto.randomUUID(),
        timeISO: new Date().toISOString(),
        type: 'error',
        message: e.message || 'Unknown error',
        stack: e.error?.stack,
        details: {
          filename: (e as any).filename,
          lineno: (e as any).lineno,
          colno: (e as any).colno,
        },
      };
      addErrorEntry(entry);
      lastError.set(entry);
      showErrorReport.set(true);
    }
    function handleUnhandledRejection(e: PromiseRejectionEvent) {
      const reason: any = (e && (e as any).reason) ?? {};
      const entry: ErrorEntry = {
        id: crypto.randomUUID(),
        timeISO: new Date().toISOString(),
        type: 'unhandledrejection',
        message: reason?.message || String(reason) || 'Unhandled rejection',
        stack: reason?.stack,
      };
      addErrorEntry(entry);
      lastError.set(entry);
      showErrorReport.set(true);
    }
    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // invoke<string>("get_app_version")
    //   .then(version => {
    //     latestVersion.set(version);
    //   })
    //   .catch(error => {
    //     console.error("Failed to get app version:", error);
    //   });

    // Inactivity listeners for auto-lock
    const activityEvents = ['mousemove', 'keydown', 'click', 'wheel', 'touchstart'];
    activityEvents.forEach((evt) =>
      window.addEventListener(evt, resetAutoLockTimer, { passive: true }),
    );
    scheduleAutoLock();

    return () => {
      unsubscribeUser();
      if (autoLockTimer) clearTimeout(autoLockTimer);
      activityEvents.forEach((evt) => window.removeEventListener(evt, resetAutoLockTimer));
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  });

  $: {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', $theme === 'dark');
      // Set accent data attribute for CSS variable-driven accent utilities
      document.documentElement.setAttribute('data-accent', $appSettings.accentColor || 'red');
      document.documentElement.setAttribute('data-density', $appSettings.density || 'cozy');
      document.documentElement.style.setProperty(
        '--app-font-scale',
        String($appSettings.fontScale || 1),
      );
      document.documentElement.setAttribute('lang', $appSettings.locale || 'en');
    }
  }

  function toggleTheme() {
    theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
  }

  let autoLockTimer: any;

  function scheduleAutoLock() {
    if (autoLockTimer) clearTimeout(autoLockTimer);
    const minutes = $appSettings.autoLockMinutes;
    if (!minutes || minutes <= 0) return;
    autoLockTimer = setTimeout(
      () => {
        // Auto-lock app instead of logging out
        isLocked.set(true);
      },
      minutes * 60 * 1000,
    );
  }

  function resetAutoLockTimer() {
    scheduleAutoLock();
  }

  $: ($appSettings.autoLockMinutes, scheduleAutoLock());

  // Handle lock on minimize
  $: if ($appSettings.lockOnMinimize && $appSettings.pinEnabled) {
    // This will trigger when minimizeToTray changes
    // The actual minimize logic is in the toggleMinimizeToTray function
  }
</script>

{#await waitLocale()}
  <div>Loading...</div>
{:then _}
  {#if $page.url.pathname === '/auth'}
    <slot />
  {:else}
    <div
      class="flex flex-col min-h-screen density-pad space-y-4 bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-gray-100"
    >
      <LockScreen />
      <ErrorReportModal bind:open={$showErrorReport} lastError={$lastError} />
      <ToastContainer position="bottom-right" />
      <ConfirmationModal />
      <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-center gap-4">
          <a href="/" class="flex items-center gap-2">
            {#if $appSettings?.brand?.logoUrl}
              <img src={$appSettings.brand.logoUrl} alt="Logo" class="w-8 h-8 rounded-full" />
            {:else}
              <img src="/favicon.svg" alt="Logo" class="w-8 h-8 rounded-full" />
            {/if}
          </a>
          <div class="leading-tight">
            <p class="text-sm text-gray-700 dark:text-gray-300 font-semibold">
              {$appSettings?.brand?.appName || 'App'}
            </p>
            <p class="text-xs text-gray-700 dark:text-gray-300">
              Logged in as:<strong class="ml-1">{$user.username}</strong>
            </p>
            <div class="flex gap-2">
              <a
                href="/cheats"
                class="flex items-center gap-1 text-xs text-red-400 dark:text-red-300 hover:underline"
              >
                <Gamepad class="w-3 h-3" />
                Manage Cheats
              </a>
              {#if $user.permissions.role !== 'user'}
                <a
                  href="/admin"
                  class="flex items-center gap-1 text-xs text-blue-400 dark:text-blue-300 hover:underline"
                >
                  <Shield class="w-3 h-3" />
                  Admin Panel
                </a>
              {/if}
            </div>
          </div>
        </div>
        <div class="flex gap-2">
          <Tooltip content="Toggle to {$theme === 'dark' ? 'light' : 'dark'} mode" position="left">
            <Button
              on:click={toggleTheme}
              variant="outline"
              classes="gap-1 h-[42px] p-2 border-gray-600 dark:border-gray-400 text-gray-500 dark:text-gray-300 hover:text-accent mr-2"
              aria-label="Toggle {$theme === 'dark' ? 'light' : 'dark'} theme"
            >
              {#if $theme === 'dark'}
                <Sun class="w-4 h-4" />
              {:else}
                <Moon class="w-4 h-4" />
              {/if}
            </Button>
          </Tooltip>
          <Tooltip content="Lock Application" position="bottom">
            <Button
              on:click={() => isLocked.set(true)}
              variant="outline"
              classes="gap-1 h-[42px] p-2 border-gray-600 dark:border-gray-400 text-gray-500 dark:text-gray-300 hover:text-accent"
            >
              <Lock class="w-4 h-4" />
              Lock
            </Button>
          </Tooltip>
          <Button
            on:click={() => goto('/settings')}
            variant="outline"
            classes="gap-1 p-2 border-gray-600 dark:border-gray-400 text-gray-500 dark:text-gray-300 hover:text-accent"
          >
            <Settings class="w-4 h-4" />
            Settings
          </Button>
          <Button variant="destructive" classes="hover:bg-accent-600" on:click={() => user.logout()}
            >Logout</Button
          >
        </div>
      </header>

      <main class="flex-grow">
        <slot />
      </main>

      <footer
        class="flex flex-col md:flex-row justify-between items-start md:items-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-300 dark:border-gray-700 pt-4 gap-2"
      >
        <div class="space-x-4 flex flex-wrap items-center">
          <span>Rubi Loader v{$latestVersion}</span>
          <span class="mr-[5px]">Status: </span>
          <Tooltip content="Status of all our applications">
            <a href="/status" class="hover:text-accent">{$appStatus}</a>
          </Tooltip>
          <Button
            variant="ghost"
            classes="flex items-center gap-1 text-gray-500 dark:text-gray-300 hover:text-accent"
            on:click={() => {
              /* TODO: Implement Download Dependencies functionality */
            }}
          >
            <Download width="16" />
            Download Dependencies
          </Button>
        </div>
        <div class="flex gap-2">
          <Tooltip content="GitHub">
            <a href="https://github.com/rubi-project" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                classes="text-gray-500 dark:text-gray-300 hover:text-accent"
                aria-label="GitHub"
              >
                <Github class="w-4 h-4" />
              </Button>
            </a>
          </Tooltip>
          <Tooltip content="Twitter">
            <a href="https://twitter.com/rubi-project" target="_blank" rel="noopener noreferrer">
              <Button
                variant="ghost"
                classes="text-gray-500 dark:text-gray-300 hover:text-accent"
                aria-label="Twitter profile"
              >
                <Twitter class="w-4 h-4" />
              </Button>
            </a>
          </Tooltip>
          <Tooltip content="Discord">
            <a
              href="https://discord.com/invite/rubi-project"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                classes="text-gray-500 dark:text-gray-300 hover:text-accent"
                aria-label="Discord invite"
              >
                <MessageCircle class="w-4 h-4" />
              </Button>
            </a>
          </Tooltip>
          <a href="/changelog">
            <Button variant="ghost" classes="text-gray-500 dark:text-gray-300 hover:text-accent"
              >Changelog</Button
            >
          </a>
        </div>
      </footer>
    </div>
  {/if}
{:catch error}
  <div class="text-red-500">Error loading translations: {error.message}</div>
{/await}
