import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : "/",
  server: {
    proxy: {
      "/api-proxy": {
        target: "https://ai.tfdst.xyz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, ""),
      },
    },
  },
});
