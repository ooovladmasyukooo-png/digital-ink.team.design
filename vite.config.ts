import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Bind IPv4 + IPv6 so http://127.0.0.1:5173 works (not only ::1).
    host: true,
    port: 5173,
    strictPort: true,
  },
});
