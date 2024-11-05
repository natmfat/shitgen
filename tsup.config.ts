import { defineConfig } from "tsup";

export default defineConfig({
  dts: true,
  format: "esm",
  entry: [
    "src",
    "!src/**/__tests__/**",
    "!src/**/*.test.*",
    "!src/database.ts",
  ],
});
