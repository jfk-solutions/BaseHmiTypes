/** Stored array positions are zero based; absent members remain absent until an explicit baseline is supplied. */
export class HmiRecipeSparseArray {
  length?:number;
  readonly values:Record<number,string|undefined>=Object.create(null);
  static resolve(patch:HmiRecipeSparseArray,baseline:readonly string[]):string[] {
    if(!Number.isSafeInteger(patch.length) || patch.length!<1 || patch.length!>1000000 || !Array.isArray(baseline) || baseline.length!==patch.length)throw new Error('Sparse recipe array requires a complete baseline');
    const result=Array.from(baseline);
    if(result.some(value=>typeof value!=='string'))throw new Error('Sparse recipe baseline has missing members');
    for(const key of Object.keys(patch.values)) {
      if(!/^(0|[1-9]\d*)$/.test(key) || Number(key)>=patch.length! || typeof patch.values[Number(key)]!=='string')throw new Error('Invalid or unavailable sparse recipe array member');
      result[Number(key)]=patch.values[Number(key)]!;
    }
    return result;
  }
}
