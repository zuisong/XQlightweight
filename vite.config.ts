import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [

  ],
  build: {
    outDir: "docs",
    target: 'es2015'
  }
});
