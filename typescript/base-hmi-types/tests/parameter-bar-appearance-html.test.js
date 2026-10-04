import assert from "node:assert/strict";
import test from "node:test";
import { HmiDetailedParameterControl, HmiOverviewParameterControl, HmiFont, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, HmiHtmlConvertOptions, staticProperty, hmiColorFromArgb, getStaticValue } from "../dist/index.js";

for (const Type of [HmiDetailedParameterControl, HmiOverviewParameterControl]) test(`parameter bars use independent localized fonts and colors: ${Type.name}`, async () => {
  const control = new Type(); control.showToolbar = staticProperty(true); control.showStatusBar = staticProperty(true);
  control.toolbarForegroundColor = staticProperty(hmiColorFromArgb(255,17,34,51)); control.statusBarForegroundColor = staticProperty(hmiColorFromArgb(255,68,85,102));
  const font = (name,size) => { const f=new HmiFont(); f.name=staticProperty(name);f.size=staticProperty(size);return f; };
  const toolbar=font("ToolbarFace",14),status=font("StatusFace",10);toolbar.bold=staticProperty(true);toolbar.underline=staticProperty(true);status.italic=staticProperty(true);status.strikethrough=staticProperty(true);
  const localizedToolbar=font("LocalizedToolbar <A> & B",17.5),localizedStatus=font("LocalizedStatus <X> & Y",11.25);localizedToolbar.italic=staticProperty(true);localizedStatus.bold=staticProperty(true);
  toolbar.localizedFonts.set(1031,localizedToolbar);status.localizedFonts.set(1031,localizedStatus);
  control.toolbarFont=toolbar;control.statusBarFont=status;
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(control);const renderer=new HmiScreenToHtmlConverter();
  for (const lcid of [1031,1036]) {
    const options=new HmiHtmlConvertOptions();options.cultureLcid=lcid;const html=await renderer.convertAsync(screen,undefined,options);
    const toolbarTag=html.match(/<div[^>]*role="toolbar"[^>]*>/u)?.[0] ?? "",statusTag=html.match(/<div[^>]*role="status"[^>]*>/u)?.[0] ?? "";
    assert.ok(toolbarTag.includes("color: #112233;"));assert.ok(statusTag.includes("color: #445566;"));
    assert.ok(toolbarTag.includes(lcid===1031?"font-family: LocalizedToolbar &lt;A&gt; &amp; B;font-size: 17.5px;":"font-family: ToolbarFace;font-size: 14px;"));
    assert.ok(statusTag.includes(lcid===1031?"font-family: LocalizedStatus &lt;X&gt; &amp; Y;font-size: 11.25px;":"font-family: StatusFace;font-size: 10px;"));
    assert.ok(!toolbarTag.includes("StatusFace"));assert.ok(!toolbarTag.includes("LocalizedStatus"));assert.ok(!statusTag.includes("ToolbarFace"));assert.ok(!statusTag.includes("LocalizedToolbar"));
    const details=html.match(/<div class="hmi-parameter-details"[^>]*>/u)?.[0] ?? "";assert.ok(!details.includes("ToolbarFace"));assert.ok(!details.includes("StatusFace"));
  }
  assert.equal(getStaticValue(toolbar.name),"ToolbarFace");assert.equal(getStaticValue(status.name),"StatusFace");
  control.showToolbar=staticProperty(false);control.showStatusBar=staticProperty(false);const hidden=await renderer.convertAsync(screen);assert.ok(!hidden.includes('class="hmi-parameter-toolbar"'));assert.ok(!hidden.includes('class="hmi-parameter-status-bar"'));
  assert.equal(control.toolbarFont,toolbar);assert.equal(control.statusBarFont,status);
  control.showToolbar=staticProperty(true);control.showStatusBar=staticProperty(true);delete control.toolbarFont;delete control.statusBarFont;delete control.toolbarForegroundColor;
  const absent=await renderer.convertAsync(screen),plainToolbar=absent.match(/<div[^>]*role="toolbar"[^>]*>/u)?.[0] ?? "",plainStatus=absent.match(/<div[^>]*role="status"[^>]*>/u)?.[0] ?? "";
  assert.ok(!plainToolbar.includes("font-family:"));assert.ok(!plainToolbar.includes("color:"));assert.ok(!plainStatus.includes("font-family:"));
});
