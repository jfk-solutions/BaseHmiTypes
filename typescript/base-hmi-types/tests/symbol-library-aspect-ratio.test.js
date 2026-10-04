import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiScreen,HmiLayer,HmiImage,HmiImageType,HmiSymbolLibraryControl,HmiScreenToHtmlConverter,staticProperty as p} from '../dist/index.js';
for(const [fixedAspect,intrinsic,styled] of [[true,'none',false],[false,'xMidYMid meet',false],[true,'none',true],[false,'xMidYMid meet',true],[true,'',true],[false,'',true]])
test(`Symbol control overrides SVG aspect ratio: ${fixedAspect}/${intrinsic}/${styled}`,async()=>{
 const source=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10"${intrinsic?` preserveAspectRatio="${intrinsic}"`:''}${styled?' style="color: red;"':''}><path d="M0 0L20 10"/></svg>`;
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);
 layer.items.push(Object.assign(new HmiSymbolLibraryControl(),{name:'symbol',symbolId:'synthetic',fixedAspectRatio:p(fixedAspect),
 symbol:Object.assign(new HmiImage(),{imageType:HmiImageType.Svg,data:new TextEncoder().encode(source)})}));
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
 assert.ok(html.includes(`preserveAspectRatio="${fixedAspect?'xMidYMid meet':'none'}"`));
 assert.ok(html.includes('data-hmi-symbol-id="synthetic"'));assert.ok(html.includes('width: 100%; height: 100%; display: block;'));
 assert.ok(html.includes('<path d="M0 0L20 10"/>'));if(styled)assert.ok(html.includes('color: red;'));
 const root=html.match(/<svg[^>]*data-hmi-symbol-id="synthetic"[^>]*>/)?.[0]??'';
 assert.equal(root.split('preserveAspectRatio=').length-1,1);
});
