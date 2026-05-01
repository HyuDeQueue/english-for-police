import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/asr": {
        target: "http://115.73.218.193:9000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/asr/, ""),
      },
      "/api/tts": {
        target: "http://115.73.218.193:5500",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, ""),
      },
    },
  },
});
