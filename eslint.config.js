import eslintPluginSvelte from 'eslint-plugin-svelte';
import tseslintPlugin from '@typescript-eslint/eslint-plugin';
import tseslintParser from '@typescript-eslint/parser';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['build/*', '.svelte-kit/*', 'node_modules/*'],
  },
  // Recommended TypeScript ESLint config
  {
    files: ['**/*.ts', '**/*.js'],
    plugins: {
      '@typescript-eslint': tseslintPlugin,
    },
    languageOptions: {
      parser: tseslintParser,
      parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte'],
      },
    },
    rules: {
      ...tseslintPlugin.configs.recommended.rules,
    },
  },
  // Recommended Svelte ESLint config
  ...eslintPluginSvelte.configs['flat/recommended'],
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: eslintPluginSvelte.parser, // Use svelte-eslint-parser for .svelte files
      parserOptions: {
        parser: tseslintParser, // Use TypeScript parser within svelte files
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte'],
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.js'], // Target TypeScript and JavaScript files
    languageOptions: {
      parser: tseslintParser, // Use TypeScript parser for .ts and .js files
      parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.svelte'], // Include .svelte for type checking if needed
      },
    },
  },
  {
    languageOptions: {
      ecmaVersion: 2017,
      sourceType: 'module',
      globals: {
        browser: true,
        es2017: true,
        node: true,
      },
    },
    rules: {
      // Add any custom rules here
    },
  },
  // Prettier integration
  eslintConfigPrettier,
];
