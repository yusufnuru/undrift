import { defineConfig } from "vite";
import { resolve } from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [tailwindcss(), react(), crx({ manifest })],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, "src/dashboard/index.html"),
        blocked: resolve(__dirname, "src/blocked/index.html"),
      },
    },
  },
});
