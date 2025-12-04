import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    react(),
    // analyzer()

  ],
  build: {
    outDir: "docs",
    target: 'es2015'
  }
});
