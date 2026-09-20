import assert from "node:assert/strict";
import test from "node:test";

import {
  HmiButton,
  HmiBlinkRate,
  HmiChildCoordinateSpace,
  HmiCircle,
  HmiDynamicSvg,
  HmiDynamicSvgProperty,
  HmiFillAnimation,
  HmiFillDirection,
  HmiFillPattern,
  HmiGradientDirection,
  HmiDisabledImageMode,
  HmiGroup,
  HmiImage,
  HmiImageSourceKind,
  HmiImageType,
  HmiIOField,
  HmiLayer,
  HmiLine,
  HmiLineCap,
  HmiLineMarker,
  HmiLineStyle,
  HmiPolyline,
  HmiMultilingualText,
  HmiPropertyKind,
  HmiRectangle,
  HmiReferenceObjectSettings,
  HmiScreen,
  HmiScreenToHtmlConverter,
  HmiScreenWindow,
  HmiState,
  HmiSymbolicIOField,
  HmiTagTriggerMode,
  HmiText,
  HmiTriggerKind,
  blinkProperty,
  expressionProperty,
  hmiColorFromArgb,
  inspectHmiProperties,
  staticProperty,
  tagProperty,
} from "../dist/index.js";

test("HTML conversion renders SVG line dash styles", async () => {
  const line = new HmiLine();
  line.name = "PipeLine";
  line.width = staticProperty(100);
  line.height = staticProperty(40);
  line.x2 = staticProperty(100);
  line.y2 = staticProperty(40);
  line.lineColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
  line.lineWidth = staticProperty(3);
  line.dashType = staticProperty(HmiLineStyle.DashDot);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(line);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /stroke="#FF0000"/);
  assert.match(html, /stroke-width="3"/);
  assert.match(html, /stroke-dasharray="6 3 1 3"/);
  assert.match(html, /stroke-linecap="round"/);
});

test("HTML conversion renders SVG line caps", async () => {
  const line = new HmiLine();
  line.name = "SquareLine";
  line.width = staticProperty(100);
  line.height = staticProperty(20);
  line.x1 = staticProperty(0);
  line.y1 = staticProperty(10);
  line.x2 = staticProperty(100);
  line.y2 = staticProperty(10);
  line.lineCap = staticProperty(HmiLineCap.Square);
  const polyline = new HmiPolyline();
  polyline.name = "RoundedPolyline";
  polyline.width = staticProperty(100);
  polyline.height = staticProperty(20);
  polyline.lineCap = staticProperty(HmiLineCap.Round);
  polyline.points.push({ x: 0, y: 10 }, { x: 100, y: 10 });
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(line, polyline);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="SquareLine"[^>]*><line[^>]*stroke-linecap="square"/);
  assert.match(html, /id="RoundedPolyline"[^>]*><polyline[^>]*stroke-linecap="round"/);
});

test("HTML conversion renders SVG line markers", async () => {
  const line = new HmiLine();
  line.name = "FlowLine";
  line.width = staticProperty(100);
  line.height = staticProperty(20);
  line.x1 = staticProperty(0);
  line.y1 = staticProperty(10);
  line.x2 = staticProperty(100);
  line.y2 = staticProperty(10);
  line.lineColor = staticProperty(hmiColorFromArgb(255, 0, 64, 128));
  line.startMarker = staticProperty(HmiLineMarker.Arrow);
  line.endMarker = staticProperty(HmiLineMarker.FilledCircle);
  const polyline = new HmiPolyline();
  polyline.name = "ReturnLine";
  polyline.width = staticProperty(100);
  polyline.height = staticProperty(20);
  polyline.startMarker = staticProperty(HmiLineMarker.FilledArrowReversed);
  polyline.endMarker = staticProperty(HmiLineMarker.Line);
  polyline.points.push({ x: 0, y: 10 }, { x: 100, y: 10 });
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(line, polyline);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /marker-start="url\(#hmi-marker-start-FlowLine\)"/);
  assert.match(html, /marker-end="url\(#hmi-marker-end-FlowLine\)"/);
  assert.match(html, /<marker id="hmi-marker-start-FlowLine"/);
  assert.match(html, /d="M0 0L10 5L0 10" fill="none" stroke="#004080"/);
  assert.match(html, /<marker id="hmi-marker-end-FlowLine"/);
  assert.match(html, /<circle cx="5" cy="5" r="4" fill="#004080" stroke="#004080"/);
  assert.match(html, /d="M10 0L0 5L10 10Z"/);
  assert.match(html, /d="M5 0V10"/);
});

test("HTML conversion keeps screen-absolute group children at their source position", async () => {
  const group = new HmiGroup();
  group.name = "PumpGroup";
  group.x = staticProperty(100);
  group.y = staticProperty(50);
  group.width = staticProperty(80);
  group.height = staticProperty(40);
  group.childCoordinateSpace = HmiChildCoordinateSpace.ScreenAbsolute;
  const child = createRectangle("PumpBody");
  child.x = staticProperty(110);
  child.y = staticProperty(70);
  group.items.push(child);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(group);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /id="PumpGroup" style="position: absolute;left: 100px;top: 50px;width: 80px;height: 40px;/);
  assert.match(html, /id="PumpBody" style="position: absolute;left: 10px;top: 20px;width: 100px;height: 50px;/);
});

test("HTML conversion renders rectangle corner radii", async () => {
  const rectangle = createRectangle("RoundedFrame");
  rectangle.topLeftRadius = staticProperty({ x: 10, y: 5 });
  rectangle.topRightRadius = staticProperty({ x: 20, y: 6 });
  rectangle.bottomRightRadius = staticProperty({ x: 30, y: 7 });
  rectangle.bottomLeftRadius = staticProperty({ x: 40, y: 8 });
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(rectangle);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /border-radius: 10px 20px 30px 40px \/ 5px 6px 7px 8px;/);
});

test("HTML conversion renders painted shape border styles", async () => {
  const rectangle = createRectangle("DottedFrame");
  rectangle.borderWidth = staticProperty(3);
  rectangle.borderStyle = staticProperty(HmiLineStyle.Dot);
  rectangle.dashType = staticProperty(HmiLineStyle.Dot);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(rectangle);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /border-style: dotted;/);
  assert.match(html, /border-width: 3px;/);
});

test("HTML conversion renders painted item foreground flashing", async () => {
  const text = new HmiText();
  text.name = "FlashingText";
  text.text = staticProperty(HmiMultilingualText.fromText("Alarm"));
  text.foregroundColor = blinkProperty(
    hmiColorFromArgb(255, 1, 2, 3),
    hmiColorFromArgb(255, 4, 5, 6),
    HmiBlinkRate.Fast,
  );
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(text);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /--hmi-foreground-color-off: #010203;/);
  assert.match(html, /--hmi-foreground-color-on: #040506;/);
  assert.match(html, /animation: hmi-foreground-color-flash 0.5s steps\(1, end\) infinite;/);
  assert.match(html, /@keyframes hmi-foreground-color-flash/);
});

test("HTML conversion renders painted item background flashing", async () => {
  const rectangle = createRectangle("FlashingRectangle");
  rectangle.backgroundColor = blinkProperty(
    hmiColorFromArgb(255, 10, 20, 30),
    hmiColorFromArgb(255, 40, 50, 60),
    HmiBlinkRate.Slow,
  );
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(rectangle);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /--hmi-background-color-off: #0A141E;/);
  assert.match(html, /--hmi-background-color-on: #28323C;/);
  assert.match(html, /animation: hmi-background-color-flash 2s steps\(1, end\) infinite;/);
  assert.match(html, /@keyframes hmi-background-color-flash/);
});

test("HTML conversion renders SVG border flashing", async () => {
  const circle = new HmiCircle();
  circle.name = "FlashingBorder";
  circle.width = staticProperty(100);
  circle.height = staticProperty(40);
  circle.borderColor = blinkProperty(
    hmiColorFromArgb(255, 1, 2, 3),
    hmiColorFromArgb(255, 4, 5, 6),
    HmiBlinkRate.Fast,
  );
  circle.borderWidth = staticProperty(2);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(circle);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /stroke="#010203"/);
  assert.match(html, /--hmi-border-color-off: #010203;/);
  assert.match(html, /--hmi-border-color-on: #040506;/);
  assert.match(html, /animation: hmi-border-color-flash 0.5s steps\(1, end\) infinite;/);
  assert.match(html, /@keyframes hmi-border-color-flash/);
});

test("HTML conversion renders SVG fill flashing", async () => {
  const circle = new HmiCircle();
  circle.name = "FlashingFill";
  circle.width = staticProperty(100);
  circle.height = staticProperty(40);
  circle.backgroundColor = blinkProperty(
    hmiColorFromArgb(255, 10, 20, 30),
    hmiColorFromArgb(255, 40, 50, 60),
    HmiBlinkRate.Slow,
  );
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(circle);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /fill="#0A141E"/);
  assert.match(html, /--hmi-background-color-off: #0A141E;/);
  assert.match(html, /--hmi-background-color-on: #28323C;/);
  assert.match(html, /animation: hmi-background-color-flash 2s steps\(1, end\) infinite;/);
});

test("HTML conversion renders shape fill animation previews", async () => {
  const rectangle = createRectangle("Tank");
  rectangle.id = "tank";
  rectangle.backgroundColor = staticProperty(hmiColorFromArgb(255, 0, 128, 255));
  rectangle.fillAnimation = Object.assign(new HmiFillAnimation(), {
    expression: "Tank.Level",
    expressionFallback: 35,
    expressionMinimum: 0,
    expressionMaximum: 100,
    fillMinimum: 0,
    fillMaximum: 100,
    direction: HmiFillDirection.Right,
  });
  const circle = new HmiCircle();
  circle.id = "level";
  circle.name = "Level";
  circle.width = staticProperty(50);
  circle.height = staticProperty(50);
  circle.backgroundColor = staticProperty(hmiColorFromArgb(255, 0, 200, 0));
  circle.fillAnimation = Object.assign(new HmiFillAnimation(), {
    expressionFallback: 60,
    direction: HmiFillDirection.Up,
  });
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(rectangle, circle);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /background-image: linear-gradient\(to right, #0080FF 0%, #0080FF 35%, transparent 35%, transparent 100%\);/);
  assert.match(html, /fill="url\(#hmi-fill-Level\)"/);
  assert.match(html, /<linearGradient id="hmi-fill-Level" x1="0%" y1="100%" x2="0%" y2="0%"/);
  assert.match(html, /<stop offset="60%" stop-color="#00C800"/);
});

test("HTML conversion renders shape fill patterns", async () => {
  const rectangle = createRectangle("CheckedTank");
  rectangle.backgroundColor = staticProperty(hmiColorFromArgb(255, 255, 255, 255));
  rectangle.patternColor = staticProperty(hmiColorFromArgb(255, 0, 0, 0));
  rectangle.fillPattern = staticProperty(HmiFillPattern.Checkers);
  const circle = new HmiCircle();
  circle.name = "StripedLevel";
  circle.width = staticProperty(50);
  circle.height = staticProperty(50);
  circle.backgroundColor = staticProperty(hmiColorFromArgb(255, 255, 255, 255));
  circle.patternColor = staticProperty(hmiColorFromArgb(255, 0, 128, 255));
  circle.fillPattern = staticProperty(HmiFillPattern.Horizontal);
  const button = new HmiButton();
  button.name = "CheckedButton";
  button.width = staticProperty(80);
  button.height = staticProperty(30);
  button.backgroundColor = staticProperty(hmiColorFromArgb(255, 255, 255, 255));
  button.patternColor = staticProperty(hmiColorFromArgb(255, 255, 0, 0));
  button.fillPattern = staticProperty(HmiFillPattern.Checkers);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(rectangle, circle, button);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /background-image: conic-gradient\(#000000 25%, transparent 0 50%, #000000 0 75%, transparent 0\);/);
  assert.match(html, /fill="url\(#hmi-pattern-StripedLevel\)"/);
  assert.match(html, /<pattern id="hmi-pattern-StripedLevel" patternUnits="userSpaceOnUse"/);
  assert.match(html, /stroke="#0080FF"/);
  assert.match(html, /background-image: conic-gradient\(#FF0000 25%, transparent 0 50%, #FF0000 0 75%, transparent 0\);/);
});

test("HTML conversion renders screen fill patterns", async () => {
  const screen = createScreen("main", "Main");
  screen.width = staticProperty(320);
  screen.height = staticProperty(200);
  screen.backgroundColor = staticProperty(hmiColorFromArgb(255, 255, 255, 255));
  screen.patternColor = staticProperty(hmiColorFromArgb(255, 0, 64, 128));
  screen.fillPattern = staticProperty(HmiFillPattern.Checkers);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /background-color: #FFFFFF;/);
  assert.match(html, /background-image: conic-gradient\(#004080 25%, transparent 0 50%, #004080 0 75%, transparent 0\);/);
  assert.match(html, /background-size: 8px 8px;/);
});

test("HTML conversion renders configured color gradients", async () => {
  const screen = createScreen("main", "GradientScreen");
  screen.width = staticProperty(320);
  screen.height = staticProperty(200);
  screen.backgroundColor = staticProperty(hmiColorFromArgb(255, 34, 34, 34));
  screen.firstGradientColor = staticProperty(hmiColorFromArgb(255, 17, 17, 17));
  screen.firstGradientOffset = staticProperty(25);
  screen.middleGradientColor = staticProperty(hmiColorFromArgb(255, 34, 34, 34));
  screen.secondGradientColor = staticProperty(hmiColorFromArgb(255, 51, 51, 51));
  screen.secondGradientOffset = staticProperty(75);
  screen.useFirstGradient = staticProperty(true);
  screen.useSecondGradient = staticProperty(true);
  screen.gradientDirection = staticProperty(HmiGradientDirection.VerticalFromTop);

  const rectangle = createRectangle("GradientRectangle");
  rectangle.backgroundColor = staticProperty(hmiColorFromArgb(255, 0, 128, 0));
  rectangle.firstGradientColor = staticProperty(hmiColorFromArgb(255, 0, 255, 0));
  rectangle.firstGradientOffset = staticProperty(40);
  rectangle.useFirstGradient = staticProperty(true);
  rectangle.gradientDirection = staticProperty(HmiGradientDirection.HorizontalFromRight);

  const circle = new HmiCircle();
  circle.name = "GradientCircle";
  circle.width = staticProperty(50);
  circle.height = staticProperty(50);
  circle.backgroundColor = staticProperty(hmiColorFromArgb(255, 0, 0, 128));
  circle.secondGradientColor = staticProperty(hmiColorFromArgb(255, 0, 128, 255));
  circle.secondGradientOffset = staticProperty(60);
  circle.useSecondGradient = staticProperty(true);
  circle.gradientDirection = staticProperty(HmiGradientDirection.DiagonalUp);

  const button = new HmiButton();
  button.name = "GradientButton";
  button.width = staticProperty(80);
  button.height = staticProperty(30);
  button.backgroundColor = staticProperty(hmiColorFromArgb(255, 128, 0, 0));
  button.secondGradientColor = staticProperty(hmiColorFromArgb(255, 255, 128, 0));
  button.secondGradientOffset = staticProperty(30);
  button.useSecondGradient = staticProperty(true);
  screen.layers[0].items.push(rectangle, circle, button);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /background-image: linear-gradient\(to bottom, #111111 0%, #222222 25%, #222222 75%, #333333 100%\);/);
  assert.match(html, /background-image: linear-gradient\(to left, #00FF00 0%, #008000 40%, #008000 100%\);/);
  assert.match(html, /fill="url\(#hmi-color-gradient-GradientCircle\)"/);
  assert.match(html, /<linearGradient id="hmi-color-gradient-GradientCircle" x1="0%" y1="100%" x2="100%" y2="0%"/);
  assert.match(html, /<stop offset="60%" stop-color="#000080"/);
  assert.match(html, /background-image: linear-gradient\(to right, #800000 0%, #800000 30%, #FF8000 100%\);/);
});

test("HTML conversion serializes dynamic SVG colors in HMI format", async () => {
  const dynamicSvg = new HmiDynamicSvg();
  dynamicSvg.name = "Valve";
  dynamicSvg.width = staticProperty(32);
  dynamicSvg.height = staticProperty(32);
  const fillColor = new HmiDynamicSvgProperty();
  fillColor.name = "FillColor";
  fillColor.value = staticProperty(hmiColorFromArgb(255, 0, 128, 255));
  dynamicSvg.properties.push(fillColor);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(dynamicSvg);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /fill-color="0xFF0080FF"/);
});

test("HTML conversion renders symbolic IO field states", async () => {
  const symbolicIoField = new HmiSymbolicIOField();
  symbolicIoField.name = "MotorState";
  symbolicIoField.x = staticProperty(10);
  symbolicIoField.y = staticProperty(20);
  symbolicIoField.width = staticProperty(120);
  symbolicIoField.height = staticProperty(30);
  symbolicIoField.value = staticProperty(2);
  const stopped = new HmiState();
  stopped.name = "Stopped";
  stopped.value = 0;
  stopped.text = HmiMultilingualText.fromText("Stopped");
  stopped.backgroundColor = hmiColorFromArgb(255, 100, 0, 0);
  stopped.foregroundColor = hmiColorFromArgb(255, 255, 255, 255);
  symbolicIoField.states.push(stopped);
  const running = new HmiState();
  running.name = "Running";
  running.value = 2;
  running.text = HmiMultilingualText.fromText("Running");
  running.backgroundColor = hmiColorFromArgb(255, 0, 100, 0);
  running.captionColor = hmiColorFromArgb(255, 240, 241, 242);
  running.borderColor = hmiColorFromArgb(255, 50, 51, 52);
  symbolicIoField.states.push(running);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(symbolicIoField);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<select id="MotorState"/);
  assert.match(html, /background-color: #006400;color: #F0F1F2;border-color: #323334;/);
  assert.match(html, /<option value="0" style="background-color: #640000;color: #FFFFFF;">Stopped<\/option>/);
  assert.match(html, /<option value="2" style="background-color: #006400;color: #F0F1F2;border-color: #323334;" selected="selected">Running<\/option>/);
  assert.doesNotMatch(html, /HmiSymbolicIOField/);
});

test("HTML conversion renders a symbolic IO field image state", async () => {
  const symbolicIoField = new HmiSymbolicIOField();
  symbolicIoField.name = "PumpState";
  symbolicIoField.width = staticProperty(80);
  symbolicIoField.height = staticProperty(60);
  symbolicIoField.value = staticProperty(7);
  const state = new HmiState();
  state.name = "Running";
  state.value = 7;
  state.imageName = "pump-running.svg";
  state.image = {
    imageName: "pump-running.svg",
    uri: "data:image/svg+xml,%3Csvg%2F%3E",
    kind: HmiImageSourceKind.Uri,
  };
  state.alternateImageName = "pump-warning.svg";
  state.alternateImage = {
    imageName: "pump-warning.svg",
    uri: "data:image/svg+xml,%3Csvg%20id%3D%22warning%22%2F%3E",
    kind: HmiImageSourceKind.Uri,
  };
  state.imageScaled = true;
  state.imageBlink = true;
  state.imageBlinkRate = HmiBlinkRate.Fast;
  state.imageBackgroundColor = hmiColorFromArgb(255, 17, 34, 51);
  symbolicIoField.states.push(state);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(symbolicIoField);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="PumpState"/);
  assert.match(html, /class="hmi-symbolic-image-state"/);
  assert.match(html, /data-state-value="7"/);
  assert.match(html, /data-image-name="pump-running.svg"/);
  assert.match(html, /data-image-blink="true"/);
  assert.match(html, /data-alternate-image-name="pump-warning.svg"/);
  assert.match(html, /data-image-blink-rate="Fast"/);
  assert.match(html, /background-color: #112233;/);
  assert.match(html, /<img src="data:image\/svg\+xml,%3Csvg%2F%3E" alt="Running" class="hmi-symbolic-image-base"/);
  assert.match(html, /animation: hmi-symbolic-base-flash 0.5s steps\(1, end\) infinite;/);
  assert.match(html, /<img src="data:image\/svg\+xml,%3Csvg%20id%3D%22warning%22%2F%3E" alt="Running" class="hmi-symbolic-image-alternate"/);
  assert.match(html, /animation: hmi-symbolic-alternate-flash 0.5s steps\(1, end\) infinite;/);
  assert.doesNotMatch(html, /<select id="PumpState"/);
});

test("HTML conversion renders IO field preview and input settings", async () => {
  const field = new HmiIOField();
  field.name = "Speed";
  field.text = expressionProperty("{[PLC]Speed}");
  field.readOnly = staticProperty(true);
  field.maskInput = staticProperty(true);
  field.fieldLength = staticProperty(12);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(field);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<input id="Speed"/);
  assert.match(html, /value="{\[PLC\]Speed}"/);
  assert.match(html, /readonly="readonly"/);
  assert.match(html, /type="password"/);
  assert.match(html, /maxlength="12"/);
});

test("HTML conversion renders a project-backed button image", async () => {
  const button = new HmiButton();
  button.name = "Start";
  button.image = staticProperty({
    imageId: "start-image",
    kind: HmiImageSourceKind.Uri,
  });
  const image = new HmiImage();
  image.id = "start-image";
  image.name = "start.png";
  image.imageType = HmiImageType.Png;
  image.mimeType = "image/png";
  image.data = new Uint8Array([1, 2, 3]);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(button);
  const project = {
    info: {},
    getImage: async id => (id === image.id ? image : undefined),
  };

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen, project);

  assert.match(html, /<button id="Start"/);
  assert.match(html, /<img src="data:image\/png;base64,AQID"/);
});

test("HTML conversion renders the selected button state caption and project image", async () => {
  const button = new HmiButton();
  button.name = "Motor";
  button.state = staticProperty(2);
  button.text = staticProperty(HmiMultilingualText.fromText("Default"));
  const stopped = new HmiState();
  stopped.value = 0;
  stopped.text = HmiMultilingualText.fromText("Stopped");
  const running = new HmiState();
  running.value = 2;
  running.text = HmiMultilingualText.fromText("Running");
  running.image = {
    imageId: "running-image",
    kind: HmiImageSourceKind.Uri,
  };
  running.backgroundColor = hmiColorFromArgb(255, 10, 20, 30);
  running.captionColor = hmiColorFromArgb(255, 240, 241, 242);
  running.borderColor = hmiColorFromArgb(255, 100, 101, 102);
  button.states.push(stopped, running);
  const image = new HmiImage();
  image.id = "running-image";
  image.name = "running.png";
  image.imageType = HmiImageType.Png;
  image.mimeType = "image/png";
  image.data = new Uint8Array([4, 5, 6]);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(button);
  const project = {
    info: {},
    getImage: async id => (id === image.id ? image : undefined),
  };

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen, project);

  assert.match(html, /<button id="Motor"/);
  assert.match(html, /<img src="data:image\/png;base64,BAUG"/);
  assert.match(html, /Running<\/button>/);
  assert.match(html, /background-color: #0A141E;/);
  assert.match(html, /color: #F0F1F2;/);
  assert.match(html, /border-color: #646566;/);
  assert.doesNotMatch(html, />Default<\/button>/);
});

test("HTML conversion renders button 3D borders", async () => {
  const button = new HmiButton();
  button.name = "BeveledButton";
  button.width = staticProperty(100);
  button.height = staticProperty(30);
  button.text = staticProperty(HmiMultilingualText.fromText("Start"));
  button.threeDBorderWidth = staticProperty(3);
  button.threeDBorderTopColor = staticProperty(hmiColorFromArgb(255, 238, 238, 238));
  button.threeDBorderBottomColor = staticProperty(hmiColorFromArgb(255, 64, 64, 64));
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(button);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<button id="BeveledButton"/);
  assert.match(html, /border-style: solid;border-width: 3px;/);
  assert.match(html, /border-color: #EEEEEE #404040 #404040 #EEEEEE;/);
});

test("HTML conversion renders button caption colors", async () => {
  const button = new HmiButton();
  button.name = "ColoredCaption";
  button.width = staticProperty(100);
  button.height = staticProperty(30);
  button.text = staticProperty(HmiMultilingualText.fromText("Start"));
  button.captionColor = staticProperty(hmiColorFromArgb(255, 12, 34, 56));
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(button);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<button id="ColoredCaption"/);
  assert.match(html, /color: #0C2238;/);
});

test("HTML conversion renders blinking button caption colors", async () => {
  const button = new HmiButton();
  button.name = "FlashingCaption";
  button.width = staticProperty(100);
  button.height = staticProperty(30);
  button.text = staticProperty(HmiMultilingualText.fromText("Alarm"));
  button.captionColor = blinkProperty(
    hmiColorFromArgb(255, 12, 34, 56),
    hmiColorFromArgb(255, 238, 68, 17),
    HmiBlinkRate.Fast,
  );
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(button);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /--hmi-caption-color-off: #0C2238;/);
  assert.match(html, /--hmi-caption-color-on: #EE4411;/);
  assert.match(html, /animation: hmi-caption-color-flash 0.5s steps\(1, end\) infinite;/);
  assert.match(html, /@keyframes hmi-caption-color-flash/);
});

test("HTML conversion renders static disabled button appearance", async () => {
  const disabled = new HmiButton();
  disabled.name = "Disabled";
  disabled.enabled = staticProperty(false);
  disabled.showDisabledState = staticProperty(true);
  disabled.disabledImageMode = staticProperty(HmiDisabledImageMode.Reference);
  disabled.image = staticProperty({ imageId: "normal-image" });
  disabled.disabledImage = staticProperty({ imageId: "disabled-image" });
  const grayscale = new HmiButton();
  grayscale.name = "Grayscale";
  grayscale.enabled = staticProperty(false);
  grayscale.showDisabledState = staticProperty(true);
  grayscale.disabledImageMode = staticProperty(HmiDisabledImageMode.Grayscale);
  grayscale.image = staticProperty({ imageId: "normal-image" });
  const normalImage = new HmiImage();
  normalImage.id = "normal-image";
  normalImage.name = "normal.png";
  normalImage.imageType = HmiImageType.Png;
  normalImage.mimeType = "image/png";
  normalImage.data = new Uint8Array([1]);
  const disabledImage = new HmiImage();
  disabledImage.id = "disabled-image";
  disabledImage.name = "disabled.png";
  disabledImage.imageType = HmiImageType.Png;
  disabledImage.mimeType = "image/png";
  disabledImage.data = new Uint8Array([2]);
  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(disabled, grayscale);
  const project = {
    info: {},
    getImage: async id =>
      id === normalImage.id
        ? normalImage
        : id === disabledImage.id
          ? disabledImage
          : undefined,
  };

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen, project);

  assert.match(html, /<button id="Disabled"[^>]* disabled="disabled"><img src="data:image\/png;base64,Ag=="/);
  assert.match(html, /<button id="Grayscale"/);
  assert.match(html, /src="data:image\/png;base64,AQ==" style="width: 100%; height: 100%; filter: grayscale\(1\);"/);
});

test("HTML conversion renders materialized reference objects", async () => {
  const materialized = new HmiGroup();
  materialized.name = "PumpFaceplate";
  materialized.x = staticProperty(5);
  materialized.y = staticProperty(6);
  materialized.width = staticProperty(100);
  materialized.height = staticProperty(50);
  const pumpBody = createRectangle("PumpBody");
  pumpBody.x = staticProperty(7);
  pumpBody.y = staticProperty(8);
  materialized.items.push(pumpBody);

  const reference = new HmiGroup();
  reference.name = "Pump101";
  reference.x = staticProperty(10);
  reference.y = staticProperty(20);
  reference.width = staticProperty(100);
  reference.height = staticProperty(50);
  reference.isReferenceObject = true;
  reference.referenceObject = new HmiReferenceObjectSettings();
  reference.referenceObject.source = "Pumps.PumpFaceplate";
  reference.referenceObject.materializedObject = materialized;

  const screen = createScreen("main", "Main");
  screen.layers[0].items.push(reference);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /class="hmi-reference-object"/);
  assert.match(html, /data-hmi-reference-source="Pumps\.PumpFaceplate"/);
  assert.match(html, /id="Pump101"/);
  assert.match(html, /id="PumpFaceplate"/);
  assert.match(html, /id="PumpBody"/);
});

test("inspectable HMI conversion keeps model and rendered hierarchy aligned", async () => {
  const template = createScreen("template", "Template");
  template.layers[0].items.push(createRectangle("Duplicate"));

  const nested = createScreen("nested", "Nested");
  nested.layers[0].items.push(createRectangle("Duplicate"));
  const recursiveWindow = new HmiScreenWindow();
  recursiveWindow.name = "Recursive";
  recursiveWindow.screenId = staticProperty("root");
  nested.layers[0].items.push(recursiveWindow);

  const root = createScreen("root", "Root");
  root.templateId = staticProperty("template");
  root.layers[0].items.push(createRectangle("Duplicate"));
  const hidden = createRectangle("Hidden");
  hidden.visible = staticProperty(false);
  root.layers[0].items.push(hidden);

  const group = new HmiGroup();
  group.name = "Group";
  group.items.push(createRectangle("Duplicate"));
  root.layers[0].items.push(group);

  const nestedWindow = new HmiScreenWindow();
  nestedWindow.name = "Nested window";
  nestedWindow.screenId = staticProperty("nested");
  root.layers[0].items.push(nestedWindow);

  const missingWindow = new HmiScreenWindow();
  missingWindow.name = "Missing window";
  missingWindow.screenId = staticProperty("missing");
  root.layers[0].items.push(missingWindow);

  const screens = new Map([
    ["root", root],
    ["Root", root],
    ["template", template],
    ["Template", template],
    ["nested", nested],
    ["Nested", nested],
  ]);
  const project = {
    info: {},
    getScreen: async id => screens.get(id),
  };

  const result = await new HmiScreenToHtmlConverter().convertInspectableAsync(root, project);
  const nodes = flatten(result.inspection.root);
  assert.equal(new Set(nodes.map(node => node.key)).size, nodes.length);
  assert.ok(nodes.some(node => node.origin === "template" && node.typeName === "HmiRectangle"));
  assert.ok(nodes.some(node => node.origin === "subscreen" && node.typeName === "HmiRectangle"));
  assert.equal(nodes.find(node => node.name === "Hidden")?.rendered, false);
  assert.equal(nodes.find(node => node.referenceStatus === "missing")?.selectable, false);
  assert.equal(nodes.find(node => node.referenceStatus === "recursive")?.selectable, false);

  for (const node of nodes.filter(node => node.rendered))
    assert.match(result.html, new RegExp(`data-hmi-node-key="${escapeRegExp(node.key)}"`));
  assert.doesNotMatch(result.html, /data-hmi-node-key="screen\/layer:0\/item:1"/);
});

test("property inspection separates fallback values and dynamic bindings", () => {
  const tag = tagProperty("Motor.Speed", 42);
  tag.triggers.push({
    kind: HmiTriggerKind.Tag,
    name: "Speed changed",
    tagNames: ["Motor.Speed"],
    mode: HmiTagTriggerMode.ValueChange,
  });
  const expression = expressionProperty("A + B", 7);
  expression.converters.push({
    kind: "Expression",
    name: "Scale",
    expression: "value * 10",
    language: "JavaScript",
    parameters: { factor: 10 },
  });
  const cyclic = { label: "cycle" };
  cyclic.self = cyclic;
  const model = {
    x: staticProperty(12),
    value: tag,
    calculated: expression,
    nested: cyclic,
    items: [{ ignored: true }],
  };

  const properties = inspectHmiProperties(model);
  assert.equal(properties.find(property => property.name === "x")?.value, "12");
  assert.equal(properties.find(property => property.name === "value")?.binding?.kind, HmiPropertyKind.Tag);
  assert.match(properties.find(property => property.name === "value")?.binding?.summary ?? "", /Motor\.Speed/);
  assert.equal(properties.find(property => property.name === "calculated")?.binding?.kind, HmiPropertyKind.Expression);
  assert.ok(hasPropertyValue(properties.find(property => property.name === "nested")?.children ?? [], "[Circular]"));
  assert.equal(properties.some(property => property.name === "items"), false);
});

test("tag binding retains selected metadata property", () => {
  const property = tagProperty("Tank.Level", undefined, "EngineeringUnits");

  assert.equal(property.kind, HmiPropertyKind.Tag);
  assert.equal(property.tagName, "Tank.Level");
  assert.equal(property.propertyName, "EngineeringUnits");
});

function createScreen(id, name) {
  const screen = new HmiScreen();
  screen.id = id;
  screen.name = name;
  screen.width = staticProperty(800);
  screen.height = staticProperty(480);
  const layer = new HmiLayer();
  layer.name = "Default";
  screen.layers.push(layer);
  return screen;
}

function createRectangle(name) {
  const item = new HmiRectangle();
  item.name = name;
  item.width = staticProperty(100);
  item.height = staticProperty(50);
  return item;
}

function flatten(root) {
  return [root, ...root.children.flatMap(flatten)];
}

function hasPropertyValue(properties, value) {
  return properties.some(property => property.value === value || hasPropertyValue(property.children, value));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
