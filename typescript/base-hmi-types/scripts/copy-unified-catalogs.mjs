import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

// Released specification artifact; retain its exact upstream bytes.
const filename = "89ce7b2e33155ea0da70a8cfd76f09798b9a9f9d68c08155a7afb646a76bdd1a.xml.gz";
const source = new URL(`../../../catalogs/unified-v21/${filename}`, import.meta.url);
const destination = new URL("../dist/catalogs/unified-v21/", import.meta.url);
const expectedHash = "4102951f75ea86b9c907bdc1fa6a236db9e3142183e70c7ceed38d13f94acf26";
const actualHash = createHash("sha256").update(gunzipSync(await readFile(source))).digest("hex");
if (actualHash !== expectedHash) throw new Error(`Released Unified V21 catalog was modified: ${actualHash}`);
await mkdir(destination, { recursive: true });
await copyFile(source, new URL(filename, destination));
// Remove the prior uncompressed build artifact so it cannot inflate package contents.
await rm(new URL(filename.slice(0, -3), destination), { force: true });
