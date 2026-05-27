import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Bind to all interfaces so the dev server is reachable from phones on the
  // same Wi-Fi network. The terminal will print a "Network:" URL on startup.
  server: { host: true, port: 5173, open: false, strictPort: false },
  // GitHub Pages serves the site at /<repo-name>/ — relative base lets the
  // built assets resolve correctly there as well as anywhere else.
  base: './',
});
