import assert from "node:assert/strict";
import test from "node:test";
import { deflateRawSync } from "node:zlib";

import { ZipArchive } from "../dist/index.js";

test("ZipArchive inflates large entries without splitting the raw deflate stream", async () => {
  const original = Buffer.allocUnsafe(3 * 1024 * 1024);
  let random = 123456789;
  for (let index = 0; index < original.length; index++) {
    random ^= random << 13;
    random ^= random >>> 17;
    random ^= random << 5;
    original[index] = random & 0xff;
  }

  const archive = ZipArchive.open(createZip("database.mdf", original));
  const extracted = await archive.readFile("database.mdf");

  assert.ok(extracted);
  assert.equal(extracted.length, original.length);
  assert.equal(Buffer.compare(extracted, original), 0);
});

function createZip(name, contents) {
  const nameBytes = Buffer.from(name);
  const compressed = deflateRawSync(contents);
  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0);
  localHeader.writeUInt16LE(20, 4);
  localHeader.writeUInt16LE(8, 8);
  localHeader.writeUInt32LE(compressed.length, 18);
  localHeader.writeUInt32LE(contents.length, 22);
  localHeader.writeUInt16LE(nameBytes.length, 26);

  const centralDirectory = Buffer.alloc(46);
  centralDirectory.writeUInt32LE(0x02014b50, 0);
  centralDirectory.writeUInt16LE(20, 4);
  centralDirectory.writeUInt16LE(20, 6);
  centralDirectory.writeUInt16LE(8, 10);
  centralDirectory.writeUInt32LE(compressed.length, 20);
  centralDirectory.writeUInt32LE(contents.length, 24);
  centralDirectory.writeUInt16LE(nameBytes.length, 28);

  const centralDirectoryOffset = localHeader.length + nameBytes.length + compressed.length;
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(1, 8);
  end.writeUInt16LE(1, 10);
  end.writeUInt32LE(centralDirectory.length + nameBytes.length, 12);
  end.writeUInt32LE(centralDirectoryOffset, 16);

  return Buffer.concat([localHeader, nameBytes, compressed, centralDirectory, nameBytes, end]);
}
