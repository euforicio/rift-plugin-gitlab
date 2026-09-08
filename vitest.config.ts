import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "rift-plugin-gitlab",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "dist/**"],
  },
});
