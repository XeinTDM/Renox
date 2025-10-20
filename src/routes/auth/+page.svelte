<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import { invoke } from '@tauri-apps/api/core';
  import { listen } from '@tauri-apps/api/event';
  import { user } from '$lib/stores/userStore';
  import { goto } from '$app/navigation';
  import { Github } from '@lucide/svelte';
  import { onDestroy, onMount } from 'svelte';
  import { showToast } from '$lib/stores/toastStore';

  let loading = false;
  let errorMessage: string | null = null;
  const unlisteners: Array<Promise<() => void>> = [];

  async function signInWithGithub() {
    loading = true;
    errorMessage = null;
    try {
      showToast({
        type: 'info',
        title: 'Sign in',
        message: 'Opening GitHub…',
        notificationType: 'generalSounds',
      });
      await invoke('github_oauth_start');
    } catch (error) {
      console.error('Error starting OAuth flow:', error);
      errorMessage = 'Failed to start the sign-in process. Please try again.';
      showToast({
        type: 'error',
        title: 'Sign in failed',
        message: 'Could not open GitHub',
        notificationType: 'generalSounds',
      });
      loading = false;
    }
  }

  function isValidDeepLink(url: string) {
    try {
      const u = new URL(url);
      return u.protocol === 'rubi:' && u.host === 'auth' && u.pathname === '/github/callback';
    } catch {
      return false;
    }
  }

  async function handleAuthCallback(url: string) {
    if (!isValidDeepLink(url)) {
      console.warn('Ignoring invalid deep link:', url);
      return;
    }
    const u = new URL(url);
    const code = u.searchParams.get('code');
    const state = u.searchParams.get('state');

    if (code && state) {
      try {
        const userInfoString: string = await invoke('github_oauth_callback', { code, state });
        const userInfo = JSON.parse(userInfoString);
        user.set({
          username: userInfo.username,
          licenses: [],
          permissions: {
            role: 'user',
            permissions: ['cheat:view', 'cheat:launch', 'license:view', 'license:add'],
            isActive: true,
          },
        });
        // ensure secure profile is hydrated/persisted
        if (typeof user.hydrate === 'function') {
          await (user as any).hydrate();
        }
        showToast({
          type: 'success',
          title: 'Signed in',
          message: `Welcome, ${userInfo.username}`,
          notificationType: 'generalSounds',
        });
        await goto('/');
      } catch (error) {
        console.error('Error during OAuth callback:', error);
        errorMessage = 'An error occurred during sign-in. Please try again.';
        showToast({
          type: 'error',
          title: 'Sign in failed',
          message: 'Authentication error',
          notificationType: 'generalSounds',
        });
      } finally {
        loading = false;
      }
    } else {
      console.error('OAuth callback failed: missing code or state in URL:', url);
      errorMessage = 'Invalid response from authentication service.';
      showToast({
        type: 'error',
        title: 'Sign in failed',
        message: 'Invalid callback',
        notificationType: 'generalSounds',
      });
      loading = false;
    }
  }

  onMount(() => {
    // Listen for deep link from GitHub
    unlisteners.push(
      listen('deep-link-received', (event) => {
        handleAuthCallback(event.payload as string);
      }),
    );

    unlisteners.push(
      listen('single-instance-activated', (event) => {
        const deepLinkUrl = (event.payload as string[]).find((s) => s.startsWith('rubi://'));
        if (deepLinkUrl) {
          handleAuthCallback(deepLinkUrl);
        }
      }),
    );
  });

  onDestroy(() => {
    unlisteners.forEach((unlistener) => unlistener.then((f) => f()));
  });
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
  <div
    class="w-full max-w-sm p-8 space-y-6 bg-[#111111] border border-gray-800 rounded-xl shadow-2xl"
  >
    <div class="flex flex-col items-center text-center space-y-2">
      <a href="/" class="flex items-center gap-2">
        <img src="/tauri.svg" alt="Rubi Logo" class="w-10 h-10" />
      </a>
      <h1 class="text-3xl font-bold text-white">Welcome to Rubi</h1>
      <p class="text-gray-400">Please sign in to continue</p>
    </div>

    <div class="pt-4" role="status" aria-live="polite">
      <Button
        variant="default"
        classes="w-full h-12 text-lg gap-3"
        on:click={signInWithGithub}
        disabled={loading}
      >
        {#if loading}
          <span class="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span>
          Opening GitHub…
        {:else}
          <Github class="w-6 h-6" />
          Sign In With Github
        {/if}
      </Button>
    </div>

    {#if errorMessage}
      <div class="text-center text-sm text-red-400 pt-2">
        {errorMessage}
      </div>
    {/if}
  </div>

  <footer class="absolute bottom-4 text-center text-gray-500 text-sm">
    &copy; {new Date().getFullYear()} Rubi. All Rights Reserved.
  </footer>
</div>
