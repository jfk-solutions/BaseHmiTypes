import assert from "node:assert/strict";
import test from "node:test";

import {
  expressionProperty,
  hmiColorFromArgb,
  HmiArrowIndicator,
  HmiBar,
  HmiClock,
  HmiImage,
  HmiLayer,
  HmiListBox,
  HmiMultilingualText,
  HmiProjectBase,
  HmiScale,
  HmiScreen,
  HmiScreenToHtmlConverter,
  HmiState,
  HmiSlider,
  HmiToggleSwitch,
  HmiWebControl,
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

test("HTML converter renders bar slider and scale previews", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";

  const bar = new HmiBar();
  bar.name = "LevelBar";
  bar.width = staticProperty(100);
  bar.height = staticProperty(20);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.value = staticProperty(35);
  layer.items.push(bar);

  const slider = new HmiSlider();
  slider.name = "SetpointSlider";
  slider.y = staticProperty(30);
  slider.width = staticProperty(100);
  slider.height = staticProperty(20);
  slider.beginValue = staticProperty(-10);
  slider.endValue = staticProperty(10);
  slider.value = staticProperty(4);
  layer.items.push(slider);

  const scale = new HmiScale();
  scale.name = "LevelScale";
  scale.y = staticProperty(60);
  scale.width = staticProperty(100);
  scale.height = staticProperty(20);
  scale.beginValue = staticProperty(100);
  scale.endValue = staticProperty(0);
  layer.items.push(scale);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<meter id="LevelBar"/);
  assert.match(html, /min="0" max="100" value="35">35<\/meter>/);
  assert.match(html, /<input id="SetpointSlider"/);
  assert.match(html, /type="range" min="-10" max="10" value="4" disabled="disabled"/);
  assert.match(html, /<div id="LevelScale"/);
  assert.match(html, /><span>0<\/span><span>100<\/span><\/div>/);
});

test("HTML converter renders a clock preview", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const clock = new HmiClock();
  clock.name = "BatchClock";
  clock.width = staticProperty(160);
  clock.height = staticProperty(24);
  clock.showDate = staticProperty(true);
  clock.showTime = staticProperty(true);
  clock.showSeconds = staticProperty(false);
  clock.format = staticProperty("dateAndTime");
  clock.timeZone = staticProperty("UTC");
  layer.items.push(clock);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<time id="BatchClock"/);
  assert.match(html, /datetime="2000-01-01T12:34:56"/);
  assert.match(html, /data-format="dateAndTime" data-time-zone="UTC"/);
  assert.match(html, />2000-01-01 12:34<\/time>/);
});

test("HTML converter renders an arrow indicator preview", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const arrow = new HmiArrowIndicator();
  arrow.name = "LevelArrow";
  arrow.width = staticProperty(30);
  arrow.height = staticProperty(120);
  arrow.beginValue = staticProperty(0);
  arrow.endValue = staticProperty(100);
  arrow.value = staticProperty(25);
  arrow.orientation = staticProperty(1);
  layer.items.push(arrow);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="LevelArrow"/);
  assert.match(html, /data-min="0" data-max="100" data-value="25" data-orientation="vertical"/);
  assert.match(html, /bottom: 25%; transform: translate\(-50%, 50%\);">▲<\/span>/);
});

test("HTML converter renders an inert web control preview", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const browser = new HmiWebControl();
  browser.name = "ManualBrowser";
  browser.width = staticProperty(300);
  browser.height = staticProperty(180);
  browser.url = expressionProperty("{[PLC]ManualUrl}", "https://example.test/manual?a=1&b=2");
  browser.showAddressBar = staticProperty(true);
  browser.useParameterPlaceholders = staticProperty(true);
  browser.navigateBack = expressionProperty("{[PLC]Back}");
  browser.refresh = expressionProperty("{[PLC]Refresh}");
  layer.items.push(browser);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="ManualBrowser"/);
  assert.match(html, /data-url="https:\/\/example.test\/manual\?a=1&amp;b=2"/);
  assert.match(html, /data-use-parameter-placeholders/);
  assert.match(html, /data-navigate-back="{\[PLC\]Back}"/);
  assert.match(html, /data-refresh="{\[PLC\]Refresh}"/);
  assert.match(html, />https:\/\/example.test\/manual\?a=1&amp;b=2<\/div>/);
  assert.match(html, />Web browser<\/div>/);
  assert.doesNotMatch(html, /<iframe/);
});
