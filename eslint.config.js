import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['docs/**', 'node_modules/**'],
  },
  {
    files: ['eslint.config.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.ts', 'rspack.config.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      globals: {
        document: 'readonly',
        window: 'readonly',
      },
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    ignores: ['**/*.d.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.d.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
      },
    },
  },
];
