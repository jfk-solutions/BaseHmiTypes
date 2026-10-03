import assert from "node:assert/strict";
import test from "node:test";

import {
  blinkProperty,
  HmiBlinkRate,
  expressionProperty,
  hmiColorFromArgb,
  HmiArrowIndicator,
  HmiAlarmIndicator,
  HmiAlarmIndicatorMessageClassAppearance,
  HmiAlarmIndicatorState,
  HmiAlarmIndicatorSegment,
  HmiAlarmColumn,
  HmiAlarmColumnType,
  HmiAlarmControl,
  HmiAlarmLineControl,
  HmiAlarmLineViewKind,
  HmiAlarmListMode,
  HmiAlarmViewKind,
  HmiAuditTrailControl,
  HmiAuditTrailField,
  HmiAuditTrailFieldPresentation,
  HmiAuditTrailViewKind,
  HmiBar,
  HmiButton,
  HmiCircularArc,
  HmiCircle,
  HmiEllipse,
  HmiLine,
  HmiPolygon,
  HmiPolyline,
  HmiLineMarker,
  HmiEllipticalArc,
  HmiCircleSegment,
  HmiEllipseSegment,
  HmiIOField,
  HmiClock,
  HmiComboBox,
  HmiCustomWidgetContainer,
  HmiDataGridControl,
  HmiDataGridDataSourceKind,
  HmiDataGridSortDirection,
  HmiDotNetControlContainer,
  HmiFillDirection,
  HmiGradientDirection,
  HmiFillPattern,
  HmiFont,
  HmiGauge,
  HmiHorizontalAlignment,
  HmiImage,
  HmiLayer,
  HmiListBox,
  HmiMultilingualText,
  HmiOcxControl,
  HmiProjectBase,
  HmiRecipeColumn,
  HmiRecipeColumnType,
  HmiRecipeControl,
  HmiRecipeViewKind,
  HmiRectangle,
  HmiRadarChartControl,
  HmiRadarLegendPosition,
  HmiRadarShape,
  HmiLineStyle,
  HmiSystemDiagnosisControl,
  HmiSystemDiagnosisViewKind,
  HmiText,
  HmiScale,
  HmiTickDirection,
  HmiScreen,
  HmiScreenWindow,
  HmiScreenToHtmlConverter,
  HmiState,
  HmiSlider,
  HmiToggleSwitch,
  HmiTrendControl,
  HmiTrendAxisScaleType,
  HmiTrendLineType,
  HmiTrendPen,
  HmiTrendValueAxis,
  HmiTrendWindow,
  HmiTrendTimeAxis,
  HmiTrendTimeFormat,
  HmiThreshold,
  HmiThresholdValueMode,
  HmiWebControl,
  HmiVerticalAlignment,
  staticProperty,
  tagProperty,
} from "../dist/index.js";

for (const rounded of [false, true]) for (const inside of [false, true, undefined])
for (const width of [1, 10]) for (const line of [false, true]) {
test("HTML renderer supports rectangle border placement (" + [rounded,inside,width,line].join(", ") + ")", async () => {
  const item = new HmiRectangle();
  item.name = "FramedRectangle"; item.width = staticProperty(100); item.height = staticProperty(80);
  if (inside !== undefined) item.drawStrokeInsideFrame = tagProperty("Border.Inside", inside);
  if (rounded) item.topLeftRadius = item.topRightRadius = item.bottomLeftRadius = item.bottomRightRadius = staticProperty({x:20,y:10});
  if (line) {
    item.lineWidth = tagProperty("Line.Width", width);
    item.lineColor = staticProperty(hmiColorFromArgb(255,12,34,56));
    item.borderWidth = staticProperty(2);
    item.borderColor = staticProperty(hmiColorFromArgb(255,255,0,0));
  } else {
    item.borderWidth = tagProperty("Border.Width", width);
    item.borderColor = staticProperty(hmiColorFromArgb(255,12,34,56));
  }
  const layer = new HmiLayer(); layer.items.push(item);
  const screen = new HmiScreen(); screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(/<div id="FramedRectangle"[^>]*>/u)?.[0] ?? "";
  assert.ok(opening);
  const centered = inside === false && width > 1;
  assert.equal(opening.includes("outline-width:"), centered);
  assert.ok(opening.includes("width: 100px;"));
  assert.ok(opening.includes("height: 80px;"));
  assert.ok(opening.includes("border-width: " + (centered ? 0 : width) + "px;"));
  if (centered) {
    assert.ok(opening.includes("outline-width: 10px;"));
    assert.ok(opening.includes("outline-offset: -5px;"));
    assert.ok(opening.includes("outline-color: #0C2238;"));
  }
  if (rounded) assert.ok(opening.includes("border-radius: 20px 20px 20px 20px / 10px 10px 10px 10px;"));
});
}

for (const line of [false, true]) for (const inside of [false, true]) {
test("HTML renderer supports flashing rectangle border placement (" + line + ", " + inside + ")", async () => {
  const item = new HmiRectangle();
  item.name = "FlashingRectangle"; item.drawStrokeInsideFrame = tagProperty("Border.Inside", inside);
  const color = blinkProperty(hmiColorFromArgb(255,1,2,3),hmiColorFromArgb(255,4,5,6),HmiBlinkRate.Fast);
  if (line) { item.lineWidth = staticProperty(10); item.lineColor = color; }
  else { item.borderWidth = staticProperty(10); item.borderColor = color; }
  const layer = new HmiLayer(); layer.items.push(item);
  const screen = new HmiScreen(); screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(/<div id="FlashingRectangle"[^>]*>/u)?.[0] ?? "";
  assert.ok(opening.includes("--hmi-border-color-off: #010203;"));
  assert.ok(opening.includes("--hmi-border-color-on: #040506;"));
  assert.ok(opening.includes("animation: hmi-" + (inside ? "border" : "outline") + "-color-flash 0.5s steps(1, end) infinite;"));
});
}

for (const [kind, Shape] of [HmiCircle, HmiEllipse, HmiCircularArc, HmiEllipticalArc, HmiCircleSegment, HmiEllipseSegment].entries())
for (const inside of [false, true]) for (const width of [1, 10]) {
test(`HTML renderer supports curved inside strokes (${kind}, ${inside}, ${width})`, async () => {
  const shape = new Shape();
  shape.name = "Curved";
  shape.width = staticProperty(100); shape.height = staticProperty(100);
  shape.centerX = staticProperty(50); shape.centerY = staticProperty(50);
  if (kind % 2 === 0) shape.radius = staticProperty(50);
  else { shape.radiusX = staticProperty(50); shape.radiusY = staticProperty(40); }
  if (kind >= 2) shape.sweepAngle = staticProperty(90);
  shape.lineWidth = tagProperty("Stroke.Width", width);
  shape.drawStrokeInsideFrame = tagProperty("Stroke.Inside", inside);
  const layer = new HmiLayer(); layer.items.push(shape);
  const screen = new HmiScreen(); screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const svg = html.match(/<svg id="Curved"[^>]*>(.*?)<\/svg>/su)?.[1] ?? "";
  const clipped = inside && width > 1;
  assert.ok(svg.includes(`stroke-width="${clipped ? width * 2 : width}"`));
  assert.equal(svg.includes("clip-path="), clipped);
  assert.equal(svg.includes("<clipPath"), clipped);
  if (clipped) {
    assert.ok(svg.includes('clipPathUnits="userSpaceOnUse"'));
    const clip = svg.match(/<clipPath[^>]*>(.*?)<\/clipPath>/su)?.[1] ?? "";
    assert.ok(!clip.includes("stroke-width"));
    assert.ok(clip.includes(kind < 2 ? (kind === 0 ? "<circle" : "<ellipse") : kind < 4 ? "<ellipse" : "<path"));
  }
});
}

for (const Shape of [HmiCircle, HmiEllipse, HmiCircularArc, HmiEllipticalArc,
  HmiCircleSegment, HmiEllipseSegment, HmiLine, HmiPolygon, HmiPolyline]) {
test(`HTML renderer does not clip shape strokes or markers (${Shape.name})`, async () => {
  const shape = new Shape();
  shape.name = "Bordered";
  shape.width = staticProperty(100);
  shape.height = staticProperty(100);
  if (shape instanceof HmiCircle || shape instanceof HmiCircularArc) {
    shape.centerX = staticProperty(50); shape.centerY = staticProperty(50); shape.radius = staticProperty(50);
  } else if (shape instanceof HmiEllipse || shape instanceof HmiEllipticalArc) {
    shape.centerX = staticProperty(50); shape.centerY = staticProperty(50);
    shape.radiusX = staticProperty(50); shape.radiusY = staticProperty(50);
  }
  if ("sweepAngle" in shape) shape.sweepAngle = staticProperty(shape instanceof HmiCircleSegment || shape instanceof HmiEllipseSegment ? 90 : 360);
  shape.lineWidth = tagProperty("Stroke.Width", 10);
  shape.startMarker = staticProperty(HmiLineMarker.FilledArrow);
  shape.endMarker = staticProperty(HmiLineMarker.FilledCircle);
  const layer = new HmiLayer(); layer.items.push(shape);
  const screen = new HmiScreen(); screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(/<svg id="Bordered"[^>]*>/u)?.[0] ?? "";
  assert.ok(opening.includes('overflow="visible"'));
  assert.ok(opening.includes('viewBox="0 0 100 100"'));
  const svg = html.match(/<svg id="Bordered"[^>]*>(.*?)<\/svg>/su)?.[1] ?? "";
  assert.ok(svg.includes('stroke-width="10"'));
  assert.ok(svg.includes("marker-start="));
  assert.ok(svg.includes("marker-end="));
});
}

for (const kind of [0, 1, 2, 3]) for (const sweep of [360, -360]) for (const start of [0, 90]) {
test(`HTML renderer supports full-turn arcs (${kind}, ${sweep}, ${start})`, async () => {
  const Shape = [HmiCircularArc, HmiEllipticalArc, HmiCircleSegment, HmiEllipseSegment][kind];
  const shape = new Shape();
  shape.name = "FullTurn";
  shape.width = staticProperty(100);
  shape.height = staticProperty(80);
  shape.centerX = staticProperty(50);
  shape.centerY = staticProperty(40);
  if (kind % 2 === 0) shape.radius = staticProperty(40);
  else { shape.radiusX = staticProperty(50); shape.radiusY = staticProperty(40); }
  shape.startAngle = staticProperty(start);
  shape.sweepAngle = staticProperty(sweep);
  const layer = new HmiLayer();
  layer.items.push(shape);
  const screen = new HmiScreen();
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const svg = html.match(/<svg id="FullTurn"[^>]*>(.*?)<\/svg>/su)?.[1];
  const path = svg?.match(/<path[^>]*d="([^"]*)"/u)?.[1];
  const radiusX = kind % 2 === 0 ? 40 : 50;
  const first = start === 0 ? `${50 + radiusX} 40` : "50 80";
  const opposite = start === 0 ? `${50 - radiusX} 40` : "50 0";
  const direction = sweep > 0 ? 1 : 0;
  assert.equal(path, `M ${first} A ${radiusX} 40 0 0 ${direction} ${opposite} A ${radiusX} 40 0 0 ${direction} ${first} Z`);
});
}

for (const [underline, strikethrough] of [[false,false],[false,true],[true,false],[true,true]]) {
test("HTML renderer preserves combined gauge font decorations (" + underline + ", " + strikethrough + ")", async () => {
  const font = new HmiFont();
  font.underline = tagProperty("Gauge.Font.Underline", underline);
  font.strikethrough = tagProperty("Gauge.Font.Strikethrough", strikethrough);
  const gauge = new HmiGauge();
  gauge.labelFont = font;
  const layer = new HmiLayer();
  layer.items.push(gauge);
  const screen = new HmiScreen();
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(/<hmi-gauge[^>]*>/u)?.[0];
  const attribute = opening?.match(/label-font="([^"]*)"/u)?.[1];
  assert.ok(attribute);
  const value = JSON.parse(attribute.replaceAll("&quot;", '"'));
  assert.equal(value.underline, underline);
  assert.equal(value.strikethrough, strikethrough);
});
}

for (const [weight, bold] of [[500,false],[500,true],[0,false],[0,true],[-1,false],[-1,true]]) {
test(`HTML renderer preserves gauge numeric font weight (${weight}, ${bold})`, async () => {
  const font = new HmiFont();
  font.weight = tagProperty("Gauge.Font.Weight", weight);
  font.bold = tagProperty("Gauge.Font.Bold", bold);
  const gauge = new HmiGauge();
  gauge.labelFont = font;
  const layer = new HmiLayer();
  layer.items.push(gauge);
  const screen = new HmiScreen();
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(/<hmi-gauge[^>]*>/u)?.[0];
  const attribute = opening?.match(/label-font="([^"]*)"/u)?.[1];
  assert.ok(attribute);
  const value = JSON.parse(attribute.replaceAll("&quot;", '"'));
  assert.equal(value.weight, weight);
  assert.equal(value.bold, bold);
});
}

for (const [kind, weight, bold] of [[0,500,false],[0,500,true],[0,0,false],[0,0,true],[0,-1,false],[0,-1,true],[1,500,false],[1,500,true],[1,0,false],[1,0,true],[1,-1,false],[1,-1,true],[2,500,false],[2,500,true],[2,0,false],[2,0,true],[2,-1,false],[2,-1,true]]) {
test(`HTML renderer supports widget numeric font weight (${kind}, ${weight}, ${bold})`, async () => {
  const font = new HmiFont();
  font.weight = tagProperty("Font.Weight", weight);
  font.bold = staticProperty(bold);
  const item = kind === 0 ? new HmiButton() : kind === 1 ? new HmiIOField() : new HmiBar();
  if (kind === 2) {
    item.labelFont = font;
    item.showScale = staticProperty(true);
  } else item.font = font;
  item.name = "Weighted";
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  layer.items.push(item);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(kind === 2 ? /<div[^>]*data-hmi-bar-scale[^>]*>/ : kind === 0 ? /<button[^>]*>/ : /<input[^>]*>/)?.[0] ?? "";
  assert.notEqual(opening, "");
  if (weight > 0) {
    assert.ok(opening.includes(`font-weight: ${weight};`));
    assert.ok(!opening.includes("font-weight: bold;"));
  } else if (bold) assert.ok(opening.includes("font-weight: bold;"));
  else assert.ok(!opening.includes("font-weight:"));
});
}

for (const [kind, underline, strike] of [[0,false,false],[0,false,true],[0,true,false],[0,true,true],[1,false,false],[1,false,true],[1,true,false],[1,true,true],[2,false,false],[2,false,true],[2,true,false],[2,true,true]]) {
test(`HTML renderer supports widget font decorations (${kind}, ${underline}, ${strike})`, async () => {
  const font = new HmiFont();
  font.underline = tagProperty("Font.Underline", underline);
  font.strikethrough = tagProperty("Font.Strike", strike);
  const item = kind === 0 ? new HmiButton() : kind === 1 ? new HmiIOField() : new HmiBar();
  if (kind === 2) {
    item.labelFont = font;
    item.showScale = staticProperty(true);
  } else item.font = font;
  item.name = "Decorated";
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  layer.items.push(item);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(kind === 2 ? /<div[^>]*data-hmi-bar-scale[^>]*>/ : kind === 0 ? /<button[^>]*>/ : /<input[^>]*>/)?.[0] ?? "";
  assert.notEqual(opening, "");
  const decorations = underline ? (strike ? "underline line-through" : "underline") : "line-through";
  if (underline || strike) assert.ok(opening.includes(`text-decoration: ${decorations};`));
  else assert.ok(!opening.includes("text-decoration:"));
});
}

class ImageProject extends HmiProjectBase {
  images = new Map();

  async getImage(id) {
    return this.images.get(id);
  }
}

class ScreenProject extends HmiProjectBase {
  screensById = new Map();

  async getScreen(id) {
    return this.screensById.get(id);
  }
}

test("HTML converter renders screen-window viewport modes", async () => {
  const main = new HmiScreen();
  main.name = "Main";
  const layer = new HmiLayer();
  layer.name = "Default";

  const fitPicture = new HmiScreenWindow();
  fitPicture.name = "FitPicture";
  fitPicture.screenId = staticProperty("detail");
  fitPicture.width = staticProperty(200);
  fitPicture.height = staticProperty(100);
  fitPicture.fitScreenToWindow = staticProperty(true);
  fitPicture.showScrollBars = staticProperty(true);
  layer.items.push(fitPicture);

  const fitWindow = new HmiScreenWindow();
  fitWindow.name = "FitWindow";
  fitWindow.screenId = staticProperty("detail");
  fitWindow.width = staticProperty(50);
  fitWindow.height = staticProperty(50);
  fitWindow.fitWindowToScreen = staticProperty(true);
  fitWindow.zoomPercent = staticProperty(150);
  layer.items.push(fitWindow);

  const scrollWindow = new HmiScreenWindow();
  scrollWindow.name = "ScrollWindow";
  scrollWindow.screenId = staticProperty("detail");
  scrollWindow.width = staticProperty(50);
  scrollWindow.height = staticProperty(50);
  scrollWindow.showScrollBars = staticProperty(true);
  scrollWindow.zoomPercent = staticProperty(125);
  scrollWindow.offsetLeft = staticProperty(40);
  scrollWindow.offsetTop = staticProperty(20);
  scrollWindow.scrollPositionLeft = staticProperty(15);
  scrollWindow.scrollPositionTop = staticProperty(10);
  layer.items.push(scrollWindow);
  main.layers.push(layer);

  const detail = new HmiScreen();
  detail.id = "detail";
  detail.name = "Detail";
  detail.width = staticProperty(400);
  detail.height = staticProperty(200);
  const project = new ScreenProject();
  project.screensById.set("detail", detail);

  const html = await new HmiScreenToHtmlConverter().convertAsync(main, project);

  assert.match(html, /data-fit-screen-to-window data-show-scrollbars id="FitPicture"/);
  assert.match(html, /width: 200px; height: 100px; overflow: hidden;/);
  assert.match(html, /transform: scale\(0\.5, 0\.5\);/);
  assert.match(html, /data-fit-window-to-screen data-zoom-percent="150" id="FitWindow"/);
  assert.match(html, /width: 600px;height: 300px;overflow: hidden;/);
  assert.match(html, /transform: scale\(1\.5, 1\.5\);/);
  assert.match(html, /data-show-scrollbars data-zoom-percent="125" data-picture-offset-x="40" data-picture-offset-y="20" data-scroll-position-x="15" data-scroll-position-y="10" id="ScrollWindow"/);
  assert.match(html, /overflow: auto;/);
  assert.match(html, /width: 450px; height: 225px; overflow: hidden;/);
  assert.match(html, /left: -50px; top: -25px;/);
  assert.match(html, /transform: scale\(1\.25, 1\.25\);/);
  assert.match(html, /<script>\(e=>\{e\.scrollLeft=15;e\.scrollTop=10;}\)\(document\.currentScript\.previousElementSibling\)<\/script>/);
});

test("HTML converter renders item opacity", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "TransparentRectangle";
  rectangle.width = staticProperty(100);
  rectangle.height = staticProperty(50);
  rectangle.opacity = staticProperty(0.25);

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="TransparentRectangle"[^>]*style="position: absolute;left: 0px;top: 0px;width: 100px;height: 50px;opacity: 0.25;/);
});

test("HTML converter adapts text borders to content", async () => {
  const text = new HmiText();
  text.name = "AdaptiveText";
  text.width = staticProperty(200);
  text.height = staticProperty(80);
  text.text = staticProperty(HmiMultilingualText.fromText("Variable caption"));
  text.adaptBorderToContent = staticProperty(true);

  const layer = new HmiLayer();
  layer.name = "Default";
  layer.items.push(text);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-adapt-border-to-content/);
  assert.match(html, /width: 200px;height: 80px;width: max-content;height: max-content;white-space: nowrap;/);
  assert.match(html, /Variable caption/);
});

test("HTML converter renders design shadows", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "ShadowedRectangle";
  rectangle.width = staticProperty(100);
  rectangle.height = staticProperty(50);
  rectangle.useDesignShadowSettings = staticProperty(true);

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="ShadowedRectangle"[^>]*style="position: absolute;left: 0px;top: 0px;width: 100px;height: 50px;filter: drop-shadow\(3px 3px 3px rgba\(0, 0, 0, 0.35\)\);/);
});

test("HTML converter renders item tooltips", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "Pump";
  rectangle.width = staticProperty(100);
  rectangle.height = staticProperty(50);
  rectangle.toolTipText = staticProperty(HmiMultilingualText.fromText("Pump & valve"));

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="Pump" title="Pump &amp; valve"/);
});

test("HTML converter renders item tab order", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "FocusableRectangle";
  rectangle.width = staticProperty(100);
  rectangle.height = staticProperty(50);
  rectangle.tabIndex = staticProperty(7);

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="FocusableRectangle" tabindex="7"/);
});

test("HTML converter renders disabled item semantics", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "DisabledRectangle";
  rectangle.width = staticProperty(100);
  rectangle.height = staticProperty(50);
  rectangle.enabled = staticProperty(false);

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="DisabledRectangle" aria-disabled="true"[^>]*style="position: absolute;left: 0px;top: 0px;width: 100px;height: 50px;pointer-events: none;/);
});

test("HTML converter renders disabled foreground colors", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "DisabledText";
  rectangle.enabled = staticProperty(false);
  rectangle.foregroundColor = staticProperty(hmiColorFromArgb(255, 1, 2, 3));
  rectangle.disabledForegroundColor = staticProperty(hmiColorFromArgb(255, 11, 22, 33));
  rectangle.disabledForegroundShadowColor = staticProperty(hmiColorFromArgb(255, 44, 55, 66));
  rectangle.useDisabledForegroundColor = staticProperty(true);

  const layer = new HmiLayer();
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-disabled-foreground-color="#0B1621"/);
  assert.match(html, /data-disabled-foreground-shadow-color="#2C3742"/);
  assert.match(html, /data-use-disabled-foreground-color="true"/);
  assert.match(html, /color: #0B1621;/);
  assert.match(html, /text-shadow: 1px 1px #2C3742;/);
});

test("HTML converter renders rectangle rotation", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "RotatedRectangle";
  rectangle.width = staticProperty(100);
  rectangle.height = staticProperty(50);
  rectangle.rotationAngle = staticProperty(45);
  rectangle.rotationCenterX = staticProperty(10);
  rectangle.rotationCenterY = staticProperty(20);

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /transform: rotate\(45deg\);transform-origin: 10px 20px;/);
});

test("HTML converter exposes item hotkeys", async () => {
  const button = new HmiToggleSwitch();
  button.name = "ShortcutButton";
  button.width = staticProperty(100);
  button.height = staticProperty(50);
  button.hotKey = staticProperty("Ctrl+F11");

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(button);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="ShortcutButton" data-hmi-hot-key="Ctrl\+F11" aria-keyshortcuts="Control\+F11"/);
});

test("HTML converter exposes item security codes", async () => {
  const rectangle = new HmiRectangle();
  rectangle.name = "SecuredRectangle";
  rectangle.width = staticProperty(100);
  rectangle.height = staticProperty(50);
  rectangle.securityCode = "7";

  const layer = new HmiLayer();
  layer.name = "Layer0";
  layer.items.push(rectangle);
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="SecuredRectangle" data-hmi-security-code="7"/);
});

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

test("HTML converter renders combo box states", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);

  const comboBox = new HmiComboBox();
  comboBox.name = "ModeCombo";
  comboBox.width = staticProperty(120);
  comboBox.height = staticProperty(28);
  comboBox.selectedIndex = staticProperty(1);
  const automatic = new HmiState();
  automatic.value = 10;
  automatic.text = HmiMultilingualText.fromText("Automatic");
  comboBox.states.push(automatic);
  const manual = new HmiState();
  manual.value = 20;
  manual.text = HmiMultilingualText.fromText("Manual");
  comboBox.states.push(manual);
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(comboBox);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<select id="ModeCombo"/);
  assert.match(html, /<option value="10">Automatic<\/option>/);
  assert.match(html, /<option value="20" selected="selected">Manual<\/option>/);
  assert.doesNotMatch(html, /HmiComboBox/);
});

test("HTML converter renders alarm indicator state", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const indicator = new HmiAlarmIndicator();
  indicator.name = "GroupDisplay";
  indicator.width = staticProperty(80);
  indicator.height = staticProperty(30);
  indicator.alarmState = staticProperty(5);
  indicator.visualState = staticProperty(HmiAlarmIndicatorState.CameIn);
  indicator.isGroupRelevant = staticProperty(true);
  indicator.significantMask = staticProperty(3);
  indicator.eventAcknowledgementMask = staticProperty(5);
  indicator.useGlobalAlarmClasses = staticProperty(true);
  indicator.useGlobalSettings = staticProperty(false);
  indicator.userValue1 = staticProperty(11);
  indicator.userValue2 = staticProperty(12);
  indicator.userValue3 = staticProperty(13);
  indicator.userValue4 = staticProperty(14);
  indicator.selectedMessageClass = staticProperty(3);
  const firstAppearance = new HmiAlarmIndicatorMessageClassAppearance();
  firstAppearance.index = 1;
  firstAppearance.isTextFlashingRequired = staticProperty(true);
  firstAppearance.isBackgroundFlashingRequired = staticProperty(false);
  indicator.messageClassAppearances.push(firstAppearance);
  const secondAppearance = new HmiAlarmIndicatorMessageClassAppearance();
  secondAppearance.index = 2;
  secondAppearance.isTextFlashingRequired = staticProperty(false);
  secondAppearance.isBackgroundFlashingRequired = staticProperty(true);
  indicator.messageClassAppearances.push(secondAppearance);
  indicator.noAlarmState = staticProperty(0);
  indicator.numberOfAlarms = staticProperty(2);
  indicator.isFlashingRequired = staticProperty(true);
  indicator.flashingColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
  indicator.foregroundColor = staticProperty(hmiColorFromArgb(255, 32, 48, 64));
  indicator.isForegroundFlashingRequired = staticProperty(true);
  indicator.flashingForegroundColor = staticProperty(hmiColorFromArgb(255, 255, 255, 0));
  indicator.flashingRate = staticProperty(500);
  indicator.showAcknowledgedAlarmClasses = staticProperty([1, 3]);
  indicator.showPendingAlarmClasses = staticProperty([2, 4]);
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(indicator);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="GroupDisplay"/);
  assert.match(html, /class="hmi-alarm-indicator"/);
  assert.match(html, /data-active="true"/);
  assert.match(html, /data-visual-state="CameIn"/);
  assert.match(html, /data-group-relevant="true"/);
  assert.match(html, /data-significant-mask="3"/);
  assert.match(html, /data-event-acknowledgement-mask="5"/);
  assert.match(html, /data-use-global-alarm-classes="true"/);
  assert.match(html, /data-use-global-settings="false"/);
  assert.match(html, /data-user-value-1="11"/);
  assert.match(html, /data-user-value-2="12"/);
  assert.match(html, /data-user-value-3="13"/);
  assert.match(html, /data-user-value-4="14"/);
  assert.match(html, /data-selected-message-class="3"/);
  assert.match(html, /data-text-flashing-message-classes="1"/);
  assert.match(html, /data-background-flashing-message-classes="2"/);
  assert.match(html, /data-flashing-required="true"/);
  assert.match(html, /data-flashing-color="#FF0000"/);
  assert.match(html, /data-foreground-flashing-required="true"/);
  assert.match(html, /data-flashing-foreground-color="#FFFF00"/);
  assert.match(html, /data-flashing-rate="500"/);
  assert.match(html, /--hmi-background-color-off: transparent;/);
  assert.match(html, /--hmi-background-color-on: #FF0000;/);
  assert.match(html, /--hmi-foreground-color-off: #203040;/);
  assert.match(html, /--hmi-foreground-color-on: #FFFF00;/);
  assert.match(html, /animation: hmi-background-color-flash 0.5s steps\(1, end\) infinite, hmi-foreground-color-flash 0.5s steps\(1, end\) infinite;/);
  assert.match(html, /data-alarm-state="5"/);
  assert.match(html, /data-no-alarm-state="0"/);
  assert.match(html, /data-number-of-alarms="2"/);
  assert.match(html, /data-show-acknowledged-alarm-classes="1,3"/);
  assert.match(html, /data-show-pending-alarm-classes="2,4"/);
  assert.match(html, />2<\/div>/);
  assert.doesNotMatch(html, /HmiAlarmIndicator/);
});

test("HTML converter renders alarm indicator text", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const indicator = new HmiAlarmIndicator();
  indicator.name = "GroupDisplay";
  indicator.width = staticProperty(80);
  indicator.height = staticProperty(30);
  indicator.alarmState = staticProperty(5);
  indicator.text = staticProperty("<Alarm>");
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(indicator);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-text="&lt;Alarm&gt;"/);
  assert.match(html, />&lt;Alarm&gt;<\/div>/);
});

test("HTML converter renders alarm indicator font", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const indicator = new HmiAlarmIndicator();
  indicator.name = "GroupDisplay";
  indicator.width = staticProperty(80);
  indicator.height = staticProperty(30);
  indicator.text = staticProperty("Alarm");
  indicator.font = new HmiFont();
  indicator.font.name = staticProperty("Arial");
  indicator.font.size = staticProperty(12);
  indicator.font.bold = staticProperty(true);
  indicator.horizontalAlignment = staticProperty(HmiHorizontalAlignment.Right);
  indicator.verticalAlignment = staticProperty(HmiVerticalAlignment.Bottom);
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(indicator);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /font-family: Arial;/);
  assert.match(html, /font-size: 12px;/);
  assert.match(html, /font-weight: bold;/);
  assert.match(html, /text-align: right;/);
  assert.match(html, /justify-content: flex-end;/);
  assert.match(html, /align-items: flex-end;/);
});

test("HTML converter renders alarm indicator segments", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const indicator = new HmiAlarmIndicator();
  indicator.name = "GroupDisplay";
  indicator.width = staticProperty(80);
  indicator.height = staticProperty(30);
  indicator.text = staticProperty("A");
  indicator.useEqualSegmentWidths = staticProperty(false);
  const first = new HmiAlarmIndicatorSegment();
  first.index = 1;
  first.width = staticProperty(15);
  first.messageClasses = staticProperty([1, 2]);
  indicator.segments.push(first);
  const second = new HmiAlarmIndicatorSegment();
  second.index = 2;
  second.width = staticProperty(25);
  second.messageClasses = staticProperty([3]);
  indicator.segments.push(second);
  const hidden = new HmiAlarmIndicatorSegment();
  hidden.index = 3;
  hidden.width = staticProperty(0);
  indicator.segments.push(hidden);
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(indicator);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-equal-segment-widths="false"/);
  assert.match(html, /data-segment-count="3"/);
  assert.match(html, /data-segment-index="1" data-message-classes="1,2" style="flex: 0 0 15px;/);
  assert.match(html, /data-segment-index="2" data-message-classes="3" style="flex: 0 0 25px;/);
  assert.match(html, /data-segment-index="3" style="display: none;/);
  assert.match(html, /class="hmi-alarm-indicator-label"/);
  assert.match(html, />A<\/span><\/div>/);
});

test("HTML converter renders locked alarm indicator", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const indicator = new HmiAlarmIndicator();
  indicator.name = "GroupDisplay";
  indicator.width = staticProperty(80);
  indicator.height = staticProperty(30);
  indicator.text = staticProperty("Alarm");
  indicator.isLocked = staticProperty(true);
  indicator.lockedText = staticProperty("LOCKED");
  indicator.lockedForegroundColor = staticProperty(hmiColorFromArgb(255, 255, 255, 0));
  indicator.lockedBackgroundColor = staticProperty(hmiColorFromArgb(255, 32, 48, 64));
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(indicator);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-locked="true"/);
  assert.match(html, /data-locked-text="LOCKED"/);
  assert.match(html, /data-locked-foreground-color="#FFFF00"/);
  assert.match(html, /data-locked-background-color="#203040"/);
  assert.match(html, /color: #FFFF00;/);
  assert.match(html, /background-color: #203040;/);
  assert.match(html, />LOCKED<\/div>/);
});

test("HTML converter renders alarm indicator fill pattern", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const indicator = new HmiAlarmIndicator();
  indicator.name = "GroupDisplay";
  indicator.width = staticProperty(80);
  indicator.height = staticProperty(30);
  indicator.backgroundColor = staticProperty(hmiColorFromArgb(255, 17, 34, 51));
  indicator.patternColor = staticProperty(hmiColorFromArgb(255, 12, 34, 56));
  indicator.fillPattern = staticProperty(HmiFillPattern.Checkers);
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(indicator);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /background-color: #112233;/);
  assert.match(html, /background-image: conic-gradient\(#0C2238 25%, transparent 0 50%, #0C2238 0 75%, transparent 0\);/);
});

test("HTML converter renders extended fill patterns", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  const layer = new HmiLayer();
  for (const [name, pattern, color] of [
    ["LargeBoxes", HmiFillPattern.LargeBoxes, hmiColorFromArgb(255, 0, 0, 0)],
    ["Ovals", HmiFillPattern.Ovals, hmiColorFromArgb(255, 0, 128, 255)],
    ["WideDiagonal", HmiFillPattern.WideDiagonalRightToLeft, hmiColorFromArgb(255, 255, 0, 0)],
  ]) {
    const item = new HmiRectangle();
    item.name = name;
    item.width = staticProperty(80);
    item.height = staticProperty(30);
    item.backgroundColor = staticProperty(hmiColorFromArgb(255, 255, 255, 255));
    item.patternColor = staticProperty(color);
    item.fillPattern = staticProperty(pattern);
    layer.items.push(item);
  }
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /background-image: linear-gradient\(#000000 1px, transparent 1px\), linear-gradient\(90deg, #000000 1px, transparent 1px\);background-size: 12px 12px;/);
  assert.match(html, /background-image: radial-gradient\(ellipse at center, transparent 0 35%, #0080FF 36% 45%, transparent 46%\);background-size: 12px 12px;/);
  assert.match(html, /background-image: repeating-linear-gradient\(45deg, #FF0000 0 2px, transparent 2px 6px\);background-size: 8px 8px;/);
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
  assert.match(html, /type="range" min="-10" max="10" value="4" step="any" disabled="disabled"/);
  assert.match(html, /<div id="LevelScale"/);
  assert.match(html, /><span>0<\/span><span>100<\/span>/);
  assert.ok(html.includes('data-hmi-scale-ticks="true"'));
});

for (const [direction, padding, midpoint, reversed] of [
  [HmiTickDirection.Down, "padding-top: 14px;", 'x1="50%"', false],
  [HmiTickDirection.Up, "padding-bottom: 14px;", 'x1="50%"', false],
  [HmiTickDirection.Left, "padding-right: 14px;", 'y1="50%"', true],
  [HmiTickDirection.Right, "padding-left: 14px;", 'y1="50%"', true],
]) {
test(`HTML converter renders standalone scale marks (${direction})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const scale = new HmiScale();
  scale.width = staticProperty(120);
  scale.height = staticProperty(100);
  scale.beginValue = staticProperty(0);
  scale.endValue = staticProperty(100);
  scale.divisionCount = staticProperty(4);
  scale.tickDirection = staticProperty(direction);
  scale.majorTickLength = staticProperty(12);
  scale.majorTicksBold = staticProperty(true);
  scale.tickLabelInterval = staticProperty(2);
  scale.tickLabelDecimalPlaces = staticProperty(1);
  scale.engineeringUnit = staticProperty("a&b");
  scale.scaleForegroundColor = staticProperty(hmiColorFromArgb(255, 1, 2, 3));
  scale.scaleBackgroundColor = staticProperty(hmiColorFromArgb(255, 4, 5, 6));
  scale.labelFont = { name: staticProperty("Arial"), size: staticProperty(9), bold: staticProperty(true) };
  layer.items.push(scale);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  let html = await converter.convertAsync(screen);
  assert.ok(html.includes(padding));
  assert.ok(html.includes(midpoint));
  assert.ok(html.includes('data-hmi-scale-ticks="true"'));
  assert.ok(html.includes('stroke="#010203" stroke-width="2"'));
  assert.ok(html.includes("background-color: #040506;"));
  assert.ok(html.includes("font-family: Arial; font-size: 9px; font-weight: bold;"));
  assert.ok(html.includes(reversed
    ? "<span>100.0&nbsp;a&amp;b</span><span></span><span>50.0&nbsp;a&amp;b</span><span></span><span>0.0&nbsp;a&amp;b</span>"
    : "<span>0.0&nbsp;a&amp;b</span><span></span><span>50.0&nbsp;a&amp;b</span><span></span><span>100.0&nbsp;a&amp;b</span>"));
  scale.showTickLabels = staticProperty(false);
  html = await converter.convertAsync(screen);
  assert.ok(html.includes('data-hmi-scale-ticks="true"'));
  assert.ok(!html.includes("&nbsp;a&amp;b"));
  scale.showScale = staticProperty(false);
  assert.ok(!(await converter.convertAsync(screen)).includes("data-hmi-scale-ticks"));
});
}

for (const standalone of [false, true]) {
for (const [direction, geometry] of [
  [HmiTickDirection.Down, 'y1="0" y2="6" x1="12.5%"'],
  [HmiTickDirection.Up, 'y1="6" y2="12" x1="12.5%"'],
  [HmiTickDirection.Right, 'x1="0" x2="6" y1="12.5%"'],
  [HmiTickDirection.Left, 'x1="6" x2="12" y1="12.5%"'],
]) {
test(`HTML converter renders configured minor scale ticks (${standalone}, ${direction})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const scale = standalone ? new HmiScale() : new HmiBar();
  if (standalone) scale.tickDirection = staticProperty(direction);
  else {
    scale.fillDirection = staticProperty(direction === HmiTickDirection.Left || direction === HmiTickDirection.Right
      ? HmiFillDirection.Up : HmiFillDirection.Right);
    scale.scaleAfterBar = staticProperty(direction === HmiTickDirection.Down || direction === HmiTickDirection.Right);
  }
  scale.width = staticProperty(120);
  scale.height = staticProperty(100);
  scale.showScale = staticProperty(true);
  scale.divisionCount = staticProperty(2);
  scale.subDivisionCount = staticProperty(4);
  scale.majorTickLength = staticProperty(12);
  scale.majorTicksBold = staticProperty(true);
  layer.items.push(scale);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  const html = await converter.convertAsync(screen);
  assert.equal([...html.matchAll(/data-hmi-minor-tick="true"/g)].length, 6);
  assert.ok(html.includes(`data-hmi-minor-tick="true" stroke-width="1" ${geometry}`));
  scale.majorTicksOnly = staticProperty(true);
  assert.ok(!(await converter.convertAsync(screen)).includes("data-hmi-minor-tick"));
  scale.majorTicksOnly = staticProperty(false);
  scale.subDivisionCount = staticProperty(1);
  assert.ok(!(await converter.convertAsync(screen)).includes("data-hmi-minor-tick"));
});
}
}

for (const only of [false, true]) {
test(`HTML converter exposes gauge major ticks only (${only})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const gauge = new HmiGauge();
  gauge.majorTicksOnly = staticProperty(only);
  gauge.subDivisionCount = staticProperty(5);
  layer.items.push(gauge);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const markup = html.match(/<hmi-gauge[^>]*>/)?.[0] ?? "";
  assert.equal(markup.includes("major-ticks-only"), only);
  assert.ok(markup.includes('sub-division-count="5"'));
});
}

for (const bold of [false, true]) {
test(`HTML converter exposes gauge bold major ticks (${bold})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const gauge = new HmiGauge();
  gauge.majorTicksBold = staticProperty(bold);
  gauge.subDivisionCount = staticProperty(5);
  layer.items.push(gauge);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const markup = html.match(/<hmi-gauge[^>]*>/)?.[0] ?? "";
  assert.equal(markup.includes("major-ticks-bold"), bold);
  assert.ok(markup.includes('sub-division-count="5"'));
});
}

for (const show of [false, true]) {
test(`HTML converter exposes gauge tick label visibility and interval (${show})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const gauge = new HmiGauge();
  gauge.showTickLabels = staticProperty(show);
  gauge.tickLabelInterval = staticProperty(2);
  layer.items.push(gauge);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const markup = html.match(/<hmi-gauge[^>]*>/)?.[0] ?? "";
  assert.equal(markup.includes("hide-tick-labels"), !show);
  assert.ok(markup.includes('tick-label-interval="2"'));
});
}

for (const [precision, exponential] of [[0, false], [2, false], [20, true], [25, true]]) {
test(`HTML converter exposes gauge tick label number formatting (${precision}, ${exponential})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const gauge = new HmiGauge();
  gauge.tickLabelDecimalPlaces = staticProperty(precision);
  gauge.tickLabelExponentialFormat = staticProperty(exponential);
  layer.items.push(gauge);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const markup = html.match(/<hmi-gauge[^>]*>/)?.[0] ?? "";
  assert.ok(markup.includes(`tick-label-decimal-places="${precision}"`));
  assert.equal(markup.includes("tick-label-exponential-format"), exponential);
});
}

for (const show of [false, true, undefined]) {
test(`HTML converter exposes gauge scale visibility (${show})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const gauge = new HmiGauge();
  if (show !== undefined) gauge.showScale = staticProperty(show);
  layer.items.push(gauge);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const markup = html.match(/<hmi-gauge[^>]*>/)?.[0] ?? "";
  assert.equal(markup.includes("hide-scale"), show === false);
});
}

for (const [slider, inside, width] of [[false, false, 4], [false, true, 4], [true, false, 4], [true, true, 4], [false, false, 1], [true, false, 1]]) {
test(`HTML converter renders scale widget border placement (${slider}, ${inside}, ${width})`, async () => {
  const item = slider ? new HmiSlider() : new HmiBar();
  item.drawInsideFrame = staticProperty(inside);
  item.borderWidth = staticProperty(width);
  item.borderColor = staticProperty(hmiColorFromArgb(255, 12, 34, 56));
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  layer.items.push(item);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(slider ? /<input[^>]*>/ : /<meter[^>]*>/)?.[0] ?? "";
  assert.equal(opening.includes("outline-width:"), !inside && width > 1);
  if (!inside && width > 1) {
    assert.ok(opening.includes("outline-width: 4px;"));
    assert.ok(opening.includes("outline-offset: -2px;"));
    assert.ok(opening.includes("outline-color: #0C2238;"));
  }
});
}

for (const slider of [false, true]) {
for (const inside of [false, true]) {
test(`HTML converter renders blinking scale widget border placement (${slider}, ${inside})`, async () => {
  const item = slider ? new HmiSlider() : new HmiBar();
  item.drawInsideFrame = staticProperty(inside);
  item.borderWidth = staticProperty(4);
  item.borderColor = blinkProperty(hmiColorFromArgb(255, 1, 2, 3), hmiColorFromArgb(255, 4, 5, 6), HmiBlinkRate.Fast);
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  layer.items.push(item);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const opening = html.match(slider ? /<input[^>]*>/ : /<meter[^>]*>/)?.[0] ?? "";
  assert.ok(opening.includes("--hmi-border-color-off: #010203;"));
  assert.ok(opening.includes("--hmi-border-color-on: #040506;"));
  assert.ok(opening.includes(`animation: hmi-${inside ? "border" : "outline"}-color-flash 0.5s steps(1, end) infinite;`));
  assert.equal(opening.includes("outline-width: 4px;"), !inside);
  if (!inside) {
    assert.ok(opening.includes("outline-offset: -2px;"));
    assert.ok(html.includes("0%,49.999%{outline-color:var(--hmi-border-color-off);}"));
    assert.ok(html.includes("50%,100%{outline-color:var(--hmi-border-color-on);}"));
  }
});
}
}

for (const scale of [false, true]) {
for (const blink of [false, true]) {
test(`HTML converter renders configured bar fill color (${scale}, ${blink})`, async () => {
  const bar = new HmiBar();
  bar.showScale = staticProperty(scale);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.value = staticProperty(35);
  bar.foregroundColor = blink
    ? blinkProperty(hmiColorFromArgb(255, 1, 2, 3), hmiColorFromArgb(255, 4, 5, 6), HmiBlinkRate.Fast)
    : staticProperty(hmiColorFromArgb(255, 1, 2, 3));
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  layer.items.push(bar);
  screen.layers.push(layer);
  let html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  let meter = html.match(/<meter[^>]*>/)?.[0] ?? "";
  assert.ok(meter.includes('data-hmi-bar-fill="true"'));
  assert.ok(meter.includes('value="35"'));
  assert.ok(html.includes("::-webkit-meter-optimum-value"));
  assert.ok(html.includes("::-moz-meter-bar{background:currentColor;}"));
  assert.ok(html.includes(blink
    ? "animation: hmi-foreground-color-flash 0.5s steps(1, end) infinite;"
    : "color: #010203;"));
  bar.foregroundColor = undefined;
  html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  meter = html.match(/<meter[^>]*>/)?.[0] ?? "";
  assert.ok(!meter.includes("data-hmi-bar-fill"));
});
}
}

for (const scale of [false, true]) {
for (const blink of [false, true]) {
test(`HTML converter renders configured bar track color (${scale}, ${blink})`, async () => {
  const bar = new HmiBar();
  bar.showScale = staticProperty(scale);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.value = staticProperty(35);
  bar.backgroundColor = blink
    ? blinkProperty(hmiColorFromArgb(255, 1, 2, 3), hmiColorFromArgb(255, 4, 5, 6), HmiBlinkRate.Fast)
    : staticProperty(hmiColorFromArgb(255, 1, 2, 3));
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  layer.items.push(bar);
  screen.layers.push(layer);
  let html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  let meter = html.match(/<meter[^>]*>/)?.[0] ?? "";
  assert.ok(meter.includes('data-hmi-bar-track="true"'));
  assert.ok(!meter.includes("data-hmi-bar-fill"));
  assert.ok(html.includes("--hmi-bar-track-background: #010203;"));
  assert.ok(html.includes("::-webkit-meter-bar{background:var(--hmi-bar-track-background);}"));
  if (blink) {
    assert.ok(html.includes("animation: hmi-background-color-flash 0.5s steps(1, end) infinite;"));
    assert.ok(html.includes("--hmi-bar-track-background:var(--hmi-background-color-off);"));
    assert.ok(html.includes("--hmi-bar-track-background:var(--hmi-background-color-on);"));
  }
  bar.backgroundColor = undefined;
  html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  meter = html.match(/<meter[^>]*>/)?.[0] ?? "";
  assert.ok(!meter.includes("data-hmi-bar-track"));
});
}
}

for (const scale of [false, true]) {
for (const [direction, cssDirection] of [[HmiGradientDirection.HorizontalFromLeft, "to right"],
  [HmiGradientDirection.HorizontalFromRight, "to left"], [HmiGradientDirection.VerticalFromTop, "to bottom"],
  [HmiGradientDirection.VerticalFromBottom, "to top"]]) {
test(`HTML converter renders bar track gradient (${scale}, ${direction})`, async () => {
  const bar = new HmiBar();
  bar.showScale = staticProperty(scale);
  bar.useFirstGradient = staticProperty(true);
  bar.useSecondGradient = staticProperty(true);
  bar.firstGradientColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
  bar.middleGradientColor = staticProperty(hmiColorFromArgb(255, 0, 255, 0));
  bar.secondGradientColor = staticProperty(hmiColorFromArgb(255, 0, 0, 255));
  bar.firstGradientOffset = staticProperty(25);
  bar.secondGradientOffset = staticProperty(75);
  bar.gradientDirection = staticProperty(direction);
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  layer.items.push(bar);
  screen.layers.push(layer);
  let html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  let meter = html.match(/<meter[^>]*>/)?.[0] ?? "";
  assert.ok(meter.includes('data-hmi-bar-track="true"'));
  assert.ok(html.includes(`--hmi-bar-track-background: linear-gradient(${cssDirection}, #FF0000 0%, #00FF00 25%, #00FF00 75%, #0000FF 100%);`));
  bar.useFirstGradient = staticProperty(false);
  bar.useSecondGradient = staticProperty(false);
  html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  meter = html.match(/<meter[^>]*>/)?.[0] ?? "";
  assert.ok(!meter.includes("data-hmi-bar-track"));
});
}
}

for (const [value, expected] of [[5, "#FF0000"], [10, "#00FF00"], [15, "#00FF00"], [20, "#0000FF"], [25, "#0000FF"]]) {
test(`HTML converter renders bar threshold fill colors at ${value}`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.name = "LimitBar";
  bar.value = staticProperty(value);
  bar.foregroundColor = staticProperty(hmiColorFromArgb(255, 0, 0, 255));
  bar.useThresholdFillColors = staticProperty(true);
  bar.showLimitRanges = staticProperty(false);
  for (const [limit, enabled, color] of [[20, true, [0, 255, 0]], [10, true, [255, 0, 0]], [15, false, [255, 255, 0]]]) {
    const threshold = new HmiThreshold();
    threshold.value = staticProperty(limit);
    threshold.enabled = staticProperty(enabled);
    threshold.color = staticProperty(hmiColorFromArgb(255, ...color));
    bar.thresholds.push(threshold);
  }
  layer.items.push(bar);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const meter = html.match(/<meter[^>]*>/)?.[0];
  assert.ok(meter);
  assert.ok(meter.includes(`color: ${expected};`));
  assert.ok(meter.includes('data-hmi-bar-fill="true"'));
  assert.ok(!html.includes("data-hmi-bar-threshold"));
});
}

for (const [disabled, useDisabledColor, fill, foreground] of [
  [false, false, "#FF0000", "#0000FF"], [false, true, "#FF0000", "#0000FF"],
  [true, false, "#FF0000", "#0000FF"], [true, true, undefined, "#888888"],
]) {
test(`HTML converter keeps scaled bar limit fill separate (${disabled}, ${useDisabledColor})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.name = "LimitScale";
  bar.showScale = staticProperty(true);
  bar.showLimitRanges = staticProperty(false);
  bar.value = staticProperty(5);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(20);
  bar.useThresholdFillColors = staticProperty(true);
  bar.enabled = staticProperty(!disabled);
  bar.useDisabledForegroundColor = staticProperty(useDisabledColor);
  bar.foregroundColor = staticProperty(hmiColorFromArgb(255, 0, 0, 255));
  bar.disabledForegroundColor = staticProperty(hmiColorFromArgb(255, 136, 136, 136));
  const threshold = new HmiThreshold();
  threshold.value = staticProperty(10);
  threshold.enabled = staticProperty(true);
  threshold.color = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
  bar.thresholds.push(threshold);
  layer.items.push(bar);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const root = html.match(/<div id="LimitScale"[^>]*>/)?.[0] ?? "";
  const meter = html.match(/<meter[^>]*>/)?.[0] ?? "";
  assert.ok(root.includes(`color: ${foreground};`));
  assert.ok(!root.includes("color: #FF0000;"));
  assert.ok(fill === undefined ? !meter.includes("color:") : meter.includes(`color: ${fill};`));
  assert.ok(html.includes('data-hmi-bar-scale="true"'));
});
}

for (const [direction, below, points] of [
  [HmiFillDirection.Right, true, "0,6 12,0 12,12"], [HmiFillDirection.Right, false, "12,6 0,0 0,12"],
  [HmiFillDirection.Left, true, "12,6 0,0 0,12"], [HmiFillDirection.Left, false, "0,6 12,0 12,12"],
  [HmiFillDirection.Up, true, "6,12 0,0 12,0"], [HmiFillDirection.Up, false, "6,0 0,12 12,12"],
  [HmiFillDirection.Down, true, "6,0 0,12 12,12"], [HmiFillDirection.Down, false, "6,12 0,0 12,0"],
]) {
test(`HTML converter renders bar out-of-range arrows (${direction}, ${below})`, async () => {
  for (const scale of [false, true]) {
    const screen = new HmiScreen();
    const layer = new HmiLayer();
    const bar = new HmiBar();
    bar.fillDirection = staticProperty(direction);
    bar.showScale = staticProperty(scale);
    bar.showLimitRanges = staticProperty(false);
    bar.beginValue = staticProperty(0);
    bar.endValue = staticProperty(100);
    bar.value = staticProperty(below ? -5 : 105);
    bar.underflowLimit = staticProperty(10);
    bar.overflowLimit = staticProperty(90);
    bar.foregroundColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
    layer.items.push(bar);
    screen.layers.push(layer);
    const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
    const arrow = html.match(/<svg[^>]*data-hmi-bar-out-of-range[^>]*>.*?<\/svg>/)?.[0] ?? "";
    assert.ok(arrow.includes(`data-hmi-bar-out-of-range="${below ? "Below" : "Above"}"`));
    assert.ok(arrow.includes(`data-raw-value="${below ? -5 : 105}"`));
    assert.ok(arrow.includes(`data-limit-value="${below ? 10 : 90}"`));
    assert.ok(arrow.includes(`<polygon fill="#000000" points="${points}"`));
    assert.ok(html.includes(`value="${below ? 0 : 100}"`));
  }
});
}
for (const value of [10, 50, 90]) {
test(`HTML converter does not render bar arrows within limits (${value})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.value = staticProperty(value);
  bar.underflowLimit = staticProperty(10);
  bar.overflowLimit = staticProperty(90);
  layer.items.push(bar);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(!html.includes("data-hmi-bar-out-of-range"));
});
}

test("HTML converter renders bar fill directions", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();

  for (const [name, direction] of [
    ["UpBar", HmiFillDirection.Up],
    ["DownBar", HmiFillDirection.Down],
    ["LeftBar", HmiFillDirection.Left],
    ["RightBar", HmiFillDirection.Right],
  ]) {
    const bar = new HmiBar();
    bar.name = name;
    bar.width = staticProperty(100);
    bar.height = staticProperty(20);
    bar.fillDirection = staticProperty(direction);
    layer.items.push(bar);
  }
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /writing-mode: vertical-lr; direction: rtl;" data-fill-direction="Up"/);
  assert.match(html, /writing-mode: vertical-lr; direction: ltr;" data-fill-direction="Down"/);
  assert.match(html, /id="LeftBar"[^>]*direction: rtl;" data-fill-direction="Left"/);
  assert.match(html, /id="RightBar"[^>]*direction: ltr;" data-fill-direction="Right"/);
});

test("HTML converter renders bar scale ticks and appearance", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.name = "ScaledBar";
  bar.width = staticProperty(120);
  bar.height = staticProperty(40);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.value = staticProperty(35);
  bar.showScale = staticProperty(true);
  bar.divisionCount = staticProperty(2);
  bar.tickLabelDecimalPlaces = staticProperty(1);
  bar.engineeringUnit = staticProperty("bar");
  bar.labelColor = staticProperty(hmiColorFromArgb(255, 12, 34, 56));
  bar.labelFont = {
    name: staticProperty("Arial"),
    size: staticProperty(9),
    bold: staticProperty(true),
  };
  layer.items.push(bar);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="ScaledBar"/);
  assert.match(html, /data-hmi-bar="true" data-fill-direction="Right"/);
  assert.match(html, /<meter style="width: 100%; flex: 1; min-width: 0; min-height: 0;direction: ltr;" min="0" max="100" value="35">35<\/meter>/);
  assert.match(html, /data-hmi-bar-scale="true"/);
  assert.match(html, /color: #0C2238; font-family: Arial; font-size: 9px; font-weight: bold;/);
  assert.match(html, /<span>0.0&nbsp;bar<\/span><span>50.0&nbsp;bar<\/span><span>100.0&nbsp;bar<\/span>/);
});

for (const exponential of [false, true]) {
for (const [configured, expected] of [[16, 16], [20, 20], [25, 20], [-1, 0]]) {
test(`HTML converter renders full bar decimal precision (${configured}, ${exponential})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(80);
  bar.showScale = staticProperty(true);
  bar.divisionCount = staticProperty(2);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(1);
  bar.tickLabelDecimalPlaces = staticProperty(configured);
  bar.tickLabelExponentialFormat = staticProperty(exponential);
  layer.items.push(bar);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const label = exponential ? "5" + (expected > 0 ? "." + "0".repeat(expected) : "") + "e-001"
    : expected > 0 ? "0.5" + "0".repeat(expected - 1) : "1";
  assert.ok(html.includes(`<span>${label}</span>`));
});
}
}

for (const direction of [HmiFillDirection.Right, HmiFillDirection.Up]) {
test(`HTML converter renders bar scale colors (${direction})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(80);
  bar.showScale = staticProperty(true);
  bar.fillDirection = staticProperty(direction);
  bar.scaleForegroundColor = staticProperty(hmiColorFromArgb(255, 12, 34, 56));
  bar.scaleBackgroundColor = staticProperty(hmiColorFromArgb(255, 65, 43, 21));
  layer.items.push(bar);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  let html = await converter.convertAsync(screen);
  assert.ok(html.includes("color: #0C2238; background-color: #412B15;"));
  assert.ok(html.includes('stroke="#0C2238"'));
  bar.labelColor = staticProperty(hmiColorFromArgb(255, 1, 2, 3));
  html = await converter.convertAsync(screen);
  assert.ok(html.includes("color: #010203; background-color: #412B15;"));
  assert.ok(html.includes('stroke="#0C2238"'));
  bar.tickColor = staticProperty(hmiColorFromArgb(255, 4, 5, 6));
  html = await converter.convertAsync(screen);
  assert.ok(html.includes('stroke="#040506"'));
  bar.showScale = staticProperty(false);
  html = await converter.convertAsync(screen);
  assert.ok(!html.includes("#412B15"));
  assert.ok(!html.includes("data-hmi-bar-ticks"));
});
}

for (const [direction, after, edge, bold] of [
  [HmiFillDirection.Up, true, "left", true],
  [HmiFillDirection.Down, false, "right", false],
  [HmiFillDirection.Left, true, "top", true],
  [HmiFillDirection.Right, false, "bottom", false],
]) {
test(`HTML converter renders bar major tick strokes (${edge})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(80);
  bar.showScale = staticProperty(true);
  bar.divisionCount = staticProperty(2);
  bar.fillDirection = staticProperty(direction);
  bar.scaleAfterBar = staticProperty(after);
  bar.showTickLabels = staticProperty(false);
  bar.majorTickLength = staticProperty(12);
  bar.majorTicksBold = staticProperty(bold);
  bar.tickColor = staticProperty(hmiColorFromArgb(255, 12, 34, 56));
  layer.items.push(bar);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  const html = await converter.convertAsync(screen);
  assert.ok(html.includes(`padding-${edge}: 14px;`));
  assert.ok(html.includes('data-hmi-bar-ticks="true"'));
  assert.ok(html.includes(`stroke="#0C2238" stroke-width="${bold ? 2 : 1}"`));
  assert.ok(html.includes(direction === HmiFillDirection.Up || direction === HmiFillDirection.Down
    ? '<line x1="0" x2="12" y1="50%" y2="50%"></line>'
    : '<line y1="0" y2="12" x1="50%" x2="50%"></line>'));
  assert.ok(html.includes("<span></span><span></span><span></span>"));
  bar.showScale = staticProperty(false);
  assert.ok(!(await converter.convertAsync(screen)).includes("data-hmi-bar-ticks"));
});
}

for (const [sections, tickCount] of [[0, 2], [1, 2], [4, 5], [100, 101]]) {
test(`HTML converter renders bar scale sections (${sections})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(80);
  bar.showScale = staticProperty(true);
  bar.divisionCount = staticProperty(sections);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  layer.items.push(bar);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  const strokes = html.match(/<svg[^>]*data-hmi-bar-ticks[^>]*>(.*?)<\/svg>/)?.[1] ?? "";
  assert.equal([...strokes.matchAll(/<line /g)].length, tickCount);
  assert.ok(html.includes("<span>0</span>"));
  assert.ok(html.includes("<span>100</span>"));
});
}

for (const [direction, labelPosition, strokePosition] of [
  [HmiFillDirection.Right, "left: 90%", 'x1="90%"'],
  [HmiFillDirection.Left, "left: 10%", 'x1="10%"'],
  [HmiFillDirection.Down, "top: 90%", 'y1="90%"'],
  [HmiFillDirection.Up, "top: 10%", 'y1="10%"'],
]) {
test(`HTML converter renders bar major tick interval (${direction})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(80);
  bar.showScale = staticProperty(true);
  bar.divisionCount = staticProperty(2);
  bar.majorTickInterval = staticProperty(30);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.fillDirection = staticProperty(direction);
  layer.items.push(bar);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  const html = await converter.convertAsync(screen);
  assert.ok(html.includes(labelPosition));
  assert.ok(html.includes(strokePosition));
  for (const value of [30, 60, 90]) assert.ok(html.includes(`>${value}</span>`));
  assert.ok(!html.includes(">100</span>"));
  const fallbackLabels = direction === HmiFillDirection.Up || direction === HmiFillDirection.Left
    ? "<span>100</span><span>50</span><span>0</span>"
    : "<span>0</span><span>50</span><span>100</span>";
  bar.scaleMode = staticProperty(3);
  assert.ok((await converter.convertAsync(screen)).includes(fallbackLabels));
  bar.scaleMode = staticProperty(0);
  bar.majorTickInterval = staticProperty(0);
  assert.ok((await converter.convertAsync(screen)).includes(fallbackLabels));
});
}

for (const direction of [HmiFillDirection.Right, HmiFillDirection.Down, HmiFillDirection.Left, HmiFillDirection.Up]) {
test(`HTML converter renders bar tick label intervals (${direction})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(40);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.value = staticProperty(35);
  bar.showScale = staticProperty(true);
  bar.divisionCount = staticProperty(4);
  bar.tickLabelInterval = staticProperty(3);
  bar.engineeringUnit = staticProperty("a&b");
  bar.fillDirection = staticProperty(direction);
  layer.items.push(bar);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  let html = await converter.convertAsync(screen);
  const reversed = direction === HmiFillDirection.Left || direction === HmiFillDirection.Up;
  assert.ok(html.includes(reversed
    ? "<span></span><span>75&nbsp;a&amp;b</span><span></span><span></span><span>0&nbsp;a&amp;b</span>"
    : "<span>0&nbsp;a&amp;b</span><span></span><span></span><span>75&nbsp;a&amp;b</span><span></span>"));
  bar.showTickLabels = staticProperty(false);
  html = await converter.convertAsync(screen);
  assert.ok(html.includes("<span></span><span></span><span></span><span></span><span></span>"));
  assert.ok(!html.includes("&nbsp;a&amp;b"));
  bar.showTickLabels = staticProperty(true);
  bar.tickLabelInterval = staticProperty(0);
  html = await converter.convertAsync(screen);
  assert.ok(html.includes("<span>25&nbsp;a&amp;b</span>"));
  assert.ok(html.includes("<span>50&nbsp;a&amp;b</span>"));
});
}

for (const direction of [HmiFillDirection.Right, HmiFillDirection.Left, HmiFillDirection.Up, HmiFillDirection.Down]) {
for (const after of [false, true]) {
test(`HTML converter renders bar scale alignment (${direction}, ${after})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(40);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.showScale = staticProperty(true);
  bar.scaleAfterBar = staticProperty(after);
  bar.fillDirection = staticProperty(direction);
  layer.items.push(bar);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  let html = await converter.convertAsync(screen);
  const vertical = direction === HmiFillDirection.Up || direction === HmiFillDirection.Down;
  const side = vertical ? after ? "Right" : "Left" : after ? "Bottom" : "Top";
  assert.ok(html.includes(`data-scale-side="${side}"`));
  const scaleIndex = html.indexOf("data-hmi-bar-scale=");
  const meterIndex = html.indexOf("data-hmi-bar-meter=");
  assert.ok(scaleIndex >= 0 && meterIndex >= 0);
  assert.equal(scaleIndex > meterIndex, after);
  bar.showScale = staticProperty(false);
  html = await converter.convertAsync(screen);
  assert.ok(!html.includes("data-scale-side="));
  assert.ok(!html.includes("data-hmi-bar-scale="));
});
}
}

for (const [minimum, maximum, first, middle, last] of [
  [0, 100, "0.00e+000", "5.00e+001", "1.00e+002"],
  [-100, 100, "-1.00e+002", "0.00e+000", "1.00e+002"],
  [0, 0.004, "0.00e+000", "2.00e-003", "4.00e-003"],
]) {
test(`HTML converter renders bar exponential labels (${minimum}, ${maximum})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.width = staticProperty(120);
  bar.height = staticProperty(40);
  bar.beginValue = staticProperty(minimum);
  bar.endValue = staticProperty(maximum);
  bar.showScale = staticProperty(true);
  bar.divisionCount = staticProperty(2);
  bar.tickLabelDecimalPlaces = staticProperty(2);
  bar.tickLabelExponentialFormat = staticProperty(true);
  layer.items.push(bar);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  let html = await converter.convertAsync(screen);
  assert.ok(html.includes(`<span>${first}</span><span>${middle}</span><span>${last}</span>`));
  delete bar.tickLabelDecimalPlaces;
  html = await converter.convertAsync(screen);
  assert.ok(html.includes(`<span>${middle}</span>`));
  bar.tickLabelExponentialFormat = staticProperty(false);
  html = await converter.convertAsync(screen);
  assert.ok(!html.includes(`<span>${middle}</span>`));
});
}

test("HTML converter renders enabled bar threshold markers", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  const bar = new HmiBar();
  bar.name = "ThresholdBar";
  bar.width = staticProperty(120);
  bar.height = staticProperty(20);
  bar.beginValue = staticProperty(0);
  bar.endValue = staticProperty(100);
  bar.value = staticProperty(35);
  bar.fillDirection = staticProperty(HmiFillDirection.Right);
  bar.thresholdValueMode = staticProperty(HmiThresholdValueMode.Absolute);
  const active = new HmiThreshold();
  active.index = 4;
  active.enabled = staticProperty(true);
  active.value = staticProperty(25);
  active.color = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
  bar.thresholds.push(active);
  const disabled = new HmiThreshold();
  disabled.index = 5;
  disabled.enabled = staticProperty(false);
  disabled.value = staticProperty(75);
  disabled.color = staticProperty(hmiColorFromArgb(255, 255, 255, 0));
  bar.thresholds.push(disabled);
  layer.items.push(bar);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-hmi-bar-meter="true"/);
  assert.match(html, /data-hmi-bar-threshold="4" data-threshold-value="25"/);
  assert.match(html, /background-color: #FF0000; top: 0; bottom: 0; left: 25%; width: 2px;/);
  assert.doesNotMatch(html, /data-hmi-bar-threshold="5"/);
});

test("HTML converter renders slider orientations", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();

  for (const [name, orientation] of [
    ["TopSlider", 0],
    ["BottomSlider", 1],
    ["LeftSlider", 2],
    ["RightSlider", 3],
  ]) {
    const slider = new HmiSlider();
    slider.name = name;
    slider.width = staticProperty(100);
    slider.height = staticProperty(20);
    slider.orientation = staticProperty(orientation);
    layer.items.push(slider);
  }
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /writing-mode: vertical-lr; direction: rtl;" data-hmi-slider="true" data-orientation="Up"/);
  assert.match(html, /writing-mode: vertical-lr; direction: ltr;" data-hmi-slider="true" data-orientation="Down"/);
  assert.match(html, /id="LeftSlider"[^>]*direction: rtl;" data-hmi-slider="true" data-orientation="Left"/);
  assert.match(html, /id="RightSlider"[^>]*direction: ltr;" data-hmi-slider="true" data-orientation="Right"/);
});

for (const [orientation, stepSize] of [[0, 5], [1, 0], [2, -1], [3, 5]]) {
test(`HTML converter preserves fractional slider value and small change (${orientation})`, async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const slider = new HmiSlider();
  slider.width = staticProperty(120);
  slider.height = staticProperty(80);
  slider.beginValue = staticProperty(-20);
  slider.endValue = staticProperty(120);
  slider.value = staticProperty(35.25);
  slider.orientation = staticProperty(orientation);
  slider.stepSize = staticProperty(stepSize);
  layer.items.push(slider);
  screen.layers.push(layer);
  const converter = new HmiScreenToHtmlConverter();
  let html = await converter.convertAsync(screen);
  assert.ok(html.includes(`data-small-change="${stepSize}"`));
  assert.ok(html.includes('min="-20" max="120" value="35.25" step="any" disabled="disabled"'));
  delete slider.stepSize;
  html = await converter.convertAsync(screen);
  assert.ok(!html.includes("data-small-change"));
  assert.ok(html.includes('value="35.25" step="any"'));
});
}

test("HTML converter renders slider thumb color", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  const slider = new HmiSlider();
  slider.name = "ColoredSlider";
  slider.width = staticProperty(100);
  slider.height = staticProperty(20);
  slider.thumbBackgroundColor = staticProperty(hmiColorFromArgb(255, 12, 34, 56));
  layer.items.push(slider);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /input\[data-hmi-slider\]\{accent-color:var\(--hmi-slider-thumb-background,auto\);/);
  assert.match(html, /--hmi-slider-thumb-background: #0C2238;/);
  assert.match(html, /data-hmi-slider="true"/);
});

test("HTML converter renders direction-aware slider track colors", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();

  for (const [name, orientation] of [["VerticalSlider", 0], ["HorizontalSlider", 3]]) {
    const slider = new HmiSlider();
    slider.name = name;
    slider.width = staticProperty(100);
    slider.height = staticProperty(20);
    slider.orientation = staticProperty(orientation);
    slider.trackHighBackgroundColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
    slider.trackLowBackgroundColor = staticProperty(hmiColorFromArgb(255, 0, 0, 255));
    layer.items.push(slider);
  }
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /--hmi-slider-track-background: linear-gradient\(to bottom, #FF0000, #0000FF\);/);
  assert.match(html, /--hmi-slider-track-background: linear-gradient\(to left, #FF0000, #0000FF\);/);
  assert.match(html, /::-webkit-slider-runnable-track/);
  assert.match(html, /::-moz-range-track/);
});

test("HTML converter renders slider stop colors", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  const slider = new HmiSlider();
  slider.name = "StoppedSlider";
  slider.width = staticProperty(100);
  slider.height = staticProperty(20);
  slider.orientation = staticProperty(3);
  slider.trackHighBackgroundColor = staticProperty(hmiColorFromArgb(255, 255, 128, 128));
  slider.trackLowBackgroundColor = staticProperty(hmiColorFromArgb(255, 128, 128, 255));
  slider.highStopColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
  slider.lowStopColor = staticProperty(hmiColorFromArgb(255, 0, 0, 255));
  layer.items.push(slider);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html,
    /linear-gradient\(to left, #FF0000 0 4px, #FF8080 4px, #8080FF calc\(100% - 4px\), #0000FF calc\(100% - 4px\) 100%\)/);
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

test("HTML converter renders an inert data grid preview", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const dataGrid = new HmiDataGridControl();
  dataGrid.name = "BatchHistory";
  dataGrid.width = staticProperty(300);
  dataGrid.height = staticProperty(180);
  dataGrid.showToolbar = staticProperty(true);
  dataGrid.showStatusBar = staticProperty(true);
  dataGrid.showExportCsv = staticProperty(true);
  dataGrid.showProperties = staticProperty(false);
  dataGrid.dataSourceKind = staticProperty(HmiDataGridDataSourceKind.SqlServer);
  dataGrid.sourceDataSourceKind = "SQL Server";
  dataGrid.dataSourceName = staticProperty("ProductionHistory");
  dataGrid.tableOrView = staticProperty("dbo.BatchEvents");
  dataGrid.timeSortDirection = staticProperty(HmiDataGridSortDirection.Descending);
  dataGrid.sourceTimeSortDirection = "Descending";
  dataGrid.timePeriodAbsoluteMode = staticProperty(true);
  dataGrid.timePeriodStart = staticProperty("2026-08-30T08:00:00");
  dataGrid.timePeriodEnd = staticProperty("2026-08-30T12:00:00");
  layer.items.push(dataGrid);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="BatchHistory"/);
  assert.match(html, /data-show-toolbar="true"/);
  assert.match(html, /data-show-properties="false"/);
  assert.match(html, /data-source-kind="SqlServer"/);
  assert.match(html, /data-source-kind-raw="SQL Server"/);
  assert.match(html, /data-source-name="ProductionHistory"/);
  assert.match(html, /data-table-or-view="dbo.BatchEvents"/);
  assert.match(html, /data-time-sort="Descending"/);
  assert.match(html, /data-time-period-absolute="true"/);
  assert.match(html, />Data grid · Export CSV<\/div>/);
  assert.match(html, />Time: 2026-08-30T08:00:00 – 2026-08-30T12:00:00<\/div>/);
  assert.match(html, />SqlServer: ProductionHistory · dbo.BatchEvents<\/div>/);
  assert.match(html, />Status<\/div>/);
});

test("HTML converter renders an inert recipe table preview", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const recipe = new HmiRecipeControl();
  recipe.name = "RecipeTable";
  recipe.width = staticProperty(300);
  recipe.height = staticProperty(180);
  recipe.viewKind = HmiRecipeViewKind.Table;
  recipe.defaultRecipeName = staticProperty("Batch A");
  recipe.showHeader = staticProperty(true);
  recipe.showFooter = staticProperty(true);
  recipe.viewOnly = staticProperty(true);
  recipe.linesPerItem = staticProperty(2);
  const ingredient = new HmiRecipeColumn();
  ingredient.type = HmiRecipeColumnType.IngredientName;
  ingredient.headerText = HmiMultilingualText.fromText("Ingredient");
  recipe.columnDefinitions.push(ingredient);
  const value = new HmiRecipeColumn();
  value.type = HmiRecipeColumnType.RecipeValue;
  value.headerText = HmiMultilingualText.fromText("Setpoint");
  recipe.columnDefinitions.push(value);
  const hidden = new HmiRecipeColumn();
  hidden.type = HmiRecipeColumnType.TagName;
  hidden.visible = staticProperty(false);
  recipe.columnDefinitions.push(hidden);
  layer.items.push(recipe);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="RecipeTable"/);
  assert.match(html, /data-view-kind="Table"/);
  assert.match(html, /data-default-recipe="Batch A"/);
  assert.match(html, /data-view-only="true"/);
  assert.match(html, /data-column-type="IngredientName">Ingredient<\/th>/);
  assert.match(html, /data-column-type="RecipeValue">Setpoint<\/th>/);
  assert.doesNotMatch(html, /data-column-type="TagName"/);
  assert.match(html, /colspan="2" style="text-align: center;">Recipe data not loaded<\/td>/);
  assert.match(html, />Recipe control<\/div>/);
});

test("HTML converter renders an inert audit trail preview", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const audit = new HmiAuditTrailControl();
  audit.name = "OperatorAudit";
  audit.width = staticProperty(300);
  audit.height = staticProperty(180);
  audit.viewKind = HmiAuditTrailViewKind.List;
  audit.showHeader = staticProperty(true);
  audit.linesPerEntry = staticProperty(2);
  audit.wordWrap = staticProperty(true);
  audit.receiveSelectionFrom = "AuditDetail";
  const occurred = new HmiAuditTrailFieldPresentation();
  occurred.field = HmiAuditTrailField.OccurredTime;
  occurred.headerText = HmiMultilingualText.fromText("When");
  occurred.timeAndDateFormat = "yyyy-MM-dd HH:mm:ss";
  audit.fields.push(occurred);
  const user = new HmiAuditTrailFieldPresentation();
  user.field = HmiAuditTrailField.Username;
  user.headerText = HmiMultilingualText.fromText("User");
  audit.fields.push(user);
  const hidden = new HmiAuditTrailFieldPresentation();
  hidden.field = HmiAuditTrailField.Resource;
  hidden.visible = staticProperty(false);
  audit.fields.push(hidden);
  layer.items.push(audit);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="OperatorAudit"/);
  assert.match(html, /data-view-kind="List"/);
  assert.match(html, /data-lines-per-entry="2"/);
  assert.match(html, /data-word-wrap="true"/);
  assert.match(html, /data-receive-selection-from="AuditDetail"/);
  assert.match(html, /data-field="OccurredTime" data-time-format="yyyy-MM-dd HH:mm:ss">When<\/th>/);
  assert.match(html, /data-field="Username">User<\/th>/);
  assert.doesNotMatch(html, /data-field="Resource"/);
  assert.match(html, /colspan="2" style="text-align: center;">Audit data not loaded<\/td>/);
});

test("HTML converter renders inert alarm previews", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const alarms = new HmiAlarmControl();
  alarms.name = "ActiveAlarms";
  alarms.width = staticProperty(300);
  alarms.height = staticProperty(160);
  alarms.viewKind = HmiAlarmViewKind.AlarmAndEventSummary;
  alarms.showHeader = staticProperty(true);
  alarms.showTitle = staticProperty(true);
  alarms.resizable = staticProperty(true);
  alarms.movable = staticProperty(true);
  alarms.closeable = staticProperty(true);
  alarms.headerBackgroundColor = staticProperty(hmiColorFromArgb(255, 0xe3, 0xe3, 0xe3));
  alarms.headerForegroundColor = staticProperty(hmiColorFromArgb(255, 0x01, 0x02, 0x03));
  alarms.headerBorderColor = staticProperty(hmiColorFromArgb(255, 0x66, 0x77, 0x88));
  alarms.showToolbar = staticProperty(true);
  alarms.toolbarBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x44, 0x33, 0x22));
  alarms.toolbarForegroundColor = staticProperty(hmiColorFromArgb(255, 0xfa, 0xfb, 0xfc));
  alarms.gridLineColor = staticProperty(hmiColorFromArgb(255, 0x44, 0x55, 0x66));
  alarms.gridLineWidth = staticProperty(2);
  alarms.showHorizontalGridLines = staticProperty(false);
  alarms.showVerticalGridLines = staticProperty(true);
  alarms.showHorizontalScrollbar = staticProperty(true);
  alarms.showVerticalScrollbar = staticProperty(false);
  alarms.tableBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x10, 0x20, 0x30));
  alarms.tableForegroundColor = staticProperty(hmiColorFromArgb(255, 0xe0, 0xd0, 0xc0));
  alarms.useAlternatingRowColors = staticProperty(true);
  alarms.alternatingRowBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  alarms.alternatingRowForegroundColor = staticProperty(hmiColorFromArgb(255, 0xab, 0xcd, 0xef));
  alarms.tableHeaderBackgroundColor = staticProperty(hmiColorFromArgb(255, 0xe3, 0xe3, 0xe3));
  alarms.tableHeaderForegroundColor = staticProperty(hmiColorFromArgb(255, 0x01, 0x02, 0x03));
  alarms.tableHeaderHorizontalAlignment = staticProperty(HmiHorizontalAlignment.Center);
  alarms.tableHeaderBorderColor = staticProperty(hmiColorFromArgb(255, 0x66, 0x77, 0x88));
  alarms.tableHeaderBorderWidth = staticProperty(3);
  alarms.selectionBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x70, 0x80, 0x90));
  alarms.selectionForegroundColor = staticProperty(hmiColorFromArgb(255, 0xf1, 0xf2, 0xf3));
  alarms.selectionRectangleMode = staticProperty(2);
  alarms.useAutomaticSelectionRectangleColor = staticProperty(false);
  alarms.selectionRectangleColor = staticProperty(hmiColorFromArgb(255, 0x0a, 0x0b, 0x0c));
  alarms.selectionRectangleWidth = staticProperty(2);
  alarms.showStatusBar = staticProperty(true);
  alarms.statusBarBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x21, 0x32, 0x43));
  alarms.statusBarForegroundColor = staticProperty(hmiColorFromArgb(255, 0xfe, 0xdc, 0xba));
  alarms.statusBarFont = new HmiFont();
  alarms.statusBarFont.name = staticProperty("Tahoma");
  alarms.statusBarFont.size = staticProperty(8);
  alarms.statusBarFont.weight = staticProperty(600);
  alarms.statusBarFont.italic = staticProperty(true);
  alarms.contentFont = new HmiFont();
  alarms.contentFont.name = staticProperty("Arial");
  alarms.contentFont.size = staticProperty(9.75);
  alarms.contentFont.weight = staticProperty(400);
  alarms.headerFont = new HmiFont();
  alarms.headerFont.name = staticProperty("Siemens Sans");
  alarms.headerFont.size = staticProperty(10);
  alarms.headerFont.weight = staticProperty(700);
  alarms.headerFont.italic = staticProperty(true);
  alarms.headerFont.underline = staticProperty(true);
  alarms.headerFont.strikethrough = staticProperty(true);
  alarms.listMode = staticProperty(HmiAlarmListMode.Active);
  alarms.activeAlarmsTitle = HmiMultilingualText.fromText("Active process alarms");
  alarms.numberOfRows = staticProperty(8);
  alarms.showWaitingMessage = staticProperty(true);
  alarms.showOutOfScopeAlarms = staticProperty(false);
  alarms.showAcknowledgeButton = staticProperty(true);
  alarms.showHelpButton = staticProperty(true);
  alarms.filteredTriggers.push("Motor*");
  const time = new HmiAlarmColumn();
  time.type = HmiAlarmColumnType.AlarmTime;
  time.headerText = HmiMultilingualText.fromText("Time");
  time.timeAndDateFormat = "HH:mm:ss";
  alarms.columnDefinitions.push(time);
  const message = new HmiAlarmColumn();
  message.type = HmiAlarmColumnType.Message;
  message.headerText = HmiMultilingualText.fromText("Message");
  alarms.columnDefinitions.push(message);
  const hidden = new HmiAlarmColumn();
  hidden.type = HmiAlarmColumnType.AlarmState;
  hidden.visible = staticProperty(false);
  alarms.columnDefinitions.push(hidden);
  layer.items.push(alarms);
  const banner = new HmiAlarmLineControl();
  banner.name = "AlarmBanner";
  banner.y = staticProperty(170);
  banner.width = staticProperty(300);
  banner.height = staticProperty(30);
  banner.viewKind = HmiAlarmLineViewKind.AlarmBanner;
  banner.queueNewAlarms = staticProperty(true);
  banner.showAlarmTime = staticProperty(true);
  banner.alarmTimeFormat = "HH:mm";
  banner.showAlarmState = staticProperty(true);
  layer.items.push(banner);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="ActiveAlarms"/);
  assert.match(html, /data-view-kind="AlarmAndEventSummary"/);
  assert.match(html, /data-list-mode="Active"/);
  assert.match(html, /data-window-resizable="true"/);
  assert.match(html, /data-window-movable="true"/);
  assert.match(html, /data-window-closeable="true"/);
  assert.match(html, /data-header-background-color="#E3E3E3"/);
  assert.match(html, /data-header-foreground-color="#010203"/);
  assert.match(html, /data-header-border-color="#667788"/);
  assert.match(html, /data-show-toolbar="true"/);
  assert.match(html, /data-toolbar-background-color="#443322"/);
  assert.match(html, /data-toolbar-foreground-color="#FAFBFC"/);
  assert.match(html, /data-grid-line-color="#445566"/);
  assert.match(html, /data-grid-line-width="2"/);
  assert.match(html, /data-show-horizontal-grid-lines="false"/);
  assert.match(html, /data-show-vertical-grid-lines="true"/);
  assert.match(html, /data-show-horizontal-scrollbar="true"/);
  assert.match(html, /data-show-vertical-scrollbar="false"/);
  assert.match(html, /overflow-x: auto;overflow-y: hidden;/);
  assert.match(html, /data-table-background-color="#102030"/);
  assert.match(html, /data-table-foreground-color="#E0D0C0"/);
  assert.match(html, /data-use-alternating-row-colors="true"/);
  assert.match(html, /data-alternating-row-background-color="#123456"/);
  assert.match(html, /data-alternating-row-foreground-color="#ABCDEF"/);
  assert.match(html, /data-table-header-background-color="#E3E3E3"/);
  assert.match(html, /data-table-header-foreground-color="#010203"/);
  assert.match(html, /data-table-header-horizontal-alignment="Center"/);
  assert.match(html, /data-table-header-border-color="#667788"/);
  assert.match(html, /data-selection-background-color="#708090"/);
  assert.match(html, /data-selection-foreground-color="#F1F2F3"/);
  assert.match(html, /data-selection-rectangle-mode="2"/);
  assert.match(html, /data-use-automatic-selection-rectangle-color="false"/);
  assert.match(html, /data-selection-rectangle-color="#0A0B0C"/);
  assert.match(html, /data-selection-rectangle-width="2"/);
  assert.match(html, /data-show-status-bar="true"/);
  assert.match(html, /data-status-bar-background-color="#213243"/);
  assert.match(html, /data-status-bar-foreground-color="#FEDCBA"/);
  assert.match(html, /--hmi-grid-line-color: #445566;/);
  assert.match(html, /class="hmi-alarm-table hmi-alarm-table--alternating" style="width: 100%; border-collapse: collapse; table-layout: fixed;background-color: #102030;color: #E0D0C0;--hmi-alarm-alternating-row-background: #123456;--hmi-alarm-alternating-row-foreground: #ABCDEF;/);
  assert.match(html, /\.hmi-alarm-table--alternating tbody tr:nth-child\(even\)>td\{background-color:var\(--hmi-alarm-alternating-row-background,inherit\);color:var\(--hmi-alarm-alternating-row-foreground,inherit\);/);
  assert.match(html, /border-style: solid; border-color: var\(--hmi-grid-line-color, currentColor\); border-width: 0px 2px;/);
  assert.match(html, /background-color: #708090;color: #F1F2F3;outline: 2px solid #0A0B0C;outline-offset: -2px;/);
  assert.match(html, /font-family: Arial;font-size: 9.75px;font-weight: 400;/);
  assert.match(html, /font-family: Siemens Sans;font-size: 10px;font-weight: 700;font-style: italic;text-decoration: underline line-through;/);
  assert.match(html, /background-color: #E3E3E3;color: #010203;border-bottom-color: #667788;/);
  assert.match(html, /background-color: #E3E3E3;color: #010203;text-align: center;border-color: #667788;border-width: 3px;font-family: Siemens Sans;/);
  assert.match(html, /resize: both;/);
  assert.match(html, /cursor: move;/);
  assert.match(html, /aria-label="Close" disabled/);
  assert.match(html, /data-number-of-rows="8"/);
  assert.match(html, /data-show-waiting-message="true"/);
  assert.match(html, /data-show-out-of-scope-alarms="false"/);
  assert.match(html, /data-filtered-triggers="Motor\*"/);
  assert.match(html, />Active process alarms<\/span>/);
  assert.match(html, /data-column-type="AlarmTime" data-time-format="HH:mm:ss">Time<\/th>/);
  assert.match(html, /data-column-type="Message">Message<\/th>/);
  assert.doesNotMatch(html, /data-column-type="AlarmState"/);
  assert.match(html, />Alarm data not loaded<\/td>/);
  assert.match(html, /class="hmi-alarm-toolbar" role="toolbar" style="flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;background-color: #443322;color: #FAFBFC;">Acknowledge · Help<\/div>/);
  assert.match(html, /class="hmi-alarm-status-bar" role="status" style="flex: 0 0 auto; border-top: 1px solid currentColor; padding: 2px 4px;background-color: #213243;color: #FEDCBA;font-family: Tahoma;font-size: 8px;font-weight: 600;font-style: italic;">Status<\/div>/);
  assert.match(html, /<div id="AlarmBanner"/);
  assert.match(html, /data-view-kind="AlarmBanner"/);
  assert.match(html, /data-queue-new-alarms="true"/);
  assert.match(html, /data-show-alarm-state="true"/);
  assert.match(html, /data-show-alarm-time="true" data-time-format="HH:mm"/);
  assert.match(html, />Alarm data not loaded<\/div>/);
});

test("HTML converter does not render disabled alternating alarm rows", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const alarms = new HmiAlarmControl();
  alarms.name = "Alarms";
  alarms.width = staticProperty(300);
  alarms.height = staticProperty(160);
  alarms.useAlternatingRowColors = staticProperty(false);
  alarms.alternatingRowBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  layer.items.push(alarms);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-use-alternating-row-colors="false"/);
  assert.match(html, /class="hmi-alarm-table"/);
  assert.doesNotMatch(html, /class="hmi-alarm-table hmi-alarm-table--alternating"/);
});

test("HTML converter renders inert opaque host control previews", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const ocx = new HmiOcxControl();
  ocx.name = "LegacyTrend";
  ocx.width = staticProperty(300);
  ocx.height = staticProperty(120);
  ocx.ocxGuid = "{11111111-2222-3333-4444-555555555555}";
  ocx.ocxName = "Legacy Trend Control";
  ocx.ocxProgramId = "Vendor.Trend.1";
  ocx.ocxFileName = "trend.ocx";
  ocx.ocxFileVersion = "1.2.3";
  ocx.ocxStateFormat = "binary";
  ocx.ocxState = new Uint8Array([1, 2, 3, 4]);
  layer.items.push(ocx);
  const managed = new HmiDotNetControlContainer();
  managed.name = "ManagedControl";
  managed.y = staticProperty(130);
  managed.width = staticProperty(300);
  managed.height = staticProperty(80);
  layer.items.push(managed);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="LegacyTrend"/);
  assert.match(html, /data-ocx-guid="{11111111-2222-3333-4444-555555555555}"/);
  assert.match(html, /data-ocx-program-id="Vendor\.Trend\.1"/);
  assert.match(html, /data-ocx-file-name="trend\.ocx"/);
  assert.match(html, /data-ocx-file-version="1\.2\.3"/);
  assert.match(html, /data-state-format="binary" data-state-length="4"/);
  assert.match(html, />ActiveX control<\/div>/);
  assert.match(html, />Legacy Trend Control<\/div>/);
  assert.match(html, /<div id="ManagedControl"/);
  assert.match(html, />\.NET control<\/div>/);
  assert.match(html, />Metadata preserved<\/div>/);
  assert.doesNotMatch(html, /<object/);
  assert.doesNotMatch(html, /<embed/);
});

test("HTML converter renders an empty custom widget preview", async () => {
  const screen = new HmiScreen();
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const widget = new HmiCustomWidgetContainer();
  widget.name = "External application";
  widget.width = staticProperty(200);
  widget.height = staticProperty(80);
  const layer = new HmiLayer();
  layer.name = "Layer 1";
  layer.items.push(widget);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="External application"/);
  assert.match(html, /data-hmi-custom-widget-type="HmiCustomWidgetContainer"/);
  assert.match(html, /<span aria-hidden="true">External application<\/span>/);
});

test("HTML converter renders hosted application window chrome", async () => {
  const screen = new HmiScreen();
  screen.name = "Main";
  const layer = new HmiLayer();
  layer.name = "Default";
  const window = new HmiCustomWidgetContainer();
  window.name = "Diagnostics";
  window.width = staticProperty(320);
  window.height = staticProperty(180);
  window.resizable = staticProperty(true);
  window.movable = staticProperty(true);
  window.showWindowBorder = staticProperty(true);
  window.showCaption = staticProperty(true);
  window.showMaximizeButton = staticProperty(true);
  window.showCloseButton = staticProperty(true);
  window.alwaysOnTop = staticProperty(true);
  window.hostedApplication = staticProperty("Global Script");
  window.hostedTemplate = staticProperty("GSC Diagnostics");
  layer.items.push(window);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /data-window-resizable data-window-movable data-window-border data-window-caption data-window-maximize data-window-close data-window-always-on-top/);
  assert.match(html, /data-hosted-application="Global Script" data-hosted-template="GSC Diagnostics"/);
  assert.match(html, /border: 1px solid #6b7280;resize: both;z-index: 2147483647;/);
  assert.match(html, /class="hmi-hosted-window-caption"/);
  assert.match(html, /cursor: move;/);
  assert.match(html, /aria-label="Maximize"/);
  assert.match(html, /aria-label="Close"/);
  assert.match(html, /GSC Diagnostics/);
});

test("HTML converter exposes trend configuration to the web component", async () => {
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(400);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.name = "Default";
  const trend = new HmiTrendControl();
  trend.name = "ProcessTrend";
  trend.width = staticProperty(320);
  trend.height = staticProperty(180);
  trend.chartTitle = "Pressure & temperature";
  trend.displayChartTitle = staticProperty(true);
  trend.resizable = staticProperty(true);
  trend.movable = staticProperty(false);
  trend.closeable = staticProperty(false);
  trend.contentFont = new HmiFont();
  trend.contentFont.name = staticProperty("Arial");
  trend.contentFont.size = staticProperty(9);
  trend.contentFont.weight = staticProperty(400);
  trend.headerFont = new HmiFont();
  trend.headerFont.name = staticProperty("Siemens Sans");
  trend.headerFont.size = staticProperty(11);
  trend.headerFont.weight = staticProperty(700);
  trend.headerFont.italic = staticProperty(true);
  trend.showToolbar = staticProperty(true);
  trend.toolbarAlignment = staticProperty(HmiVerticalAlignment.Bottom);
  trend.useToolbarBackgroundColor = staticProperty(true);
  trend.toolbarBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x44, 0x33, 0x22));
  trend.toolbarButtonSize = staticProperty(42);
  trend.showStatusBar = staticProperty(true);
  trend.useStatusBarBackgroundColor = staticProperty(true);
  trend.statusBarBackgroundColor = staticProperty(hmiColorFromArgb(255, 16, 32, 48));
  trend.statusBarForegroundColor = staticProperty(hmiColorFromArgb(255, 224, 208, 192));
  trend.statusBarFont = new HmiFont();
  trend.statusBarFont.name = staticProperty("Tahoma");
  trend.statusBarFont.size = staticProperty(8);
  trend.statusBarFont.weight = staticProperty(600);
  trend.statusBarFont.italic = staticProperty(true);
  trend.displayPenIcons = staticProperty(true);
  trend.useTrendNameAsLabel = staticProperty(false);
  trend.displayValueBar = staticProperty(true);
  trend.displayMilliseconds = staticProperty(true);
  trend.xAxisInTrendColor = staticProperty(true);
  trend.yAxisInTrendColor = staticProperty(false);
  trend.useGraphicValueBar = staticProperty(true);
  trend.valueBarColor = staticProperty(hmiColorFromArgb(255, 0x65, 0x43, 0x21));
  trend.valueBarWidth = staticProperty(3);
  trend.showValueBarInXAxis = staticProperty(true);
  trend.displayStatisticRulers = staticProperty(true);
  trend.useGraphicStatisticRulers = staticProperty(true);
  trend.statisticRulerColor = staticProperty(hmiColorFromArgb(255, 0x22, 0xaa, 0x66));
  trend.statisticRulerWidth = staticProperty(4);
  trend.displayScrollMechanism = staticProperty(true);
  trend.chartLiveMode = staticProperty(true);
  trend.autoScale = staticProperty(false);
  trend.xAxisScaleVisible = staticProperty(true);
  trend.xAxisColor = staticProperty(hmiColorFromArgb(255, 0x11, 0x22, 0x33));
  trend.xAxisAlignment = staticProperty(HmiVerticalAlignment.Top);
  trend.xAxisLabel = "Recorded time";
  trend.xAxisDateVisible = staticProperty(false);
  trend.xAxisDateFormat = staticProperty("dd.MMM.yyyy");
  trend.windowBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  trend.xAxisFlipped = staticProperty(true);
  trend.timeFormat = staticProperty(HmiTrendTimeFormat.TwentyFourHour);
  trend.xAxisTimeSpan = staticProperty(120000);
  trend.xAxisTimeSpanUnit = "Milliseconds";
  trend.xAxisGridVisible = staticProperty(true);
  trend.majorGridVisible = staticProperty(true);
  trend.majorGridColor = staticProperty(hmiColorFromArgb(255, 0x20, 0x40, 0x60));
  trend.minorGridVisible = staticProperty(false);
  trend.minorGridColor = staticProperty(hmiColorFromArgb(255, 0x80, 0x90, 0xa0));
  trend.gridInTrendColor = staticProperty(true);
  trend.yAxisScaleVisible = staticProperty(true);
  trend.yAxisColor = staticProperty(hmiColorFromArgb(255, 0x44, 0x55, 0x66));
  trend.yAxisAlignment = staticProperty(HmiHorizontalAlignment.Right);
  trend.yAxisLabel = "Pressure (bar)";
  trend.yAxisGridVisible = staticProperty(false);
  trend.showPercentageAxis = staticProperty(true);
  trend.percentageAxisColor = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  trend.percentageAxisAlignment = staticProperty(HmiHorizontalAlignment.Right);
  trend.minimumValue = staticProperty(-5);
  trend.maximumValue = staticProperty(100);
  trend.yAxisDecimalPlaces = staticProperty(2);
  const pen = new HmiTrendPen();
  pen.number = 1;
  pen.name = 'Pressure "A"';
  pen.label = "Vessel pressure";
  pen.color = staticProperty(hmiColorFromArgb(255, 17, 34, 51));
  pen.visible = staticProperty(true);
  pen.width = staticProperty(3);
  pen.lineType = staticProperty(HmiTrendLineType.Stepped);
  pen.style = staticProperty(HmiLineStyle.Dash);
  pen.fillVisible = staticProperty(true);
  pen.fillColor = staticProperty(hmiColorFromArgb(255, 0x33, 0x66, 0x99));
  pen.lowerLimitColoring = staticProperty(true);
  pen.lowerLimitValue = staticProperty(10);
  pen.lowerLimitColor = staticProperty(hmiColorFromArgb(255, 0x00, 0x44, 0xcc));
  pen.upperLimitColoring = staticProperty(true);
  pen.upperLimitValue = staticProperty(90);
  pen.upperLimitColor = staticProperty(hmiColorFromArgb(255, 0xcc, 0x22, 0x11));
  pen.uncertainColoring = staticProperty(true);
  pen.uncertainColor = staticProperty(hmiColorFromArgb(255, 0x88, 0x44, 0xcc));
  pen.showAlarms = staticProperty(true);
  pen.valueAlignment = staticProperty(HmiVerticalAlignment.Bottom);
  pen.marker = staticProperty("2");
  pen.markerColor = staticProperty(hmiColorFromArgb(255, 0xaa, 0xbb, 0xcc));
  pen.markerSize = staticProperty(5);
  pen.minimumValue = staticProperty(0);
  pen.maximumValue = staticProperty(100);
  pen.axisScaleType = staticProperty(HmiTrendAxisScaleType.Logarithmic);
  pen.exponentialFormat = staticProperty(true);
  pen.autoDecimalPlaces = staticProperty(true);
  pen.engineeringUnit = "bar";
  trend.pens.push(pen);
  layer.items.push(trend);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<hmi-trend-control id="ProcessTrend"/);
  assert.match(html, /chart-title="Pressure &amp; temperature"/);
  assert.match(html, /display-chart-title="true"/);
  assert.match(html, /data-window-resizable="true"/);
  assert.match(html, /data-window-movable="false"/);
  assert.match(html, /data-window-closeable="false"/);
  assert.match(html, /resize: both;/);
  assert.match(html, /--hmi-trend-content-font-family: Arial;--hmi-trend-content-font-size: 9px;--hmi-trend-content-font-weight: 400;/);
  assert.match(html, /--hmi-trend-header-font-family: Siemens Sans;--hmi-trend-header-font-size: 11px;--hmi-trend-header-font-weight: 700;--hmi-trend-header-font-style: italic;/);
  assert.match(html, /show-toolbar="true"/);
  assert.match(html, /toolbar-alignment="Bottom"/);
  assert.match(html, /use-toolbar-background-color="true"/);
  assert.match(html, /toolbar-background-color="#443322"/);
  assert.match(html, /--hmi-trend-toolbar-background: #443322;/);
  assert.match(html, /toolbar-button-size="42"/);
  assert.match(html, /--hmi-trend-toolbar-button-size: 42px;/);
  assert.match(html, /show-status-bar="true"/);
  assert.match(html, /use-status-bar-background-color="true"/);
  assert.match(html, /--hmi-trend-status-background: #102030;/);
  assert.match(html, /--hmi-trend-status-foreground: #E0D0C0;/);
  assert.match(html, /--hmi-trend-status-font-family: Tahoma;--hmi-trend-status-font-size: 8px;--hmi-trend-status-font-weight: 600;--hmi-trend-status-font-style: italic;/);
  assert.match(html, /display-pen-icons="true"/);
  assert.match(html, /display-value-bar="true"/);
  assert.match(html, /display-milliseconds="true"/);
  assert.match(html, /x-axis-in-trend-color="true"/);
  assert.match(html, /y-axis-in-trend-color="false"/);
  assert.match(html, /use-graphic-value-bar="true"/);
  assert.match(html, /value-bar-color="#654321"/);
  assert.match(html, /value-bar-width="3"/);
  assert.match(html, /show-value-bar-in-x-axis="true"/);
  assert.match(html, /display-statistic-rulers="true"/);
  assert.match(html, /use-graphic-statistic-rulers="true"/);
  assert.match(html, /statistic-ruler-color="#22AA66"/);
  assert.match(html, /statistic-ruler-width="4"/);
  assert.match(html, /--hmi-trend-value-bar-color: #654321;/);
  assert.match(html, /--hmi-trend-value-bar-width: 3px;/);
  assert.match(html, /display-scroll-mechanism="true"/);
  assert.match(html, /chart-live-mode="true"/);
  assert.match(html, /auto-scale="false"/);
  assert.match(html, /x-axis-scale-visible="true"/);
  assert.match(html, /x-axis-color="#112233"/);
  assert.match(html, /--hmi-trend-x-axis-color: #112233;/);
  assert.match(html, /x-axis-alignment="Top"/);
  assert.match(html, /x-axis-label="Recorded time"/);
  assert.match(html, /x-axis-date-visible="false"/);
  assert.match(html, /x-axis-date-format="dd.MMM.yyyy"/);
  assert.match(html, /window-background-color="#123456"/);
  assert.match(html, /x-axis-time-span="120000"/);
  assert.match(html, /x-axis-time-span-unit="Milliseconds"/);
  assert.match(html, /x-axis-grid-visible="true"/);
  assert.match(html, /major-grid-visible="true"/);
  assert.match(html, /major-grid-color="#204060"/);
  assert.match(html, /minor-grid-visible="false"/);
  assert.match(html, /minor-grid-color="#8090A0"/);
  assert.match(html, /grid-in-trend-color="true"/);
  assert.match(html, /--hmi-trend-major-grid-color: #204060;/);
  assert.match(html, /--hmi-trend-minor-grid-color: #8090A0;/);
  assert.match(html, /y-axis-scale-visible="true"/);
  assert.match(html, /y-axis-color="#445566"/);
  assert.match(html, /--hmi-trend-y-axis-color: #445566;/);
  assert.match(html, /y-axis-alignment="Right"/);
  assert.match(html, /y-axis-label="Pressure \(bar\)"/);
  assert.match(html, /y-axis-grid-visible="false"/);
  assert.match(html, /show-percentage-axis="true"/);
  assert.match(html, /percentage-axis-color="#123456"/);
  assert.match(html, /percentage-axis-alignment="Right"/);
  assert.match(html, /--hmi-trend-percentage-axis-color: #123456;/);
  assert.match(html, /minimum-value="-5"/);
  assert.match(html, /maximum-value="100"/);
  assert.match(html, /y-axis-decimal-places="2"/);
  assert.match(html, /x-axis-flipped="true"/);
  assert.match(html, /time-format="TwentyFourHour"/);
  assert.match(html, /use-trend-name-as-label="false"/);
  assert.match(html, /pens="\[{&quot;number&quot;:1,&quot;name&quot;:&quot;Pressure \\&quot;A\\&quot;&quot;,&quot;label&quot;:&quot;Vessel pressure&quot;,&quot;color&quot;:&quot;#112233&quot;,&quot;visible&quot;:true,&quot;width&quot;:3,&quot;lineType&quot;:2,&quot;style&quot;:1,&quot;fill&quot;:true,&quot;fillColor&quot;:&quot;#336699&quot;,&quot;lowerLimitColoring&quot;:true,&quot;lowerLimit&quot;:10,&quot;lowerLimitColor&quot;:&quot;#0044CC&quot;,&quot;upperLimitColoring&quot;:true,&quot;upperLimit&quot;:90,&quot;upperLimitColor&quot;:&quot;#CC2211&quot;,&quot;uncertainColoring&quot;:true,&quot;uncertainColor&quot;:&quot;#8844CC&quot;,&quot;showAlarms&quot;:true,&quot;valueAlignment&quot;:&quot;Bottom&quot;,&quot;marker&quot;:&quot;2&quot;,&quot;markerColor&quot;:&quot;#AABBCC&quot;,&quot;markerSize&quot;:5,&quot;minimum&quot;:0,&quot;maximum&quot;:100,&quot;axisScaleType&quot;:1,&quot;exponentialFormat&quot;:true,&quot;autoDecimalPlaces&quot;:true,&quot;unit&quot;:&quot;bar&quot;}\]"/);
});

test("HTML converter exposes per-pen decimal precision", async () => {
  const screen = new HmiScreen();
  const layer = new HmiLayer();
  const trend = new HmiTrendControl();
  const timeAxis = new HmiTrendTimeAxis();
  trend.timeBase = staticProperty("Project");
  trend.projectTimeZoneId = "Europe/Berlin";
  timeAxis.name = "Time A";
  timeAxis.trendWindowName = "Time window";
  timeAxis.visible = staticProperty(false);
  timeAxis.showDate = staticProperty(true);
  timeAxis.dateFormat = staticProperty("yyyy/MM/dd");
  timeAxis.timeFormat = staticProperty(HmiTrendTimeFormat.TwentyFourHour);
  timeAxis.displayMilliseconds = staticProperty(true);
  timeAxis.timeSpan = staticProperty(120000);
  timeAxis.timeSpanUnit = "Milliseconds";
  timeAxis.alignment = staticProperty(HmiVerticalAlignment.Top);
  timeAxis.color = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  timeAxis.inTrendColor = staticProperty(false);
  timeAxis.label = "Recorded time";
  trend.timeAxes.push(timeAxis);
  const secondTimeAxis = new HmiTrendTimeAxis();
  secondTimeAxis.name = "Time B";
  secondTimeAxis.visible = staticProperty(true);
  secondTimeAxis.alignment = staticProperty(HmiVerticalAlignment.Bottom);
  secondTimeAxis.label = "Second time axis";
  secondTimeAxis.rangeType = staticProperty("StartEnd");
  secondTimeAxis.startTime = staticProperty("2018-07-19T08:51:13.000Z");
  secondTimeAxis.endTime = staticProperty("2018-07-19T08:52:13.000Z");
  secondTimeAxis.measurementPoints = staticProperty(120);
  secondTimeAxis.refreshEnabled = staticProperty(false);
  trend.timeAxes.push(secondTimeAxis);
  const thirdTimeAxis = new HmiTrendTimeAxis();
  thirdTimeAxis.name = "Time C";
  thirdTimeAxis.visible = staticProperty(true);
  thirdTimeAxis.alignment = staticProperty(HmiVerticalAlignment.Bottom);
  trend.timeAxes.push(thirdTimeAxis);
  const window = new HmiTrendWindow();
  window.name = "Window A";
  window.visible = staticProperty(false);
  window.spacePortion = staticProperty(3);
  window.xAxisGridVisible = staticProperty(false);
  window.majorGridColor = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  window.valueBarWidth = staticProperty(4);
  trend.trendWindows.push(window);
  const axis = new HmiTrendValueAxis();
  axis.name = "Unused";
  axis.label = "Standalone";
  axis.trendWindowName = "Axis window";
  axis.minimumValue = staticProperty(5);
  axis.maximumValue = staticProperty(15);
  axis.decimalPlaces = staticProperty(1);
  axis.visible = staticProperty(true);
  axis.alignment = staticProperty(HmiHorizontalAlignment.Left);
  trend.valueAxes.push(axis);
  const secondValueAxis = new HmiTrendValueAxis();
  secondValueAxis.name = "Second value";
  secondValueAxis.visible = staticProperty(true);
  secondValueAxis.alignment = staticProperty(HmiHorizontalAlignment.Left);
  trend.valueAxes.push(secondValueAxis);
  const pen = new HmiTrendPen();
  pen.number = 1;
  pen.decimalPlaces = staticProperty(4);
  pen.valueAxisName = "Axis A";
  pen.trendWindowName = "Pen window";
  pen.timeAxisName = "Time A";
  pen.valueAxisVisible = staticProperty(false);
  pen.valueAxisColor = staticProperty(hmiColorFromArgb(255, 0x12, 0x34, 0x56));
  pen.valueAxisInTrendColor = staticProperty(true);
  pen.valueAxisAlignment = staticProperty(HmiHorizontalAlignment.Right);
  pen.valueAxisLabel = "Pressure";
  trend.pens.push(pen);
  layer.items.push(trend);
  screen.layers.push(layer);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.match(html, /&quot;decimalPlaces&quot;:4/);
  assert.match(html, /value-axes="/);
  assert.match(html, /trend-windows="/);
  assert.match(html, /time-axes="/);
  assert.match(html, /&quot;dateFormat&quot;:&quot;yyyy\/MM\/dd&quot;/);
  assert.match(html, /&quot;timeSpan&quot;:120000/);
  assert.match(html, /&quot;spacePortion&quot;:3/);
  assert.match(html, /&quot;majorGridColor&quot;:&quot;#123456&quot;/);
  assert.match(html, /&quot;valueAxisName&quot;:&quot;Unused&quot;/);
  assert.match(html, /&quot;valueAxisLabel&quot;:&quot;Standalone&quot;/);
  assert.match(html, /&quot;trendWindowName&quot;:&quot;Axis window&quot;/);
  assert.match(html, /&quot;trendWindowName&quot;:&quot;Time window&quot;/);
  assert.match(html, /&quot;name&quot;:&quot;Time B&quot;/);
  assert.match(html, /&quot;label&quot;:&quot;Second time axis&quot;/);
  assert.match(html, /&quot;rangeType&quot;:&quot;StartEnd&quot;/);
  assert.match(html, /&quot;startTime&quot;:&quot;2018-07-19T08:51:13.000Z&quot;/);
  assert.match(html, /&quot;endTime&quot;:&quot;2018-07-19T08:52:13.000Z&quot;/);
  assert.match(html, /&quot;measurementPoints&quot;:120/);
  assert.match(html, /&quot;refreshEnabled&quot;:false/);
  assert.match(html, /time-base="Project"/);
  assert.match(html, /project-time-zone="Europe\/Berlin"/);
  assert.match(html, /&quot;name&quot;:&quot;Time A&quot;/);
  assert.match(html, /&quot;name&quot;:&quot;Time C&quot;/);
  assert.match(html, /&quot;valueAxisName&quot;:&quot;Second value&quot;/);
  assert.ok(html.indexOf("&quot;name&quot;:&quot;Time A&quot;") < html.indexOf("&quot;name&quot;:&quot;Time B&quot;"));
  assert.ok(html.indexOf("&quot;name&quot;:&quot;Time B&quot;") < html.indexOf("&quot;name&quot;:&quot;Time C&quot;"));
  assert.ok(html.indexOf("&quot;valueAxisName&quot;:&quot;Unused&quot;") < html.indexOf("&quot;valueAxisName&quot;:&quot;Second value&quot;"));
  assert.match(html, /&quot;trendWindowName&quot;:&quot;Pen window&quot;/);
  assert.match(html, /&quot;timeAxisName&quot;:&quot;Time A&quot;/);
  assert.match(html, /&quot;valueAxisName&quot;:&quot;Axis A&quot;/);
  assert.match(html, /&quot;valueAxisVisible&quot;:false/);
  assert.match(html, /&quot;valueAxisColor&quot;:&quot;#123456&quot;/);
  assert.match(html, /&quot;valueAxisInTrendColor&quot;:true/);
  assert.match(html, /&quot;valueAxisAlignment&quot;:&quot;Right&quot;/);
  assert.match(html, /&quot;valueAxisLabel&quot;:&quot;Pressure&quot;/);
});

test("HTML converter does not render disabled trend status backgrounds", async () => {
  const screen = new HmiScreen();
  screen.name = "Main";
  screen.width = staticProperty(400);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.name = "Default";
  const trend = new HmiTrendControl();
  trend.name = "Trend";
  trend.width = staticProperty(320);
  trend.height = staticProperty(180);
  trend.showStatusBar = staticProperty(true);
  trend.useStatusBarBackgroundColor = staticProperty(false);
  trend.statusBarBackgroundColor = staticProperty(hmiColorFromArgb(255, 0x10, 0x20, 0x30));
  layer.items.push(trend);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /use-status-bar-background-color="false"/);
  assert.doesNotMatch(html, /--hmi-trend-status-background:/);
});

test("HTML converter renders an inert radar chart preview", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(320);
  screen.height = staticProperty(240);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";
  const radar = new HmiRadarChartControl();
  radar.name = "ProcessRadar";
  radar.width = staticProperty(300);
  radar.height = staticProperty(180);
  radar.title = HmiMultilingualText.fromText("Process overview");
  radar.seriesCount = staticProperty(3);
  radar.categoryCount = staticProperty(8);
  radar.radarShape = staticProperty(HmiRadarShape.Polygon);
  radar.sourceRadarShape = "Polygon";
  radar.chartBackgroundColor = staticProperty(hmiColorFromArgb(255, 17, 34, 51));
  radar.gridLineStyle = staticProperty(HmiLineStyle.Dash);
  radar.sourceGridLineStyle = "Dash";
  radar.gridLineColor = staticProperty(hmiColorFromArgb(255, 68, 85, 102));
  radar.bandedColor = staticProperty(hmiColorFromArgb(255, 119, 136, 153));
  radar.showLegend = staticProperty(true);
  radar.legendPosition = staticProperty(HmiRadarLegendPosition.Right);
  radar.sourceLegendPosition = "Right";
  radar.decimalPlaces = staticProperty(2);
  radar.refreshRateSeconds = staticProperty(1.5);
  layer.items.push(radar);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="ProcessRadar"/);
  assert.match(html, /data-series-count="3" data-category-count="8"/);
  assert.match(html, /data-radar-shape="Polygon"/);
  assert.match(html, /data-chart-background="#112233"/);
  assert.match(html, /data-grid-line-style="Dash"/);
  assert.match(html, /data-grid-line-color="#445566"/);
  assert.match(html, /data-banded-color="#778899"/);
  assert.match(html, /data-show-legend="true"/);
  assert.match(html, /data-legend-position="Right"/);
  assert.match(html, /data-decimal-places="2"/);
  assert.match(html, /data-refresh-rate-seconds="1.5"/);
  assert.match(html, />Process overview<\/div>/);
  assert.match(html, />Radar data not loaded \(Series: 3 · Categories: 8\)<\/div>/);
  assert.doesNotMatch(html, /<canvas/);
});

test("HTML converter renders inert system diagnosis previews", async () => {
  const screen = new HmiScreen();
  screen.id = "main";
  screen.name = "MainScreen";
  screen.width = staticProperty(640);
  screen.height = staticProperty(480);
  const layer = new HmiLayer();
  layer.id = "layer-1";
  layer.name = "Layer 1";

  for (const [name, y, viewKind] of [
    ["MeDiagnostics", 0, HmiSystemDiagnosisViewKind.DiagnosticsList],
    ["SeDiagnostics", 110, HmiSystemDiagnosisViewKind.DiagnosticsViewer],
    ["AutomaticSummary", 220, HmiSystemDiagnosisViewKind.AutomaticEventSummary],
  ]) {
    const diagnostics = new HmiSystemDiagnosisControl();
    diagnostics.name = name;
    diagnostics.y = staticProperty(y);
    diagnostics.width = staticProperty(300);
    diagnostics.height = staticProperty(100);
    diagnostics.viewKind = viewKind;
    layer.items.push(diagnostics);
  }
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="MeDiagnostics"/);
  assert.match(html, /data-view-kind="DiagnosticsList"/);
  assert.match(html, />Diagnostics list<\/div>/);
  assert.match(html, /<div id="SeDiagnostics"/);
  assert.match(html, /data-view-kind="DiagnosticsViewer"/);
  assert.match(html, />Diagnostics viewer<\/div>/);
  assert.match(html, /<div id="AutomaticSummary"/);
  assert.match(html, /data-view-kind="AutomaticEventSummary"/);
  assert.match(html, />Automatic diagnostic event summary<\/div>/);
  assert.equal((html.match(/>Diagnostic data not loaded<\/div>/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<button/);
});
