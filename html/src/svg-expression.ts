import { parseExpressionAt } from "acorn";
import { Converter } from "../node_modules/@node-projects/svghmi.webcomponent/dist/Converter.js";
import * as comparison from "../node_modules/@node-projects/svghmi.webcomponent/dist/Comparison.js";
import * as logic from "../node_modules/@node-projects/svghmi.webcomponent/dist/Logic.js";

type Node = Record<string, any>;
type SvgContext = { [name:string]:unknown; _svgHmiProperties:Map<string,{name:string;default:unknown}>; _svgHmiLocalDefs:Map<string,{value:unknown}> };
const cache = new Map<string,Node>();
const math = Object.fromEntries(Object.getOwnPropertyNames(Math).map(name=>[name,(Math as any)[name]]));
const converters = Object.fromEntries(Object.getOwnPropertyNames(Converter).filter(name=>typeof (Converter as any)[name]==="function").map(name=>[name,(Converter as any)[name]]));
const builtins = { ...comparison, ...logic, ...math, abs:Math.abs, round:Math.round, floor:Math.floor, ceil:Math.ceil, sin:Math.sin, asin:Math.asin, cos:Math.cos, acos:Math.acos, tan:Math.tan, atan:Math.atan, atan2:Math.atan2, log:Math.log, log10:Math.log10, sqrt:Math.sqrt, pow:Math.pow,
  rad2deg:(x:number)=>x*180/Math.PI, deg2rad:(x:number)=>x*Math.PI/180, Number, String, Boolean, Math:math, Converter:converters };
const callable = new Set([...Object.values(builtins), ...Object.values(math), ...Object.values(converters)].filter(value=>typeof value==='function'));
const forbidden = new Set(['constructor','prototype','__proto__']);

/** Evaluate only SVG expressions and known pure helpers; never execute project JavaScript. */
export function evaluateSvgExpression(code:string, context:Record<string,unknown>):unknown {
  if (code.length>8192) throw new RangeError('SVG expression limit exceeded');
  let ast=cache.get(code);
  if (!ast) {
    ast=parseExpressionAt(code,0,{ecmaVersion:2022,preserveParens:true}) as unknown as Node;
    if (code.slice(ast.end).trim()) throw new Error('SVG binding requires one expression');
    if(cache.size>=128)cache.delete(cache.keys().next().value!);cache.set(code,ast);
  }
  let steps=0;
  const member=(object:unknown,key:unknown):unknown=>{
    if(typeof key!=='string'&&typeof key!=='number')throw new Error('Invalid SVG member');
    if(forbidden.has(String(key))||!object||!Object.prototype.hasOwnProperty.call(object,key))throw new Error('Unknown SVG member');
    return (object as Record<string,unknown>)[String(key)];
  };
  const run=(node:Node,depth=0):any=>{
    if(++steps>4096||depth>64)throw new RangeError('SVG evaluation limit exceeded');
    const child=(n:Node)=>run(n,depth+1);
    switch(node.type){
      case 'ParenthesizedExpression': return child(node.expression);
      case 'Literal': if(node.regex||node.bigint)throw new Error('Unsupported SVG literal');return node.value;
      case 'Identifier': if(node.name==='undefined')return undefined;return member(context,node.name);
      case 'MemberExpression': return member(child(node.object),node.computed?child(node.property):node.property.name);
      case 'ConditionalExpression': return child(node.test)?child(node.consequent):child(node.alternate);
      case 'LogicalExpression': {const a=child(node.left);return node.operator==='&&'?a&&child(node.right):node.operator==='||'?a||child(node.right):a??child(node.right);}
      case 'UnaryExpression': {const a=child(node.argument);switch(node.operator){case '+':return +a;case '-':return -a;case '!':return !a;case '~':return ~a;default:throw new Error('Unsupported SVG unary operator');}}
      case 'BinaryExpression': {const a=child(node.left),b=child(node.right);switch(node.operator){
        case '+':return a+b;case '-':return a-b;case '*':return a*b;case '/':return a/b;case '%':return a%b;case '**':return a**b;
        case '==':return a==b;case '!=':return a!=b;case '===':return a===b;case '!==':return a!==b;case '<':return a<b;case '<=':return a<=b;case '>':return a>b;case '>=':return a>=b;
        case '&':return a&b;case '|':return a|b;case '^':return a^b;case '<<':return a<<b;case '>>':return a>>b;case '>>>':return a>>>b;
        default:throw new Error('Unsupported SVG binary operator');}}
      case 'CallExpression': {const fn=child(node.callee);if(!callable.has(fn)||node.arguments.length>128)throw new Error('Unsupported SVG function');return fn(...node.arguments.map(child));}
      default:throw new Error(`Unsupported SVG expression: ${node.type}`);
    }
  };
  return run(ast);
}

export function evalWithContext(svg:SvgContext,code:string):unknown {
  try {
    const ParamProps=Object.create(null),LocalProps=Object.create(null);
    for(const definition of svg._svgHmiProperties.values())ParamProps[definition.name]=svg[definition.name]??definition.default;
    for(const [name,definition] of svg._svgHmiLocalDefs)LocalProps[name]=definition.value;
    const context={...builtins,ParamProps,LocalProps};
    if(code.includes('{{'))return code.replace(/\{\{([\s\S]*?)\}\}/g,(_match,expression)=>String(evaluateSvgExpression(expression,context)??''));
    return evaluateSvgExpression(code,context);
  }catch(error){console.warn('SVG binding:',error);return undefined;}
}
