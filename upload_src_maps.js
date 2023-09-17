import { browser } from "@bugsnag/source-maps";
import * as fs from "node:fs";
import { resolve } from "node:path";

async function* getFiles(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else {
      yield res;
    }
  }
}

function getVersion() {
  const packageJson = fs.readFileSync("../package.json", "utf-8");
  return `${JSON.parse(packageJson).version}`;
}

const uploadSrcMaps = async () => {
  const version = getVersion();

  await browser.uploadMultiple({
    apiKey: `${process.env.VITE_BS_TOKEN}`,
    appVersion: version,
    baseUrl: `${process.env.VITE_HOST}/assets`,
    directory: "dist/assets/",
    overwrite: true,
  });
};

const deleteSrcMaps = async () => {
  for await (const f of getFiles("dist/assets/")) {
    if (f.endsWith(".map") || f.endsWith(".map.br") || f.endsWith(".map.gz")) {
      console.log("Deleting map file", f);
      fs.unlinkSync(f);
    }
  }
};

const main = async () => {
  await uploadSrcMaps();
  await deleteSrcMaps();
};

if (process.env.npm_lifecycle_event === "upload") {
  main();
}
