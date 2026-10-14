import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HmiUnifiedXmlCatalog, HmiScreenToUnifiedXmlConverter } from "../dist/index.js";

const bytes = new Uint8Array(await readFile(HmiUnifiedXmlCatalog.v21Url));
const expectedHash = "4102951f75ea86b9c907bdc1fa6a236db9e3142183e70c7ceed38d13f94acf26";

test("browser decompression API restores the exact released XML bytes", async () => {
  const xml = await HmiUnifiedXmlCatalog.readV21(bytes);
  assert.equal(createHash("sha256").update(xml, "utf8").digest("hex"), expectedHash);
  assert.ok(xml.includes(`id="${HmiScreenToUnifiedXmlConverter.catalogId}"`));
  assert.equal([...xml.matchAll(/<api-type /g)].length, 539);
  assert.equal([...xml.matchAll(/<type /g)].length, 18);
  assert.ok(bytes.length < 30000);
});

test("browser fetch loader accepts a hosted gzip asset", async () => {
  const url = "data:application/gzip;base64," + Buffer.from(bytes).toString("base64");
  assert.equal(await HmiUnifiedXmlCatalog.loadV21(url), await HmiUnifiedXmlCatalog.readV21(bytes));
});

test("invalid or truncated gzip data fails instead of returning partial XML", async () => {
  await assert.rejects(HmiUnifiedXmlCatalog.readV21(new Uint8Array([0, 1, 2, 3])));
  await assert.rejects(HmiUnifiedXmlCatalog.readV21(bytes.subarray(0, 20)));
});
