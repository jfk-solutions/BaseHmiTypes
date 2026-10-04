import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiScreen,HmiLayer,HmiImage,HmiImageType,HmiSymbolLibraryControl,HmiSymbolLibraryBlinkMode as Mode,HmiSymbolLibraryBlinkSpeed as Speed,HmiSymbolLibraryBackFillStyle,HmiScreenToHtmlConverter,staticProperty as p,hmiColorFromArgb} from '../dist/index.js';
function wmf(){
 const bytes=new Uint8Array(Buffer.from('0100090000030000000002000A000000000007000000FC0200007F7F7F00000008000000FA0200000100000011223300040000002D010000040000002D010100050000000B0200000000050000000C02640064000A000000240303000A000A005A000A0032005A00030000000000','hex'));
 new DataView(bytes.buffer).setUint32(6,bytes.length/2,true);return bytes;
}
const image=()=>Object.assign(new HmiImage(),{imageType:HmiImageType.Wmf,data:wmf()});
async function render(values){const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(Object.assign(new HmiSymbolLibraryControl(),values));return new HmiScreenToHtmlConverter().convertAsync(screen);}
for(const mode of [Mode.Solid,Mode.Shaded,Mode.Invisible])for(const [speed,interval] of [[Speed.Slow,1000],[Speed.Medium,500],[Speed.Fast,250]])test(`Existing WMF flashes correct frames at nominal interval: ${mode}/${speed}`,async()=>{
 const symbol=image(),saved=symbol.data.slice();
 const html=await render({name:'Flash',symbol,blinkMode:p(mode),blinkSpeed:p(speed),blinkColor:p(hmiColorFromArgb(255,200,100,50)),backFillStyle:p(HmiSymbolLibraryBackFillStyle.Solid),backColor:p(hmiColorFromArgb(255,17,34,51)),fixedAspectRatio:p(true)});
 assert.ok(html.includes(`data-hmi-symbol-blink-interval="${interval}"`));assert.ok(html.includes(`hmi-symbol-on ${interval*2}ms step-end infinite`));
 assert.ok(html.includes('data-hmi-symbol-phase="normal"'));assert.ok(html.includes('fill="#7f7f7f"'));assert.ok(html.includes('background-color: #112233;'));assert.ok(html.includes('prefers-reduced-motion:reduce'));
 assert.equal(html.includes('data-hmi-symbol-phase="alternate"'),mode!==Mode.Invisible);
 assert.ok(html.includes(`data-hmi-symbol-phase="normal" style="position: absolute; inset: 0; opacity: ${mode===Mode.Invisible?1:0};`));
 if(mode!==Mode.Invisible)assert.ok(html.includes(`fill="${mode===Mode.Solid?'#c86432':'#c76331'}"`));assert.deepEqual(symbol.data,saved);
});
test('No flashing ignores unused blink speed and color',async()=>{
 const html=await render({symbol:image(),blinkMode:p(Mode.NoFlashing),blinkSpeed:p('Unknown')});assert.ok(!html.includes('data-hmi-symbol-phase='));assert.ok(html.includes('<polygon'));
});
for(const svg of [false,true])test(`Invisible supports existing raster/SVG: ${svg}`,async()=>{
 const symbol=Object.assign(new HmiImage(),{imageType:svg?HmiImageType.Svg:HmiImageType.Png,data:svg?new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><rect width="10" height="10"/></svg>'):new Uint8Array([1,2,3])});
 const html=await render({symbol,blinkMode:p(Mode.Invisible)});assert.ok(html.includes('data-hmi-symbol-phase="normal"'));assert.ok(html.includes('data-hmi-symbol-blink-interval="500"'));assert.ok(!html.includes('data-hmi-symbol-phase="alternate"'));
});
for(const kind of [0,1,2,3])test(`Unsupported modes/speeds/colors/non-WMF colored frames stay placeholders: ${kind}`,async()=>{
 const symbol=image();if(kind===3)symbol.imageType=HmiImageType.Svg;
 const html=await render({symbol,blinkMode:p(kind===0?'Unknown':Mode.Solid),blinkSpeed:p(kind===1?'Unknown':Speed.Medium),blinkColor:kind===2?undefined:p(hmiColorFromArgb(255,1,2,3))});assert.ok(html.includes('Symbol library control'));
});
for(const interval of [1,123,32767])test(`Explicit interval overrides preset: ${interval}`,async()=>{
 const html=await render({symbol:image(),blinkMode:p(Mode.Invisible),blinkSpeed:p(Speed.Slow),blinkIntervalMilliseconds:p(interval)});assert.ok(html.includes(`data-hmi-symbol-blink-interval="${interval}"`));assert.ok(html.includes(`hmi-symbol-on ${interval*2}ms`));
});
for(const interval of [0,-1,2147483647])test(`Invalid intervals do not overflow or animate: ${interval}`,async()=>assert.ok((await render({symbol:image(),blinkMode:p(Mode.Invisible),blinkIntervalMilliseconds:p(interval)})).includes('Symbol library control')));
