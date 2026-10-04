import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";

// Execute the compiled sampler with controlled layout and observer callbacks.
// Native color fidelity is covered separately by the GDI+ browser reference.
const source = readFileSync(new URL("../dist/bar-gradient.js", import.meta.url), "utf8").replace(/export\s*\{\s*\};?/u, "");
function fixture() {
  let scroll = 0, writes = 0, mutation;
  const frames = [], listeners = {};
  const screen = { offsetWidth: 100, offsetHeight: 40,
    getBoundingClientRect: () => ({left:0,top:-scroll,width:100,height:40}) };
  const ramps = [16,64,256].map(count => Array.from({length:count+1}, () => 0xff123456));
  const fill = {
    dataset:{hmiBarGradientMode:"0",hmiBarGradientSigma:"false",hmiBarGradientRamps:JSON.stringify(ramps)},
    style:{}, closest:()=>screen, append(canvas){this.canvas=canvas;},
    getBoundingClientRect:()=>({left:3,top:5-scroll,right:16,bottom:16-scroll,width:13,height:11})
  };
  const context = {
    document:{documentElement:{},querySelectorAll:()=>[fill],addEventListener:(name,fn)=>listeners[name]=fn,
      createElement:()=>({dataset:{},style:{},setAttribute(){},getContext:()=>({
        createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){writes++;}
      })})},
    window:{innerWidth:100,innerHeight:40,devicePixelRatio:1,addEventListener:(name,fn)=>listeners[name]=fn},
    requestAnimationFrame:fn=>frames.push(fn),
    ResizeObserver:class{observe(){}disconnect(){}},
    MutationObserver:class{constructor(fn){mutation=fn;}observe(){}},
    matchMedia:()=>({addEventListener(){}})
  };
  runInNewContext(source,context);
  const flush=()=>{for(let guard=0;frames.length&&guard<10;guard++)frames.shift()();};
  flush();
  return {fill,flush,get writes(){return writes;},scroll(value){scroll=value;listeners.scroll();flush();},
    mutate(){mutation([{type:"attributes"}]);flush();}};
}

test("native gradient returns after scrolling away and back to identical geometry",()=>{
  const f=fixture();assert.equal(f.fill.canvas.style.display,"block");
  f.scroll(100);assert.equal(f.fill.canvas.style.display,"none");
  f.scroll(0);assert.equal(f.fill.canvas.style.display,"block");
  assert.equal(f.fill.canvas.width,13);assert.equal(f.fill.canvas.height,11);
});
for(const [attribute,invalid] of [["hmiBarGradientMode","4"],["hmiBarGradientRamps","invalid JSON"],["hmiBarGradientRamps","[]"]]){
  test(`native gradient recovers when ${attribute} restores its cached value (${invalid})`,()=>{
    const f=fixture(),original=f.fill.dataset[attribute];
    f.fill.dataset[attribute]=invalid;f.mutate();assert.equal(f.fill.canvas.style.display,"none");
    f.fill.dataset[attribute]=original;f.mutate();assert.equal(f.fill.canvas.style.display,"block");
  });
}
test("native gradient still skips painting unchanged visible geometry",()=>{
  const f=fixture(),writes=f.writes;f.mutate();f.scroll(0);assert.equal(f.writes,writes);
});
