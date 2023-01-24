import suidPlugin from "@suid/vite-plugin";
import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [suidPlugin(), solid()],
  build: {
    target: "esnext",
  }
});
