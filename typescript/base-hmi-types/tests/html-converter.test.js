import assert from "node:assert/strict";
import test from "node:test";

import {
  hmiColorFromArgb,
  HmiImage,
  HmiLayer,
  HmiListBox,
  HmiMultilingualText,
  HmiProjectBase,
  HmiScreen,
  HmiScreenToHtmlConverter,
  HmiState,
  HmiToggleSwitch,
  staticProperty,
} from "../dist/index.js";

class ImageProject extends HmiProjectBase {
  images = new Map();

  async getImage(id) {
    return this.images.get(id);
  }
}

test("HTML converter renders toggle states and project images", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);

  const toggle = new HmiToggleSwitch();
  toggle.id = "toggle-1";
  toggle.name = "ModeSwitch";
  toggle.x = staticProperty(10);
  toggle.y = staticProperty(20);
  toggle.width = staticProperty(120);
  toggle.height = staticProperty(52);
  toggle.state = staticProperty(1);

  const offState = new HmiState();
  offState.value = 0;
  offState.text = HmiMultilingualText.fromText("Stopped");
  offState.image = { imageId: "off-image" };
  toggle.states.push(offState);

  const onState = new HmiState();
  onState.value = 1;
  onState.text = HmiMultilingualText.fromText("Running");
  onState.image = { imageId: "on-image" };
  onState.backgroundColor = hmiColorFromArgb(255, 10, 20, 30);
  onState.captionColor = hmiColorFromArgb(255, 240, 241, 242);
  onState.borderColor = hmiColorFromArgb(255, 50, 60, 70);
  toggle.states.push(onState);

  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  layer.items.push(toggle);
  screen.layers.push(layer);

  const project = new ImageProject();
  const offImage = new HmiImage();
  offImage.id = "off-image";
  offImage.mimeType = "image/png";
  offImage.data = new Uint8Array([1]);
  project.images.set(offImage.id, offImage);
  const onImage = new HmiImage();
  onImage.id = "on-image";
  onImage.mimeType = "image/png";
  onImage.data = new Uint8Array([2]);
  project.images.set(onImage.id, onImage);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen, project);

  assert.match(html, /text="Stopped"/);
  assert.match(html, /alternate-text="Running"/);
  assert.match(html, /image="data:image\/png;base64,AQ=="/);
  assert.match(html, /alternate-image="data:image\/png;base64,Ag=="/);
  assert.match(html, /background-color: #0A141E;/);
  assert.match(html, /color: #F0F1F2;/);
  assert.match(html, /border-color: #323C46;/);
  assert.match(html, / checked/);
});

test("HTML converter renders list box states", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);

  const listBox = new HmiListBox();
  listBox.id = "list-1";
  listBox.name = "ModeList";
  listBox.x = staticProperty(10);
  listBox.y = staticProperty(20);
  listBox.width = staticProperty(120);
  listBox.height = staticProperty(52);
  listBox.value = staticProperty(4);
  const automatic = new HmiState();
  automatic.value = 2;
  automatic.text = HmiMultilingualText.fromText("Automatic");
  automatic.imageName = "auto.bmp";
  listBox.states.push(automatic);
  const manual = new HmiState();
  manual.value = 4;
  manual.text = HmiMultilingualText.fromText("Manual");
  manual.backgroundColor = hmiColorFromArgb(255, 10, 20, 30);
  manual.foregroundColor = hmiColorFromArgb(255, 240, 241, 242);
  listBox.states.push(manual);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  layer.items.push(listBox);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<select id="ModeList"/);
  assert.match(html, /value="2" data-image-name="auto.bmp"/);
  assert.match(html, />Automatic<\/option>/);
  assert.match(html, /value="4" style="background-color: #0A141E;color: #F0F1F2;" selected="selected"/);
  assert.match(html, />Manual<\/option>/);
});
