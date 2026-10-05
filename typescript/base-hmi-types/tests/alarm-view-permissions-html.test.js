import assert from "node:assert/strict";
import test from "node:test";
import { HmiAlarmControl, HmiAlarmColumnSet, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty } from "../dist/index.js";
test("View permissions remain independent and only explicit selection marks the table", async () => {
  const control = new HmiAlarmControl(), screen = new HmiScreen(), layer = new HmiLayer(), renderer = new HmiScreenToHtmlConverter(); layer.items.push(control); screen.layers.push(layer);
  const first = Object.assign(new HmiAlarmColumnSet(), { name: "View <A>", allowSort: staticProperty(false), allowFilter: staticProperty(true), allowColumnReorder: staticProperty(false), allowColumnResize: staticProperty(true) });
  const second = Object.assign(new HmiAlarmColumnSet(), { name: "", allowSort: staticProperty(true), allowFilter: staticProperty(false) });
  control.columnSets.push(first, second, Object.assign(new HmiAlarmColumnSet(), { name: "Unset" }));
  const table = html => html.split('<table class="hmi-alarm-table')[1].split("</table>")[0];
  const html = await renderer.convertAsync(screen), settings = html.split('<template class="hmi-alarm-view-settings">')[1].split("</template>")[0];
  assert.ok(settings.includes('data-column-set-name="View &lt;A&gt;" data-view-allow-sort="false" data-view-allow-filter="true" data-view-allow-column-reorder="false" data-view-allow-column-resize="true"'));
  assert.ok(settings.includes('data-column-set-name="" data-view-allow-sort="true" data-view-allow-filter="false"')); assert.ok(!settings.includes("Unset")); assert.ok(!table(html).includes("data-view-allow-sort"));
  control.showHeader = staticProperty(false); control.activeColumnSet = first.name;
  let selected = table(await renderer.convertAsync(screen)); assert.ok(selected.includes('data-view-allow-sort="false"')); assert.ok(selected.includes('data-view-allow-column-resize="true"')); assert.ok(selected.includes("Alarm data not loaded"));
  control.activeColumnSet = ""; selected = table(await renderer.convertAsync(screen)); assert.ok(selected.includes('data-view-allow-sort="true"')); assert.ok(!selected.includes("data-view-allow-column-resize"));
  control.activeColumnSet = "Missing"; assert.ok(!table(await renderer.convertAsync(screen)).includes("data-view-allow-sort"));
  control.columnSets.length = 0; assert.ok(!(await renderer.convertAsync(screen)).includes("hmi-alarm-view-settings"));
});
