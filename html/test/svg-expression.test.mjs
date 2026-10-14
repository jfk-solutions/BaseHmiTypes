import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateSvgExpression,evalWithContext } from '../dist/svg-expression.js';
test('SVG formulas evaluate parameters, locals, helper calls and short circuit expressions',()=>{
 const svg={Value:42,_svgHmiProperties:new Map([['value',{name:'Value',default:25}]]),_svgHmiLocalDefs:new Map([['Angle',{value:Math.PI}]])};
 assert.equal(evalWithContext(svg,'ParamProps.Value + round(sin(LocalProps.Angle))'),42);
 assert.equal(evalWithContext(svg,'Converter.Bounds(ParamProps.Value, 0, 10)'),10);
 assert.equal(evalWithContext(svg,'ParamProps.Value > 10 ? "large" : "small"'),'large');
 assert.equal(evalWithContext(svg,'false && window.location'),false);
 assert.equal(evalWithContext(svg,'((ParamProps.Value) / (100) * 100)'),42);
 assert.equal(evalWithContext(svg,'M100,155a55,55,0,{{ParamProps.Value}},1,{{LocalProps.Angle}}'),'M100,155a55,55,0,42,1,'+Math.PI);
 assert.equal(evalWithContext(svg,'{{ParamProps.Value}}'),'42');
});
test('SVG formulas reject globals, prototypes, mutation, arbitrary calls and trailing code',()=>{
 for(const code of ['window.location','ParamProps.constructor','ParamProps["__proto__"]','ParamProps.Value=1','(()=>1)()','1; globalThis.x=1','new Function("return 1")','ParamProps.call()'])
  assert.throws(()=>evaluateSvgExpression(code,{ParamProps:{Value:42,call:()=>1}}));
});
