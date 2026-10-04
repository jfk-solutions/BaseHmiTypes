import assert from 'node:assert/strict';import test from 'node:test';
import {HmiScreen,HmiLayer,HmiImage,HmiImageType,HmiSymbolLibraryControl,HmiSymbolLibraryRasterLayout as Layout,HmiSymbolLibraryBlinkMode as Mode,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
function bmp(){const data=new Uint8Array(78),v=new DataView(data.buffer);data[0]=66;data[1]=77;v.setUint32(2,78,true);v.setUint32(10,54,true);v.setUint32(14,40,true);v.setInt32(18,3,true);v.setInt32(22,2,true);data[26]=1;data[28]=24;return Object.assign(new HmiImage(),{imageType:HmiImageType.Bmp,data});}
async function render(values){const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(Object.assign(new HmiSymbolLibraryControl(),values));return new HmiScreenToHtmlConverter().convertAsync(screen);}
for(const blink of [false,true])test(`Tile repeats at intrinsic size and supports invisible flashing: ${blink}`,async()=>{
 const symbol=bmp(),saved=symbol.data.slice(),html=await render({name:'Texture',symbol,rasterLayout:p(Layout.Tile),blinkMode:p(blink?Mode.Invisible:Mode.NoFlashing),width:p(12),height:p(9)});
 assert.ok(html.includes('data-hmi-symbol-tile="true"'));assert.ok(html.includes('background-repeat: repeat; background-position: 0 0; background-size: auto;'));assert.ok(html.includes('data:image/bmp;base64,'));assert.equal(html.includes('data-hmi-symbol-phase="normal"'),blink);assert.deepEqual(symbol.data,saved);
});
for(const [width,height,dw,dh,left,top] of [[10,10,3,2,3,4],[2,2,2,1,0,0],[4,1,1,1,1,0],[100,100,3,2,48,49]])test(`Native downscale uses integer ratio and never upscales: ${width}/${height}`,async()=>assert.ok((await render({symbol:bmp(),rasterLayout:p(Layout.NativeScaleDown),width:p(width),height:p(height)})).includes(`position: absolute; left: ${left}px; top: ${top}px; width: ${dw}px; height: ${dh}px;`)));
test('Explicit stretch overrides existing aspect ratio policy',async()=>assert.ok((await render({symbol:bmp(),rasterLayout:p(Layout.Stretch),fixedAspectRatio:p(true)})).includes('object-fit: fill;')));
for(const kind of [0,1,2,3])test(`Unsupported raster layout or native dimensions stay placeholders: ${kind}`,async()=>{
 const symbol=bmp();if(kind===1)symbol.imageType=HmiImageType.Png;if(kind===2)symbol.data.fill(0,18,22);
 const html=await render({symbol,rasterLayout:p(kind===0?'Unknown':Layout.NativeScaleDown),width:p(kind===3?NaN:10),height:p(10)});assert.ok(html.includes('Symbol library control'));
});
