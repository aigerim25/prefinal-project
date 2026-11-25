import { mkdir, rm, writeFile } from "node:fs/promises";
import { initialDataSample } from "../src/services/initial-data-sample.js";

const outDir = new URL("../public/api/", import.meta.url);
const albumsDir = new URL("albums/", outDir);

await rm(outDir, { recursive: true, force: true });
await mkdir(albumsDir, { recursive: true });

await writeFile(new URL("albums.json", outDir), JSON.stringify(initialDataSample));

for (const album of initialDataSample) {
  await writeFile(new URL(`${album.id}.json`, albumsDir), JSON.stringify(album));
}

console.log(`[api] generated ${initialDataSample.length} albums in public/api/`);
