import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiBar,HmiBarFillStyle,HmiFillDirection,HmiGradientDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty,tagProperty} from '../dist/index.js';

async function render(bar) {
  const screen=new HmiScreen(),layer=new HmiLayer();screen.layers.push(layer);layer.items.push(bar);
  return new HmiScreenToHtmlConverter().convertAsync(screen);
}
for(const mode of [...Array.from({length:16},(_,i)=>i),-1,65535])
for(const [ordinal,direction] of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right].entries())
for(const sigma of [false,true])for(const tagged of [false,true]){
  test('Preserves native gradient modes, palettes and priority '+[mode,direction,sigma,tagged],async()=>{
    const priority=(mode+65536+ordinal)%3,end=hmiColorFromArgb(tagged?128:255,0,255,0);
    const bar=Object.assign(new HmiBar(),{
      width:staticProperty(100),height:staticProperty(80),beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25),
      originValue:tagged?staticProperty(50):undefined,fillDirection:staticProperty(direction),fillStyle:staticProperty(HmiBarFillStyle.Gradient),
      gradientMode:tagged?tagProperty('Gradient.Mode',mode):staticProperty(mode),gradientSigmaBlend:tagged?tagProperty('Gradient.Sigma',sigma):staticProperty(sigma),
      fillEndColor:tagged?tagProperty('Gradient.End',end):staticProperty(end),fillGradientDirection:HmiGradientDirection.DiagonalUp,fillGradientAxis:'vertical',fillGradientStop:staticProperty(0),
      fillColor:staticProperty(hmiColorFromArgb(255,128,128,128)),patternColor:staticProperty(hmiColorFromArgb(255,0,0,255)),trackColor:staticProperty(hmiColorFromArgb(255,32,64,96)),
      enabled:staticProperty(priority!==2),useDisabledForegroundColor:staticProperty(true),disabledForegroundColor:staticProperty(hmiColorFromArgb(255,255,0,0)),useThresholdFillColors:staticProperty(priority===1)
    });
    bar.thresholds.push({value:staticProperty(50),color:staticProperty(hmiColorFromArgb(255,255,255,0))});
    const html=await render(bar),fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??'';
    assert.ok(fill.includes(`data-hmi-bar-gradient-mode="${mode}"`));assert.ok(fill.includes('background-color: transparent;'));assert.ok(!fill.includes('linear-gradient'));
    assert.equal(fill.includes('data-hmi-bar-gradient-ramps='),mode>=0&&mode<=3);if(mode<0||mode>3)return;
    assert.ok(fill.includes(`data-hmi-bar-gradient-sigma="${sigma}"`));
    const ramps=JSON.parse(fill.match(/data-hmi-bar-gradient-ramps="([^"]+)"/u)[1]);assert.deepEqual(ramps.map(r=>r.length),[17,65,257]);
    const start=priority===2?0xffff0000:priority===1?0xffffff00:0xff808080,endPixel=tagged?0x80008000:0xff00ff00;
    for(const ramp of ramps){assert.equal(ramp[0],start);assert.equal(ramp.at(-1),sigma?start:endPixel);if(sigma)assert.equal(ramp[(ramp.length-1)/2],endPixel);}
    assert.ok(fill.includes([HmiFillDirection.Up,HmiFillDirection.Down].includes(direction)?'height: 25%;':'width: 25%;'));
    assert.ok(html.includes('--hmi-bar-track-background: #204060 !important;'));
  });
}
test('Missing native end uses pattern color and missing pattern uses black',async()=>{
  const bar=Object.assign(new HmiBar(),{width:staticProperty(100),height:staticProperty(40),beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(50),
    fillStyle:staticProperty(HmiBarFillStyle.Gradient),gradientMode:staticProperty(0),foregroundColor:staticProperty(hmiColorFromArgb(255,128,128,128)),patternColor:staticProperty(hmiColorFromArgb(255,0,0,255))});
  const ramps=async()=>JSON.parse((await render(bar)).match(/data-hmi-bar-gradient-ramps="([^"]+)"/u)[1]);
  let values=await ramps();assert.equal(values[0][0],0xff808080);assert.equal(values[0].at(-1),0xff0000ff);
  bar.patternColor=undefined;values=await ramps();assert.equal(values[0].at(-1),0xff000000);
});
