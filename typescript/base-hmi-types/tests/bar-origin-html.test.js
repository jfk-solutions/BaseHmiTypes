import assert from "node:assert/strict";
import test from "node:test";
import {HmiBar,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,staticProperty,tagProperty,hmiColorFromArgb} from "../dist/index.js";

const spans=[[50,25,"25","25"],[50,50,"50","0"],[50,75,"50","25"],[50,-25,"0","50"],
  [50,125,"50","50"],[-25,50,"0","50"],[125,50,"50","50"]];
async function convert(bar){const layer=new HmiLayer();layer.items.push(bar);const screen=new HmiScreen();screen.layers.push(layer);return new HmiScreenToHtmlConverter().convertAsync(screen);}
function createBar(){const bar=new HmiBar();bar.name="Origin";bar.beginValue=staticProperty(0);bar.endValue=staticProperty(100);return bar;}
for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])
for(const [origin,value,start,length] of spans)for(const tagged of [false,true])for(const scale of [false,true]){
  test("HTML fills bar from origin ("+[direction,origin,value,tagged,scale].join(", ")+")",async()=>{
    const bar=createBar();bar.value=staticProperty(value);bar.fillDirection=staticProperty(direction);bar.showScale=staticProperty(scale);
    bar.originValue=tagged?tagProperty("Bar.Origin",origin):staticProperty(origin);
    const html=await convert(bar),fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";
    assert.ok(fill.includes('data-origin-value="'+origin+'"'));
    const edge=["bottom","top","right","left"][direction];
    assert.ok(fill.includes(edge+": "+start+"%;"));assert.ok(fill.includes((direction<2?"height":"width")+": "+length+"%;"));
    assert.ok(html.includes('value="'+Math.min(100,Math.max(0,value))+'"'));assert.ok(fill.includes('aria-hidden="true"'));
    assert.equal(html.includes("data-hmi-bar-scale"),scale);
  });
}
for(const vertical of [false,true])for(const kind of [0,1,2,3]){
  test("HTML keeps legacy bar without finite origin ("+[vertical,kind].join(", ")+")",async()=>{
    const bar=createBar();bar.value=staticProperty(25);bar.fillDirection=staticProperty(vertical?HmiFillDirection.Up:HmiFillDirection.Right);
    if(kind!==0)bar.originValue=staticProperty(kind===1?NaN:kind===2?Infinity:-Infinity);
    const html=await convert(bar);assert.equal(html.includes("data-hmi-bar-origin"),false);assert.ok(html.includes("<meter"));
  });
}
for(const disabled of [false,true]){
  test("HTML keeps bar origin threshold and disabled fill colors ("+disabled+")",async()=>{
    const bar=createBar();bar.value=staticProperty(25);bar.originValue=staticProperty(50);bar.useThresholdFillColors=staticProperty(true);
    bar.enabled=staticProperty(!disabled);bar.useDisabledForegroundColor=staticProperty(true);bar.disabledForegroundColor=staticProperty(hmiColorFromArgb(255,255,0,0));
    bar.thresholds.push({value:staticProperty(50),color:staticProperty(hmiColorFromArgb(255,0,0,255))});
    const fill=(await convert(bar)).match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";
    assert.ok(fill.toUpperCase().includes(disabled?"COLOR: #FF0000;":"COLOR: #0000FF;"));
  });
}
for(const [value,start,length] of [[2.5e307,"25","25"],[5e307,"50","0"],[7.5e307,"50","25"]]){
  test("HTML handles large finite bar origin ranges ("+value+")",async()=>{
    const bar=createBar();bar.endValue=staticProperty(1e308);bar.originValue=staticProperty(5e307);bar.value=staticProperty(value);
    const fill=(await convert(bar)).match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??"";
    assert.ok(fill.includes("left: "+start+"%; width: "+length+"%;"));
  });
}
