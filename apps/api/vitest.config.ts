import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    exclude: ["dist/**", "node_modules/**"],
    environment: "node",
  },
  resolve: {
    alias: {
      "@plyco/shared": path.resolve(
        __dirname,
        "../../packages/shared/src/index.ts"
      ),
      "@plyco/db": path.resolve(
        __dirname,
        "../../packages/db/src/index.ts"
      ),
    },
  },
})
