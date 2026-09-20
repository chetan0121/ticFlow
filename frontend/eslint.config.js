import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

import {
  createTypeScriptConfig,
  defineConfig,
  sharedIgnores,
  sharedJavaScriptConfig,
  sharedPrettierConfig,
} from "../eslint.config.js";

const frontendTypeScriptConfig = createTypeScriptConfig({
  files: ["src/**/*.{ts,tsx}"],
  globals: {
    ...globals.browser,
    ...globals.es2022,
  },
  project: ["./tsconfig.json"],
  tsconfigRootDir: import.meta.dirname,
});

export default defineConfig([
  sharedIgnores,
  sharedJavaScriptConfig,
  {
    ...frontendTypeScriptConfig,
    extends: [
      ...frontendTypeScriptConfig.extends,
      reactHooks.configs.flat.recommended,
    ],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...frontendTypeScriptConfig.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  sharedPrettierConfig,
]);
