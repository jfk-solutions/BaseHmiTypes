import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm } from "node:fs/promises";
import { gunzipSync } from "node:zlib";

// Released specification artifacts; retain their exact upstream XML bytes.
const catalogs = [
  [
    "89ce7b2e33155ea0da70a8cfd76f09798b9a9f9d68c08155a7afb646a76bdd1a",
    "4102951f75ea86b9c907bdc1fa6a236db9e3142183e70c7ceed38d13f94acf26"
  ],
  [
    "0ee8e0b8c2f20bebadf57bf74fcac505b639158c0b5d5ca55a7962e371504aa3",
    "4e668ced0d471562bc297e3b817d252779510d27f10edd035c74fae967f91c55"
  ],
  [
    "55f590b8a6b10661b5d5bab2b6451aa77112078f77326349ef0068b520b8b61d",
    "9a83a388fe3751b84eddd196f69b8a41a7ddc19fa8b5d01c3c63895fd208c5ae"
  ]
];
const destination = new URL("../dist/catalogs/unified-v21/", import.meta.url);
await mkdir(destination, { recursive: true });
for (const [id, expectedHash] of catalogs) {
 const filename = id + ".xml.gz";
 const source = new URL("../../../catalogs/unified-v21/" + filename, import.meta.url);
 const actualHash = createHash("sha256").update(gunzipSync(await readFile(source))).digest("hex");
 if (actualHash !== expectedHash) throw new Error("Released Unified catalog was modified: " + id);
 await copyFile(source, new URL(filename, destination));
 await rm(new URL(id + ".xml", destination), { force: true });
}
