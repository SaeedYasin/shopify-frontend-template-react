import react from "@vitejs/plugin-react";
import * as fs from "node:fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { compression } from "vite-plugin-compression2";

// Figure out the version which comes from the main package.json
const packageJson =
  process.env.npm_lifecycle_event === "build"
    ? fs.readFileSync("../package.json", "utf-8")
    : "";
const version =
  process.env.npm_lifecycle_event === "build"
    ? `${JSON.parse(packageJson).version}`
    : process.env.npm_package_version;

process.env.npm_package_version = version;
console.log("process.env.npm_package_version", version);

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.SHOPIFY_API_KEY
) {
  console.warn(
    "\nBuilding the frontend app without an API key. The frontend build will not run without an API key. Set the SHOPIFY_API_KEY environment variable when running the build command.\n"
  );
}

if (
  process.env.npm_lifecycle_event === "build" &&
  !process.env.CI &&
  !process.env.VITE_APP_SLUG &&
  !process.env.VITE_MP_TOKEN &&
  !process.env.VITE_BS_TOKEN
) {
  console.warn(
    "\nWarn: Please set the VITE_APP_SLUG/VITE_MP_TOKEN/VITE_BS_TOKEN env variable.\n"
  );
}

const proxyOptions = {
  target: `http://127.0.0.1:${process.env.BACKEND_PORT}`,
  changeOrigin: false,
  secure: true,
  ws: false,
};

const host = process.env.HOST
  ? process.env.HOST.replace(/https?:\/\//, "")
  : "localhost";

let hmrConfig;
if (host === "localhost") {
  hmrConfig = {
    protocol: "ws",
    host: "localhost",
    port: 64999,
    clientPort: 64999,
  };
} else {
  hmrConfig = {
    protocol: "wss",
    host: host,
    port: process.env.FRONTEND_PORT,
    clientPort: 443,
  };
}

export default defineConfig({
  root: dirname(fileURLToPath(import.meta.url)),
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      filter: /\.(json|css|html)$/i,
      exclude: [/\.(html)$/, /\.(br)$/, /\.(gz)$/],
    }),
    compression({
      algorithm: "brotliCompress",
      filter: /\.(json|css|html)$/i,
      exclude: [/\.(html)$/, /\.(br)$/, /\.(gz)$/],
    }),
  ],
  define: {
    "process.env.SHOPIFY_API_KEY": JSON.stringify(process.env.SHOPIFY_API_KEY),
    "process.env.npm_package_version": JSON.stringify(
      process.env.npm_package_version
    ),
  },
  resolve: {
    preserveSymlinks: true,
  },
  build: {
    sourcemap: "hidden",
    rollupOptions: {
      output: {
        manualChunks: {
          "@shopify/polaris": ["@shopify/polaris"],
          "@shopify/app-bridge-react": ["@shopify/app-bridge-react"],
        },
      },
    },
  },
  server: {
    host: "localhost",
    port: process.env.FRONTEND_PORT,
    hmr: hmrConfig,
    proxy: {
      "^/(\\?.*)?$": proxyOptions,
      "^/api(/|(\\?.*)?$)": proxyOptions,
    },
  },
});
