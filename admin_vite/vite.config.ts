import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  // base: "./",
  server: {
    host: true, // allow external connections
    port: 3000, // or your preferred port
    allowedHosts: [
      "admintest.orderat.ai", // ✅ allow your staging domain
    ],
    hmr: false,
  },
  plugins: [
    svgr(),
    react({
      jsxRuntime: "automatic",
      babel: {
        presets: ["@babel/preset-react"],
      },
      include: "**/*.{js,jsx,ts,tsx}",
    }),
  ],
  esbuild: {
    loader: "jsx",
    include: [/src\/.*\.js$/, /src\/.*\.jsx$/],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      events: "events/",
    },
  },
});
