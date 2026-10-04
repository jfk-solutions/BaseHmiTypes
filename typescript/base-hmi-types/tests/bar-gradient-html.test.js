import test from 'node:test';
import assert from 'node:assert/strict';
import {HmiBar,HmiBarFillStyle,HmiFillDirection,HmiGradientDirection,HmiLayer,HmiScreen,HmiScreenToHtmlConverter,hmiColorFromArgb,staticProperty,tagProperty} from '../dist/index.js';

function createBar() {
  return Object.assign(new HmiBar(), {
    width:staticProperty(100),height:staticProperty(40),beginValue:staticProperty(0),endValue:staticProperty(100),value:staticProperty(25),fillDirection:staticProperty(HmiFillDirection.Right),
    fillStyle:staticProperty(HmiBarFillStyle.Gradient),fillColor:staticProperty(hmiColorFromArgb(255,128,128,128)),
    fillEndColor:staticProperty(hmiColorFromArgb(255,0,255,0)),trackColor:staticProperty(hmiColorFromArgb(255,32,64,96)),
  });
}
async function render(bar) {
  const layer=new HmiLayer(),screen=new HmiScreen();layer.items.push(bar);screen.layers.push(layer);
  return new HmiScreenToHtmlConverter().convertAsync(screen);
}
for(const gradient of Object.values(HmiGradientDirection))
for(const direction of [HmiFillDirection.Up,HmiFillDirection.Down,HmiFillDirection.Left,HmiFillDirection.Right])
for(const tagged of [false,true])for(let priority=0;priority<3;priority++){
  test('Renders gradient in value rectangle with fill priorities '+[gradient,direction,tagged,priority],async()=>{
    const bar=createBar();bar.fillGradientDirection=gradient;bar.fillDirection=staticProperty(direction);
    bar.originValue=tagged?staticProperty(50):undefined;
    bar.fillEndColor=tagged?tagProperty('Gradient.End',hmiColorFromArgb(255,0,255,0)):staticProperty(hmiColorFromArgb(255,0,255,0));
    bar.fillGradientStop=tagged?tagProperty('Gradient.Stop',80):staticProperty(80);
    bar.enabled=staticProperty(priority!==2);bar.useDisabledForegroundColor=staticProperty(true);bar.disabledForegroundColor=staticProperty(hmiColorFromArgb(255,255,0,0));
    bar.useThresholdFillColors=staticProperty(priority===1);bar.thresholds.push({value:staticProperty(50),color:staticProperty(hmiColorFromArgb(255,255,255,0))});
    const html=await render(bar),fill=html.match(/<span[^>]*data-hmi-bar-origin-fill[^>]*>/u)?.[0]??'';
    const axes={HorizontalFromRight:'to left',VerticalFromBottom:'to top',VerticalFromTop:'to bottom',VerticalFromCenter:'to bottom',DiagonalUp:'to top right',DiagonalDown:'to bottom right'};
    const stops=[HmiGradientDirection.HorizontalFromCenter,HmiGradientDirection.VerticalFromCenter].includes(gradient)
      ?'#00FF00 10%, currentColor 50%, #00FF00 90%':'currentColor 0%, #00FF00 80%';
    assert.ok(fill.includes(`background-image: linear-gradient(${axes[gradient]??'to right'}, ${stops});`));
    assert.ok(fill.includes(`color: ${priority===2?'#FF0000':priority===1?'#FFFF00':'#808080'} !important;`));
    assert.ok(fill.includes([HmiFillDirection.Up,HmiFillDirection.Down].includes(direction)?'height: 25%;':'width: 25%;'));
    assert.ok(fill.includes(`data-origin-value="${tagged?'50':'0'}"`));
    assert.ok(html.includes('value="25"'));assert.ok(html.includes('--hmi-bar-track-background: #204060 !important;'));
  });
}
for(const [stop,expected] of [[-1,'0'],[200,'100'],[NaN,'100'],[Infinity,'100']]){
  test('Clamps or defaults gradient stop '+stop,async()=>{
    const bar=createBar();bar.fillGradientStop=staticProperty(stop);bar.fillGradientAxis='VERTICAL';
    assert.ok((await render(bar)).includes(`linear-gradient(to bottom, currentColor 0%, #00FF00 ${expected}%);`));
  });
}
test('Gradient defaults and missing end color are safe',async()=>{
  const bar=createBar();bar.fillGradientAxis='unexpected); invalid';
  assert.ok((await render(bar)).includes('linear-gradient(to right, currentColor 0%, #00FF00 100%);'));
  bar.fillEndColor=undefined;assert.ok(!(await render(bar)).includes('background-image: linear-gradient'));
  bar.fillEndColor=staticProperty(hmiColorFromArgb(255,0,255,0));bar.fillStyle=staticProperty(HmiBarFillStyle.Solid);
  assert.ok(!(await render(bar)).includes('background-image: linear-gradient'));
});
