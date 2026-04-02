import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      // VirusTotal API — CORS bypass (sadece dev ortamında)
      '/api/virustotal': {
        target: 'https://www.virustotal.com/api/v3',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/virustotal/, ''),
        secure: true,
      },
      '/api/ninja': {
        target: 'https://api.api-ninjas.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ninja/, ''),
        secure: true,
      },
    },
  },
});
