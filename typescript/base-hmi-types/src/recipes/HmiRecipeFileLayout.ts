import {HmiRecipeStructuredValue,HmiRecipeStructuredEntry,HmiRecipeValueKind} from './HmiRecipeStructuredValue.js';

export interface HmiRecipeFilePathSegment { member?:string; index?:number; }
export interface HmiRecipeFileField { name:string; path:readonly HmiRecipeFilePathSegment[]; }
interface Node { kind?:HmiRecipeValueKind; field?:string; children:Map<string|number,Node>; }
function schema(fields:readonly HmiRecipeFileField[]):Node {
  if(!Array.isArray(fields) || !fields.length || fields.length>10000)throw new Error('Invalid recipe file layout');
  const root:Node={children:new Map()},names=new Set<string>();
  for(const field of fields) {
    if(typeof field.name!=='string' || !field.name || names.has(field.name) || !Array.isArray(field.path) || !field.path.length || field.path.length>32)throw new Error('Invalid or duplicate recipe file field');
    names.add(field.name);let node=root;
    for(const segment of field.path) {
      const member=segment.member,index=segment.index;
      if((member===undefined)===(index===undefined) || member!==undefined && (typeof member!=='string' || !member) || index!==undefined && (!Number.isSafeInteger(index) || index<0 || index>=10000))throw new Error('Invalid recipe file path');
      const kind=member!==undefined?HmiRecipeValueKind.Map:HmiRecipeValueKind.Array,key=member??index!;
      if(node.field!==undefined || node.kind!==undefined && node.kind!==kind)throw new Error('Conflicting recipe file paths');
      node.kind=kind;let child=node.children.get(key);if(!child){child={children:new Map()};node.children.set(key,child);}node=child;
    }
    if(node.field!==undefined || node.children.size)throw new Error('Conflicting recipe file paths');
    node.kind=HmiRecipeValueKind.Scalar;node.field=field.name;
  }
  const check=(node:Node)=>{
    if(node.kind===HmiRecipeValueKind.Array)for(let i=0;i<node.children.size;i++)if(!node.children.has(i))throw new Error('Sparse recipe file array layout');
    for(const child of node.children.values())check(child);
  };check(root);return root;
}
/** Explicit scalar leaf rows for detached structures and dense arrays. Never infers PLC bounds. */
export class HmiRecipeFileLayout {
  static flatten(value:HmiRecipeStructuredValue,fields:readonly HmiRecipeFileField[]):Record<string,string> {
    const result:Record<string,string>=Object.create(null);
    const visit=(node:Node,current:HmiRecipeStructuredValue)=>{
      if(!current || current.kind!==node.kind)throw new Error('Recipe file value shape mismatch');
      if(node.field!==undefined) {
        if(typeof current.value!=='string' || current.entries.length || current.items.length)throw new Error('Recipe file leaf must be scalar text');
        result[node.field]=current.value;return;
      }
      if(node.kind===HmiRecipeValueKind.Array) {
        if(current.entries.length || current.items.length!==node.children.size)throw new Error('Recipe file array shape mismatch');
        for(const [key,child] of node.children)visit(child,current.items[key as number]!);
      } else {
        if(current.items.length || current.entries.length!==node.children.size)throw new Error('Recipe file structure shape mismatch');
        const entries=new Map(current.entries.map(entry=>[entry.key,entry.value]));
        if(current.items.length || entries.size!==current.entries.length || entries.size!==node.children.size)throw new Error('Recipe file structure shape mismatch');
        for(const [key,child] of node.children)visit(child,entries.get(key as string)!);
      }
    };visit(schema(fields),value);return result;
  }
  static expand(values:Readonly<Record<string,string>>,fields:readonly HmiRecipeFileField[]):HmiRecipeStructuredValue {
    const root=schema(fields);
    if(!values || Object.keys(values).length!==fields.length || Object.keys(values).some(name=>!fields.some(field=>field.name===name)))throw new Error('Recipe file leaf schema mismatch');
    const visit=(node:Node):HmiRecipeStructuredValue=>{
      const result=new HmiRecipeStructuredValue();result.kind=node.kind!;
      if(node.field!==undefined){const value=values[node.field];if(typeof value!=='string')throw new Error('Recipe file leaf must be scalar text');result.value=value;}
      else if(node.kind===HmiRecipeValueKind.Array)for(let i=0;i<node.children.size;i++)result.items.push(visit(node.children.get(i)!));
      else for(const [key,child] of node.children){const entry=new HmiRecipeStructuredEntry();entry.key=key as string;entry.value=visit(child);result.entries.push(entry);}
      return result;
    };return visit(root);
  }
}
