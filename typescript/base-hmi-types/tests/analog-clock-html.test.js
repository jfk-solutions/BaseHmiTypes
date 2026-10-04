import assert from 'node:assert/strict';
import test from 'node:test';
import {HmiClock,HmiScreen,HmiLayer,HmiScreenToHtmlConverter,staticProperty,tagProperty,hmiColorFromArgb} from '../dist/index.js';
async function render(properties) {
 const clock=Object.assign(new HmiClock(),properties),screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(clock);
 const html=await new HmiScreenToHtmlConverter().convertAsync(screen);
 return html.match(/<time\b[\s\S]*?<\/time>/)[0];
}
test('Analog draws dial ticks and hands at fixed sample time',async()=>{
 const html=await render({analog:staticProperty(true),showSeconds:staticProperty(true)});
 assert.ok(html.includes('data-clock-preview="static"'));assert.ok(html.includes('viewBox="0 0 100 100"'));
 assert.ok(html.includes('preserveAspectRatio="xMidYMid meet"'));assert.equal((html.match(/data-clock-tick=/g)??[]).length,60);
 for(const angle of [17,204,336])assert.ok(html.includes(`rotate(${angle} 50 50)`));
 assert.ok(html.includes('data-clock-hand="hour" points="50,49.76 47.6,46.4 50,26 52.4,46.4 50,49.76"'));
 assert.ok(html.includes('datetime="2000-01-01T12:34:56"'));
});
test('Visibility and outline settings are honored',async()=>{
 let html=await render({analog:staticProperty(true),showTicks:staticProperty(false),showHours:staticProperty(false),
 showSeconds:staticProperty(true),outlinedHands:staticProperty(true),showDate:staticProperty(true)});
 assert.ok(!html.includes('data-clock-tick='));assert.ok(!html.includes('data-clock-hand="hour"'));
 assert.ok(html.includes('data-clock-hand="minute"'));assert.ok(html.includes('fill="none"'));
 assert.ok(html.includes('data-clock-date="true">2000-01-01'));
 html=await render({analog:staticProperty(true),showTime:staticProperty(false)});
 assert.ok(!html.includes('data-clock-hand='));assert.ok(!html.includes('data-clock-hub='));
});
for(const value of [-5,0,200,NaN,Infinity])test(`Percentages finite clamped and zero hides hand: ${value}`,async()=>{
 const html=await render({analog:staticProperty(true),hourHandLengthPercent:staticProperty(value),hourHandHalfWidthPercent:staticProperty(value)});
 assert.ok(!html.includes('NaN'));assert.ok(!html.includes('Infinity'));
 assert.equal(html.includes('data-clock-hand="hour"'),value>0||Number.isNaN(value));
});
test('Digital output unchanged',async()=>{
 const html=await render({analog:staticProperty(false),showSeconds:staticProperty(true),showDate:staticProperty(true)});
 assert.ok(!html.includes('data-clock-dial='));assert.ok(html.includes('>2000-01-01 12:34:56</time>'));
});
for(const tagged of [false,true])test(`Colors and percentages static or tag fallback: ${tagged}`,async()=>{
 const color=value=>tagged?tagProperty('Color',value):staticProperty(value);
 const html=await render({analog:staticProperty(true),foregroundColor:color(hmiColorFromArgb(255,0,0,255)),
 ticksColor:color(hmiColorFromArgb(255,255,0,0)),handFillColor:color(hmiColorFromArgb(255,0,255,0)),
 hourHandLengthPercent:tagged?tagProperty('Length',80):staticProperty(80),hourHandHalfWidthPercent:staticProperty(20)});
 assert.ok(html.includes('fill="#FF0000"'));assert.ok(html.includes('stroke="#0000FF" fill="#00FF00"'));
 assert.ok(html.includes('points="50,49.616 42.32,44.24 50,11.6 57.68,44.24 50,49.616"'));
});
