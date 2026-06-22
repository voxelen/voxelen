import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const routerOptions = {
  routesDirectory: "./src/app",
  autoCodeSplitting: true,
  target: "react",
} as const;

export default defineConfig({
  base: process.env.VITE_BASE ?? "/",
  build: { chunkSizeWarningLimit: 1000 },
  optimizeDeps: { exclude: ["@repo/engine-wasm"] },
  plugins: [tanstackRouter(routerOptions), react()],
  resolve: { alias: { "@": "/src" } },
  preview: { host: true, port: 8080 },
  server: { host: true, port: 3000 },
  assetsInclude: ["**/*.wasm"],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${__dirname}/src/assets/styles/_mantine" as mantine;`,
      },
    },
  },
});
