import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiProjectFolder,
  HmiProjectFolderType,
  HmiProjectItemDescriptor,
  HmiProjectItemKind,
} from "../dist/index.js";

test("project folder exposes static descriptors synchronously and asynchronously", async () => {
  const item = new HmiProjectItemDescriptor();
  item.id = "Gfx/Main.gfx";
  item.name = "Main";
  item.kind = HmiProjectItemKind.Screen;
  item.folderType = HmiProjectFolderType.Screens;
  const folder = new HmiProjectFolder(
    HmiProjectFolderType.Screens,
    "Screens",
    undefined,
    undefined,
    undefined,
    [item],
  );

  assert.deepEqual(folder.items, [item]);
  assert.deepEqual(await folder.getItems(), [item]);
});

test("project folder caches descriptors returned by an asynchronous source", async () => {
  const item = new HmiProjectItemDescriptor();
  item.id = "Gfx/Main.gfx";
  const folder = new HmiProjectFolder(
    HmiProjectFolderType.Screens,
    "Screens",
    undefined,
    undefined,
    undefined,
    async () => [item],
  );

  assert.deepEqual(folder.items, []);
  assert.deepEqual(await folder.getItems(), [item]);
  assert.deepEqual(folder.items, [item]);
});
