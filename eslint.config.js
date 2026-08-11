import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import configPrettier from 'eslint-config-prettier'

export { defineConfig }

export const sharedIgnores = globalIgnores(['dist', 'node_modules', 'build', 'coverage', '*.config.*'])
export const sharedJavaScriptConfig = js.configs.recommended
export const sharedPrettierConfig = configPrettier

export function createTypeScriptConfig({ files, globals, project, tsconfigRootDir }) {
  return {
    files,
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      ecmaVersion: 2022,
      globals,
      parserOptions: {
        project,
        tsconfigRootDir,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  }
}

export default defineConfig([
  sharedIgnores,
  sharedJavaScriptConfig,
  sharedPrettierConfig,
])
