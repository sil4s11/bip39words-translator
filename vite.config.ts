import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import { NgmiPolyfill } from "vite-plugin-ngmi-polyfill";

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [
    vue(),
    NgmiPolyfill({
      rollupPolyfillOptions: {
        crypto: true,
      },
    }),
    VitePWA({
      manifest: {
        name: "BIP39 Utils",
        short_name: "BIP39 Utils",
        display: "standalone",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "./assets/icons/72.webp",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "./assets/icons/96.webp",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "./assets/icons/128.webp",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "./assets/icons/144.webp",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "./assets/icons/152.webp",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "./assets/icons/192.webp",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./assets/icons/384.webp",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "./assets/icons/512.webp",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      buffer: "rollup-plugin-node-polyfills/polyfills/buffer-es6",
      process: "rollup-plugin-node-polyfills/polyfills/process-es6",
      crypto: "rollup-plugin-node-polyfills/polyfills/crypto-browserify",
      stream: "rollup-plugin-node-polyfills/polyfills/stream",
      util: "rollup-plugin-node-polyfills/polyfills/util",
    },
  },
  build: {
    target: "esnext",
  },
});
