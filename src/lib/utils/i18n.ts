import { init, register, getLocaleFromNavigator, _, locale, waitLocale } from 'svelte-i18n';
import { appSettings } from '$lib/stores/appSettings';
import { get } from 'svelte/store'; // Import get

register('en', () => import('../../locales/en.json'));
register('de', () => import('../../locales/de.json'));
register('es', () => import('../../locales/es.json'));
register('fr', () => import('../../locales/fr.json'));
register('pt', () => import('../../locales/pt.json'));

export function initI18n() {
  // Get the current locale from appSettings for initial setup
  const currentSettings = get(appSettings); // Get current value of the store
  const initialLocale = currentSettings.locale || getLocaleFromNavigator()?.split('-')[0] || 'en';

  init({
    fallbackLocale: 'en',
    initialLocale: initialLocale,
  });

  // Connect the stores
  appSettings.subscribe((settings) => {
    if (settings.locale) {
      locale.set(settings.locale);
    }
  });
}

export { _, locale, waitLocale };
