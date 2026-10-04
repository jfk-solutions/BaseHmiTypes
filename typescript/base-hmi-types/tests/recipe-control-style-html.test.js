import assert from "node:assert/strict";
import test from "node:test";
import {
  HmiRecipeControl, HmiRecipeColumnType, HmiRecipeViewKind, HmiFont,
  HmiLayer, HmiScreen, HmiScreenToHtmlConverter, HmiMultilingualText,
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
