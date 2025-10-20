import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
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
