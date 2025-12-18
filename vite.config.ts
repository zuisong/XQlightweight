/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "docs",
  },
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./test-setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
