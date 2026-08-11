import globals from 'globals'

import {
  createTypeScriptConfig,
  defineConfig,
  sharedIgnores,
  sharedJavaScriptConfig,
  sharedPrettierConfig,
} from '../eslint.config.js'

export default defineConfig([
  sharedIgnores,
  sharedJavaScriptConfig,
  createTypeScriptConfig({
    files: ['src/**/*.ts'],
    globals: {
      ...globals.node,
      ...globals.es2022,
    },
    project: ['./tsconfig.json'],
    tsconfigRootDir: import.meta.dirname,
  }),
  sharedPrettierConfig,
])
