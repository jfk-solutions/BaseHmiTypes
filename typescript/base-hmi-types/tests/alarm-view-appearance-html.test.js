import assert from "node:assert/strict";
import test from "node:test";
import { HmiAlarmControl, HmiAlarmColumnSet, HmiAlarmColumn, HmiFont, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, hmiColorFromArgb } from "../dist/index.js";
test("Default and explicit views use independent localized appearance", async () => {
  const color = (r, g, b, a = 255) => staticProperty(hmiColorFromArgb(a, r, g, b));
  const control = Object.assign(new HmiAlarmControl(), { defaultColumnSet: "Primary", tableBackgroundColor: color(1, 2, 3), tableHeaderBackgroundColor: color(4, 5, 6) });
  const screen = new HmiScreen(), layer = new HmiLayer(); layer.items.push(control); screen.layers.push(layer);
  const font = Object.assign(new HmiFont(), { name: staticProperty("BodyFace"), size: staticProperty(10) }); font.localizedFonts.set(1031, Object.assign(new HmiFont(), { name: staticProperty("LocalizedFace"), size: staticProperty(12), italic: staticProperty(true) }));
  const primary = Object.assign(new HmiAlarmColumnSet(), { name: "Primary", backgroundColor: color(17, 34, 51, 0), foregroundColor: color(68, 85, 102), headerBackgroundColor: color(170, 187, 204), headerForegroundColor: color(17, 34, 51), headerBorderColor: color(85, 102, 119), contentFont: font, headerFont: Object.assign(new HmiFont(), { name: staticProperty("HeadFace"), size: staticProperty(14), bold: staticProperty(true) }) });
  const secondary = Object.assign(new HmiAlarmColumnSet(), { name: "Secondary <A>", backgroundColor: color(7, 8, 9) }); control.columnSets.push(primary, secondary); primary.columns.push(Object.assign(new HmiAlarmColumn(), { sourceType: "Column" }));
  const renderer = new HmiScreenToHtmlConverter(), options = { cultureLcid: 1031 }; const table = html => html.split('<table class="hmi-alarm-table')[1].split("</table>")[0];
  let html = await renderer.convertAsync(screen, undefined, options), selected = table(html);
  for (const fragment of ['data-default-column-set="Primary"', 'data-column-set-name="Primary"', 'background-color: rgba(17,34,51,0);', 'font-family: LocalizedFace;font-size: 12px;', 'font-family: HeadFace;font-size: 14px;', 'border-color: #556677;']) assert.ok(html.includes(fragment), fragment);
  const heading = selected.split("<thead>")[1].split("</thead>")[0]; assert.ok(heading.includes('background-color: #AABBCC;')); assert.ok(!heading.includes('font-family: LocalizedFace;')); assert.ok(html.includes('data-column-set-name="Secondary &lt;A&gt;"'));
  control.activeColumnSet = secondary.name; selected = table(await renderer.convertAsync(screen, undefined, options)); assert.ok(selected.includes('background-color: #070809;')); assert.ok(selected.includes('background-color: #040506;')); assert.ok(!selected.includes("HeadFace")); assert.ok(!selected.includes("LocalizedFace"));
  control.activeColumnSet = "Unknown"; selected = table(await renderer.convertAsync(screen, undefined, options)); assert.ok(selected.includes('background-color: #010203;')); assert.ok(!selected.includes("data-view-background-color"));
  delete control.activeColumnSet; control.showHeader = staticProperty(false); selected = table(await renderer.convertAsync(screen, undefined, options)); assert.ok(!selected.includes("<thead>")); assert.ok(selected.includes('data-view-header-background-color="#AABBCC"')); assert.ok(selected.includes('font-family: LocalizedFace;'));
});

test("Font names are encoded once in metadata and actual styles", async () => {
  const font = Object.assign(new HmiFont(), { name: staticProperty('Face <&"') });
  const control = Object.assign(new HmiAlarmControl(), { defaultColumnSet: "Primary" }); control.columnSets.push(Object.assign(new HmiAlarmColumnSet(), { name: "Primary", contentFont: font, headerFont: font }));
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(control);
  const html = await new HmiScreenToHtmlConverter().convertAsync(screen);
  assert.ok(html.includes('data-view-content-font-style="font-family: Face &lt;&amp;&quot;;"')); assert.ok(html.includes('data-view-header-font-style="font-family: Face &lt;&amp;&quot;;"')); assert.ok(!html.includes("Face &amp;lt;"));
});
