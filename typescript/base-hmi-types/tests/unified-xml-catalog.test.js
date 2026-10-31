import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { HmiUnifiedXmlCatalog, HmiScreenToUnifiedXmlConverter } from "../dist/index.js";

const bytes = new Uint8Array(await readFile(HmiUnifiedXmlCatalog.url));
const expectedHash = "5e5239691089763db79965a5de1c24cd8cc5d1c34de13a20dba3d9cad4e6ba27";

test("browser decompression API restores the exact released XML bytes", async () => {
  const xml = await HmiUnifiedXmlCatalog.read(bytes);
  assert.equal(createHash("sha256").update(xml, "utf8").digest("hex"), expectedHash);
  assert.ok(xml.includes(`id="${HmiScreenToUnifiedXmlConverter.catalogId}"`));
  assert.equal(await HmiUnifiedXmlCatalog.load(), xml);
  assert.ok(xml.includes('defaults="stable-format-values"'));
  assert.ok(bytes.length < 30000);
});

test("browser fetch loader accepts a hosted gzip asset", async () => {
  const url = "data:application/gzip;base64," + Buffer.from(bytes).toString("base64");
  assert.equal(await HmiUnifiedXmlCatalog.loadFromUrl(url), await HmiUnifiedXmlCatalog.read(bytes));
});

test("invalid or truncated gzip data fails instead of returning partial XML", async () => {
  await assert.rejects(HmiUnifiedXmlCatalog.read(new Uint8Array([0, 1, 2, 3])));
  await assert.rejects(HmiUnifiedXmlCatalog.read(bytes.subarray(0, 20)));
});
