import assert from "node:assert/strict";
import test from "node:test";
import {
  HmiRecipeControl, HmiRecipeColumnType, HmiRecipeViewKind, HmiFont,
  HmiLayer, HmiScreen, HmiScreenToHtmlConverter, HmiMultilingualText, HmiHtmlConvertOptions, getStaticValue,
  staticProperty, hmiColorFromArgb,
} from "../dist/index.js";

async function convert(control) {
  const screen = new HmiScreen(), layer = new HmiLayer();
  layer.items.push(control); screen.layers.push(layer);
  return new HmiScreenToHtmlConverter().convertAsync(screen);
}

for (const kind of [HmiRecipeViewKind.Selector, HmiRecipeViewKind.Table]) {
  test(`recipe ${kind} uses configured header/content style`, async () => {
    const control = new HmiRecipeControl();
    control.name = "RecipePreview"; control.viewKind = kind;
    control.width = staticProperty(320); control.height = staticProperty(160);
    for (const [property, red] of [["headerBackgroundColor", 1], ["headerForegroundColor", 4],
      ["headerBorderColor", 7], ["contentBackgroundColor", 10], ["contentForegroundColor", 13]])
      control[property] = staticProperty(hmiColorFromArgb(255, red, red + 1, red + 2));
    control.headerFont = new HmiFont(); control.headerFont.name = staticProperty("PreviewHeader");
    control.headerFont.size = staticProperty(18); control.headerFont.bold = staticProperty(true);
    control.contentFont = new HmiFont(); control.contentFont.name = staticProperty("PreviewContent");
    control.contentFont.size = staticProperty(14); control.wordWrap = staticProperty(false);
    control.defaultRecipeName = staticProperty("<Configured recipe>");
    control.columnDefinitions.push({ type: HmiRecipeColumnType.IngredientName, width: staticProperty(120),
      headerText: HmiMultilingualText.fromText("Configured field") });
    control.columnDefinitions.push({ type: HmiRecipeColumnType.CurrentValue, width: staticProperty(999),
      visible: staticProperty(false), headerText: HmiMultilingualText.fromText("Hidden column") });
    const html = await convert(control);
    for (const css of ["background-color: #010203;", "color: #040506;", "border-color: #070809;",
      "background-color: #0A0B0C;", "color: #0D0E0F;",
      "font-family: PreviewHeader;font-size: 18px;font-weight: bold;",
      "font-family: PreviewContent;font-size: 14px;", "white-space: nowrap;"])
      assert.ok(html.includes(css), css);
    if (kind === HmiRecipeViewKind.Table) {
      assert.ok(html.includes('<col style="width: 120px;">'));
      assert.equal(html.includes("Hidden column"), false);
      assert.equal(html.includes("width: 999px;"), false);
    } else assert.ok(html.includes("&lt;Configured recipe&gt;"));
  });
}

test("recipe table keeps widths without header and rejects invalid widths", async () => {
  const control = new HmiRecipeControl(); control.viewKind = HmiRecipeViewKind.Table;
  control.showHeader = staticProperty(false); control.wordWrap = staticProperty(true);
  for (const width of [80, -1, NaN, Infinity])
    control.columnDefinitions.push({ type: HmiRecipeColumnType.Unknown, width: staticProperty(width) });
  const html = await convert(control);
  assert.ok(html.includes('<colgroup><col style="width: 80px;"><col><col><col></colgroup>'));
  assert.ok(html.includes("white-space: normal;overflow-wrap: anywhere;"));
  assert.equal(html.includes("<thead>"), false);
});

test("recipe grid and status visibility reach HTML", async () => {
  const control = new HmiRecipeControl(); control.viewKind = HmiRecipeViewKind.Table;
  control.columnDefinitions.push({ type: HmiRecipeColumnType.CurrentValue });
  control.showGridLines = staticProperty(false); control.showStatusBar = staticProperty(false);
  control.gridLineColor = staticProperty(hmiColorFromArgb(255, 21, 22, 23));
  let html = await convert(control);
  assert.ok(html.includes("border: 0;border-color: #151617;"));
  assert.ok(html.includes('data-show-grid-lines="false"')); assert.ok(!html.includes("hmi-recipe-status-bar"));
  control.showGridLines = staticProperty(true); control.showStatusBar = staticProperty(true);
  html = await convert(control); assert.ok(html.includes("border: 1px solid currentColor;border-color: #151617;"));
  assert.ok(html.includes('class="hmi-recipe-status-bar"')); assert.ok(html.includes("Recipe status not loaded"));
  delete control.showGridLines; delete control.showStatusBar;
  html = await convert(control); assert.ok(!html.includes("data-show-grid-lines")); assert.ok(!html.includes("data-show-status-bar"));
  assert.ok(!html.includes("hmi-recipe-status-bar"));
});

test("recipe combo font uses locale only for selector and falls back to content font", async () => {
  const font = (name, size) => { const value = new HmiFont(); value.name = staticProperty(name); value.size = staticProperty(size); return value; };
  const combo = font("NeutralCombo", 13); combo.localizedFonts.set(1031, font("LocalizedCombo <A> & B", 17.5));
  const control = new HmiRecipeControl(); control.comboBoxFont = combo; control.contentFont = font("TableContent", 11);
  control.headerFont = font("SeparateHeader", 19); control.statusBarFont = font("SeparateStatus", 9); control.showStatusBar = staticProperty(true);
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(control);
  const renderer = new HmiScreenToHtmlConverter(), options = new HmiHtmlConvertOptions(); options.cultureLcid = 1031;
  let html = await renderer.convertAsync(screen, undefined, options);
  assert.ok(html.includes("font-family: LocalizedCombo &lt;A&gt; &amp; B;font-size: 17.5px;"));
  assert.ok(html.includes("font-family: SeparateHeader;")); assert.ok(html.includes("font-family: SeparateStatus;"));
  assert.ok(!html.includes("font-family: TableContent;"));
  options.cultureLcid = 1036; html = await renderer.convertAsync(screen, undefined, options); assert.ok(html.includes("font-family: NeutralCombo;"));
  control.viewKind = HmiRecipeViewKind.Table; options.cultureLcid = 1031;
  html = await renderer.convertAsync(screen, undefined, options); assert.ok(html.includes("font-family: TableContent;")); assert.ok(!html.includes("font-family: LocalizedCombo"));
  control.viewKind = HmiRecipeViewKind.Selector; delete control.comboBoxFont;
  html = await renderer.convertAsync(screen, undefined, options); assert.ok(html.includes("font-family: TableContent;"));
  assert.equal(getStaticValue(combo.name), "NeutralCombo"); assert.equal(combo.localizedFonts.size, 1);
});


for (const kind of [HmiRecipeViewKind.Selector, HmiRecipeViewKind.Table]) test(`recipe header gradient flags and raw appearance stay independent: ${kind}`, async () => {
  let control = new HmiRecipeControl(); control.viewKind = kind;
  for (const [name, red] of [["headerBackgroundColor", 1], ["headerBorderBackgroundColor", 13], ["headerFirstGradientColor", 4], ["headerMiddleGradientColor", 7], ["headerSecondGradientColor", 10]]) control[name] = staticProperty(hmiColorFromArgb(255, red, red + 1, red + 2));
  for (const [name, value] of [["headerFirstGradientOffset", 25.5], ["headerSecondGradientOffset", 75], ["headerBackFillStyle", 0], ["headerEdgeStyle", -17], ["useHeaderFirstGradient", true], ["useHeaderSecondGradient", true]]) control[name] = staticProperty(value);
  control.columnDefinitions.push({ type: HmiRecipeColumnType.Unknown });
  let html = await convert(control);
  assert.ok(html.includes("background-image: linear-gradient(to right, #040506 0%, #070809 25.5%, #070809 75%, #0A0B0C 100%);"));
  for (const attr of ['data-header-back-fill-style="0"', 'data-header-edge-style="-17"', 'data-header-first-gradient-offset="25.5"', 'data-header-second-gradient-offset="75"', 'data-use-header-first-gradient="true"', 'data-use-header-second-gradient="true"']) assert.ok(html.includes(attr), attr);
  const body = html.match(kind === HmiRecipeViewKind.Table ? /<td\b[^>]*style="([^"]*)"/u : /<div style="flex: 1 1 auto;([^"]*)"/u)?.[1] ?? "";
  assert.ok(body.length > 0);
  assert.ok(!body.includes("linear-gradient"));
  control.useHeaderSecondGradient = staticProperty(false); html = await convert(control);
  assert.ok(html.includes("linear-gradient(to right, #040506 0%, #070809 25.5%, #070809 100%)"));
  control.useHeaderFirstGradient = staticProperty(false); control.useHeaderSecondGradient = staticProperty(true); html = await convert(control);
  assert.ok(html.includes("linear-gradient(to right, #070809 0%, #070809 75%, #0A0B0C 100%)"));
  control.useHeaderFirstGradient = staticProperty(true); control.headerFirstGradientOffset = staticProperty(-20); control.headerSecondGradientOffset = staticProperty(125); html = await convert(control);
  assert.ok(html.includes("linear-gradient(to right, #040506 0%, #070809 0%, #070809 100%, #0A0B0C 100%)"));
  assert.ok(html.includes('data-header-first-gradient-offset="-20"')); assert.ok(html.includes('data-header-second-gradient-offset="125"'));
  assert.equal(getStaticValue(control.headerFirstGradientOffset), -20); assert.equal(getStaticValue(control.headerSecondGradientOffset), 125);
  control.useHeaderFirstGradient = staticProperty(false); control.useHeaderSecondGradient = staticProperty(false); html = await convert(control);
  assert.ok(!/style="[^"]*linear-gradient/u.test(html)); assert.ok(html.includes('data-use-header-first-gradient="false"')); assert.ok(html.includes('data-use-header-second-gradient="false"'));
  delete control.useHeaderFirstGradient; delete control.useHeaderSecondGradient; html = await convert(control);
  assert.ok(!/style="[^"]*linear-gradient/u.test(html)); assert.ok(!html.includes("data-use-header-first-gradient"));
  control.useHeaderFirstGradient = staticProperty(true); control.showHeader = staticProperty(false); html = await convert(control);
  assert.ok(!/style="[^"]*linear-gradient/u.test(html)); assert.ok(html.includes('data-use-header-first-gradient="true"'));
  control = new HmiRecipeControl(); html = await convert(control);
  for (const name of ["data-header-first-gradient", "data-header-back-fill-style", "data-header-edge-style", "data-header-border-background-color"]) assert.ok(!html.includes(name));
});
