import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiBar,HmiBarFillStyle,HmiFillDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty} from '../dist/index.js';
for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])
for(const origin of [false,true])for(const rows of ['55AA55AA55AA55AA','','zz00000000000000','0000'])for(let priority=0;priority<3;priority++){
 test('Renders only valid rows and retains color priority '+[direction,origin,rows,priority],async()=>{
  const bar=Object.assign(new HmiBar(),{beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25),width:staticProperty(100),height:staticProperty(80),
   fillDirection:staticProperty(direction),originValue:origin?staticProperty(50):undefined,fillStyle:staticProperty(HmiBarFillStyle.BitmapPattern),bitmapPatternRows:staticProperty(rows),
   patternColor:staticProperty(hmiColorFromArgb(255,0,255,0)),fillColor:staticProperty(hmiColorFromArgb(255,128,128,128)),enabled:staticProperty(priority!==2),useDisabledForegroundColor:staticProperty(true),
   disabledForegroundColor:staticProperty(hmiColorFromArgb(255,255,0,0)),useThresholdFillColors:staticProperty(priority!==0)});
  bar.thresholds.push({value:staticProperty(50),color:staticProperty(hmiColorFromArgb(255,255,255,0))});
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(bar);
  const html=await new HmiScreenToHtmlConverter().convertAsync(screen),fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??'';
  assert.equal(fill.includes('data-hmi-bar-bitmap='),/^[0-9a-f]{16}$/i.test(rows));
  if(rows.startsWith('55')){
   assert.ok(fill.includes('data-hmi-bar-bitmap="55aa55aa55aa55aa"'));assert.ok(fill.includes('data-hmi-bar-pattern-color="#00FF00"'));
   assert.ok(fill.includes(`color: ${priority===2?'#FF0000':priority===1?'#FFFF00':'#808080'} !important;`));
  }
  assert.ok(html.includes('data-hmi-screen="true"'));
 });
}
