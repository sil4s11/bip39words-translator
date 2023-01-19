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
        name: "BIP39 Word Translator",
        short_name: "BIP39 Word Translator",
        display: "standalone",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "./assets/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
          },
          {
            src: "./assets/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
          },
          {
            src: "./assets/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
          },
          {
            src: "./assets/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
          },
          {
            src: "./assets/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
          },
          {
            src: "./assets/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "./assets/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
          },
          {
            src: "./assets/icons/icon-512x512.png",
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
      _stream_duplex:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/duplex",
      _stream_passthrough:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/passthrough",
      _stream_readable:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/readable",
      _stream_writable:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/writable",
      _stream_transform:
        "rollup-plugin-node-polyfills/polyfills/readable-stream/transform",
    },
  },
  build: {
    target: "esnext",
  },
});
