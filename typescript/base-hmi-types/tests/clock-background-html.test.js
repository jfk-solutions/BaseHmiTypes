import assert from 'node:assert/strict';import test from 'node:test';
import {HmiClock,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty as p,hmiColorFromArgb} from '../dist/index.js';
for(const analog of [false,true])for(const mode of [0,1,2])test(`Clock background modes separate frame/dial: ${analog},${mode}`,async()=>{
 const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);
 layer.items.push(Object.assign(new HmiClock(),{analog:p(analog),backgroundStyle:p(mode),backgroundColor:p(hmiColorFromArgb(255,192,192,192))}));
 const html=(await new HmiScreenToHtmlConverter().convertAsync(screen)).match(/<time\b[\s\S]*?<\/time>/)[0];
 assert.ok(html.includes(`data-clock-background-style="${mode}"`));assert.equal(html.includes('background: transparent;'),mode!==0);
 assert.equal(html.includes('data-clock-dial='),analog&&mode===1);
 if(analog&&mode===1)assert.ok(html.includes('fill="#C0C0C0" stroke="#808080"'));
});
