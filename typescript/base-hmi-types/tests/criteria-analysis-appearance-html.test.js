import assert from "node:assert/strict";
import test from "node:test";
import { HmiProcessDiagnosisCriteriaAnalysisControl, HmiScreen, HmiLayer, HmiScreenToHtmlConverter, staticProperty, hmiColorFromArgb } from "../dist/index.js";
import { getStaticValue } from "../dist/index.js";

for (const visible of [false,true]) test(`Criteria header gradients retain hidden settings visible=${visible}`,async()=>{
 const item=new HmiProcessDiagnosisCriteriaAnalysisControl();item.name="Criteria <A> & B";item.showColumnHeadings=staticProperty(visible);
 item.headerBackgroundColor=staticProperty(hmiColorFromArgb(0,17,34,51));item.headerBorderBackgroundColor=staticProperty(hmiColorFromArgb(255,21,22,23));
 item.headerCornerRadius=staticProperty(0);item.headerBackFillStyle=staticProperty(-7);item.headerEdgeStyle=staticProperty(-2147483648);
 item.headerFirstGradientColor=staticProperty(hmiColorFromArgb(255,31,32,33));item.headerMiddleGradientColor=staticProperty(hmiColorFromArgb(255,41,42,43));item.headerSecondGradientColor=staticProperty(hmiColorFromArgb(255,51,52,53));
 item.headerFirstGradientOffset=staticProperty(-10);item.headerSecondGradientOffset=staticProperty(120);item.useHeaderFirstGradient=staticProperty(true);item.useHeaderSecondGradient=staticProperty(true);
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(item);const renderer=new HmiScreenToHtmlConverter();
 const header=html=>/<div data-appearance-sample="header"(.*?)<\/div>/u.exec(html)?.[0]??"";
 const html=await renderer.convertAsync(screen);assert.ok(html.includes("Criteria &lt;A&gt; &amp; B"));
 for(const key of ["header-border-background-color","header-corner-radius","header-back-fill-style","header-edge-style","header-first-gradient-color","header-middle-gradient-color","header-second-gradient-color","header-first-gradient-offset","header-second-gradient-offset","use-header-first-gradient","use-header-second-gradient"]) assert.ok(html.includes(`data-${key}=`),key);
 assert.ok(html.includes('data-header-edge-style="-2147483648"'));assert.equal(header(html).includes("linear-gradient("),visible);assert.equal(header(html).includes("border-radius: 0px;"),visible);
 assert.equal(getStaticValue(item.headerFirstGradientOffset),-10);assert.equal(getStaticValue(item.headerSecondGradientOffset),120);
 item.showColumnHeadings=staticProperty(true);item.useHeaderFirstGradient=staticProperty(false);item.useHeaderSecondGradient=staticProperty(false);
 const disabled=header(await renderer.convertAsync(screen));assert.ok(!disabled.includes("linear-gradient("));assert.ok(disabled.includes("background-color: rgba(17,34,51,0);"));
 for(const radius of [-1,NaN,Infinity]){item.headerCornerRadius=staticProperty(radius);assert.ok(!header(await renderer.convertAsync(screen)).includes("border-radius:"));}
 delete item.headerBackgroundColor;delete item.headerFirstGradientColor;delete item.headerMiddleGradientColor;delete item.headerSecondGradientColor;
 const codes=await renderer.convertAsync(screen);assert.ok(codes.includes('data-header-back-fill-style="-7"'));assert.ok(codes.includes("data-header-border-background-color="));assert.ok(!header(codes).includes("background-color:"));
});

test("Criteria analysis renders independent appearance samples and visibility", async () => {
  const item = new HmiProcessDiagnosisCriteriaAnalysisControl();
  item.name = "CriteriaPreview";
  item.showGridLines = staticProperty(true); item.showColumnHeadings = staticProperty(true);
  item.gridLineColor = staticProperty(hmiColorFromArgb(0, 17, 34, 51));
  for (const [property, rgb] of [["alternatingRowBackgroundColor", [21,22,23]], ["contentBackgroundColor", [31,32,33]], ["contentForegroundColor", [41,42,43]], ["headerBackgroundColor", [51,52,53]], ["headerForegroundColor", [61,62,63]], ["headerBorderColor", [71,72,73]]]) item[property] = staticProperty(hmiColorFromArgb(255, ...rgb));
  item.headerBorderWidth = staticProperty(0);
  const screen = new HmiScreen(), layer = new HmiLayer(); screen.layers.push(layer); layer.items.push(item);
  const renderer = new HmiScreenToHtmlConverter();
  const sample = (html, kind) => new RegExp(`<div data-appearance-sample="${kind}"[^>]*>`, "u").exec(html)?.[0] ?? "";
  let html = await renderer.convertAsync(screen);
  assert.ok(html.includes('data-show-grid-lines="true"'));
  assert.ok(html.includes("Criteria analysis appearance preview; diagnostic data not loaded"));
  const header = sample(html, "header");
  for (const text of ["background-color: #333435;", "color: #3D3E3F;", "border-color: #474849;", "border-width: 0px;"]) assert.ok(header.includes(text), text);
  const content = sample(html, "content"), alternate = sample(html, "alternate");
  assert.ok(content.includes("background-color: #1F2021;"));
  assert.ok(alternate.includes("background-color: #151617;"));
  for (const value of [content, alternate]) for (const text of ["color: #292A2B;", "border-bottom: 1px solid currentColor;", "border-bottom-color: rgba(17,34,51,0);"]) assert.ok(value.includes(text), text);
  item.showColumnHeadings = staticProperty(false); item.showGridLines = staticProperty(false);
  html = await renderer.convertAsync(screen);
  assert.equal(sample(html, "header"), ""); assert.ok(!sample(html, "content").includes("border-bottom"));
  assert.ok(html.includes('data-show-column-headings="false"')); assert.ok(html.includes("data-grid-line-color="));
  delete item.showColumnHeadings; delete item.showGridLines; delete item.alternatingRowBackgroundColor;
  item.headerBorderWidth = staticProperty(-1);
  html = await renderer.convertAsync(screen);
  assert.ok(!html.includes("data-show-grid-lines=")); assert.ok(!sample(html, "header").includes("border-width"));
  assert.ok(sample(html, "alternate").includes("background-color: #1F2021;"));
  for (const width of [NaN, Infinity]) {
    item.headerBorderWidth = staticProperty(width);
    assert.ok(!sample(await renderer.convertAsync(screen), "header").includes("border-width"));
  }
});
