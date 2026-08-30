import assert from "node:assert/strict";
import test from "node:test";

import {
  expressionProperty,
  hmiColorFromArgb,
  HmiArrowIndicator,
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
  HmiClock,
  HmiDataGridControl,
  HmiDotNetControlContainer,
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
  HmiRadarChartControl,
  HmiSystemDiagnosisControl,
  HmiSystemDiagnosisViewKind,
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
  dataGrid.timePeriodAbsoluteMode = staticProperty(true);
  dataGrid.timePeriodStart = staticProperty("2026-08-30T08:00:00");
  dataGrid.timePeriodEnd = staticProperty("2026-08-30T12:00:00");
  layer.items.push(dataGrid);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="BatchHistory"/);
  assert.match(html, /data-show-toolbar="true"/);
  assert.match(html, /data-show-properties="false"/);
  assert.match(html, /data-time-period-absolute="true"/);
  assert.match(html, />Data grid · Export CSV<\/div>/);
  assert.match(html, />Time: 2026-08-30T08:00:00 – 2026-08-30T12:00:00<\/div>/);
  assert.match(html, />Data binding not decoded<\/div>/);
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
  alarms.listMode = staticProperty(HmiAlarmListMode.Active);
  alarms.activeAlarmsTitle = HmiMultilingualText.fromText("Active process alarms");
  alarms.numberOfRows = staticProperty(8);
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
  assert.match(html, /data-number-of-rows="8"/);
  assert.match(html, /data-filtered-triggers="Motor\*"/);
  assert.match(html, />Active process alarms<\/div>/);
  assert.match(html, /data-column-type="AlarmTime" data-time-format="HH:mm:ss">Time<\/th>/);
  assert.match(html, /data-column-type="Message">Message<\/th>/);
  assert.doesNotMatch(html, /data-column-type="AlarmState"/);
  assert.match(html, />Alarm data not loaded<\/td>/);
  assert.match(html, />Acknowledge · Help<\/div>/);
  assert.match(html, /<div id="AlarmBanner"/);
  assert.match(html, /data-view-kind="AlarmBanner"/);
  assert.match(html, /data-queue-new-alarms="true"/);
  assert.match(html, /data-show-alarm-state="true"/);
  assert.match(html, /data-show-alarm-time="true" data-time-format="HH:mm"/);
  assert.match(html, />Alarm data not loaded<\/div>/);
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
  layer.items.push(radar);
  screen.layers.push(layer);

  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);

  assert.match(html, /<div id="ProcessRadar"/);
  assert.match(html, /data-series-count="3" data-category-count="8"/);
  assert.match(html, />Process overview<\/div>/);
  assert.match(html, />Radar payload preserved \(Series: 3 · Categories: 8\)<\/div>/);
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
