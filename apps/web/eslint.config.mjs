import { FlatCompat } from "@eslint/eslintrc"
import eslintPluginImport from "eslint-plugin-import"

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      import: eslintPluginImport,
    },
    settings: {
      "import/resolver": {
        typescript: {},
        node: true,
      },
    },
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            { pattern: "@/components/**", group: "internal", position: "before" },
            { pattern: "@/services/**", group: "internal", position: "before" },
            { pattern: "@/shared/**", group: "internal", position: "before" },
            { pattern: "@/features/**", group: "internal" },
          ],
          pathGroupsExcludedImportTypes: ["type"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "never",
        },
      ],
    },
  },
]

export default eslintConfig
