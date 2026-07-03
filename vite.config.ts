import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` must match how GitHub Pages serves the site:
//   • Project page  -> "/<repo-name>/"  (e.g. username.github.io/connexionz/)
//   • User/org page -> "/"              (repo named username.github.io)
//   • Custom domain -> "/"
// Only applied to the production build so local `npm run dev` stays at "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/connexionz/" : "/",
  plugins: [react()],
}));
