import type {HmiRecipeSparseArray} from './HmiRecipeSparseArray.js';
/** Documented TIA engineering CSV profile. Runtime-native layouts are version dependent. */
export interface HmiRecipeCsvRecord { id:number; name?:string; values:Record<string,string>; arrayValues?:Record<string,string[]>; sparseArrayValues?:Record<string,HmiRecipeSparseArray>; binaryValues?:Record<string,Record<string,string>>; lastUser:string; lastAccess:string; }
export class HmiRecipeCsv {
  static parse(text:string,parameters:readonly string[],separator=';'):HmiRecipeCsvRecord[] {
    this.validate(parameters,separator);
    if(typeof text!=='string' || text.length>16*1024*1024)throw new Error('Recipe CSV exceeds the text limit');
    if(text.startsWith('\uFEFF'))text=text.slice(1);
    const rows:string[][]=[];let row:string[]=[],field='',quoted=false,closed=false;
    const cell=()=>{row.push(field);field='';closed=false;if(row.length>parameters.length+3)throw new Error('Too many recipe CSV columns');};
    const line=()=>{cell();rows.push(row);row=[];if(rows.length>100001)throw new Error('Too many recipe CSV records');};
    for(let i=0;i<text.length;i++) {
      const c=text[i]!;
      if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
      if(c===separator){cell();continue;}
      if(c==='\r' || c==='\n'){if(c==='\r' && text[i+1]==='\n')i++;line();continue;}
      if(closed)throw new Error('Characters after quoted recipe CSV field');
      if(c==='"'){if(field.length)throw new Error('Quote inside unquoted recipe CSV field');quoted=true;}else field+=c;
    }
    if(quoted)throw new Error('Unterminated recipe CSV field');
    if(field.length || closed || row.length)line();
    const header=['ID',...parameters,'LastUser','LastAccess[UTC]'];
    if(!rows.length || rows[0]!.length!==header.length || rows[0]!.some((v,i)=>v!==header[i]))throw new Error('Recipe CSV schema mismatch');
    const ids=new Set<number>();
    return rows.slice(1).map(cells=>{
      if(cells.length!==header.length || !/^[1-9]\d*$/.test(cells[0]!))throw new Error('Invalid recipe CSV record');
      const id=Number(cells[0]);if(!Number.isSafeInteger(id) || ids.has(id))throw new Error('Duplicate or invalid recipe CSV ID');ids.add(id);
      const values:Record<string,string>=Object.create(null);parameters.forEach((p,i)=>values[p]=cells[i+1]!);
      return {id,values,lastUser:cells.at(-2)!,lastAccess:cells.at(-1)!};
    });
  }
  static write(records:readonly HmiRecipeCsvRecord[],parameters:readonly string[],separator=';'):string {
    if(records.some(record=>[record.arrayValues,record.sparseArrayValues,record.binaryValues].some(values=>values && Object.keys(values).length)))throw new Error('Engineering CSV does not define array columns');
    this.validate(parameters,separator);if(records.length>100000)throw new Error('Too many recipe CSV records');
    let length=(records.length+1)*(parameters.length+4);
    const quote=(value:string)=>{if(typeof value!=='string')throw new Error('Recipe CSV requires string cells');length+=value.length+2;for(const c of value)if(c==='"')length++;if(length>16*1024*1024)throw new Error('Recipe CSV exceeds the text limit');return '"'+value.replaceAll('"','""')+'"';};
    const rows=[['ID',...parameters,'LastUser','LastAccess[UTC]'],...records.map(r=>[String(r.id),...parameters.map(p=>r.values[p]!),r.lastUser,r.lastAccess])];
    const text=rows.map(row=>row.map(quote).join(separator)).join('\r\n')+'\r\n';
    this.parse(text,parameters,separator);return text;
  }
  private static validate(parameters:readonly string[],separator:string):void {
    if(![';',',','\t'].includes(separator) || parameters.length>10000 || parameters.some(p=>typeof p!=='string' || !p || ['ID','LastUser','LastAccess[UTC]'].includes(p)) || new Set(parameters).size!==parameters.length)throw new Error('Invalid recipe CSV schema or separator');
  }
}
