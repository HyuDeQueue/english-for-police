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
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }
            if (id.includes("@fontsource")) {
              return "vendor-fonts";
            }
            if (
              id.includes("node_modules/react-dom") ||
              id.includes("node_modules/react/")
            ) {
              return "vendor-react";
            }
            if (id.includes("node_modules/react-router")) {
              return "vendor-router";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("node_modules/sonner")) {
              return "vendor-sonner";
            }
            if (
              id.includes("node_modules/radix-ui") ||
              id.includes("node_modules/class-variance-authority") ||
              id.includes("node_modules/clsx") ||
              id.includes("node_modules/tailwind-merge")
            ) {
              return "vendor-ui";
            }
            return;
          }

          if (id.includes("/src/data/")) {
            return "data-seed";
          }
          if (id.includes("/src/pages/admin/")) {
            return "admin-pages";
          }
        },
      },
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
      "/api/v1": {
        target: "http://115.73.218.193:1608",
        changeOrigin: true,
      },
    },
  },
});
