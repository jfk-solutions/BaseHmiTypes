/** Overrides only the root viewport policy of an embedded SVG copy; never changes its source. */
export function tryOverrideSvgImageAspectRatio(uri: string,keep: boolean): string|undefined {
  const prefix='data:image/svg+xml';
  if(!uri.toLowerCase().startsWith(prefix)||uri.length<=prefix.length||![';',','].includes(uri[prefix.length]!))return uri;
  const comma=uri.indexOf(',');if(comma<0)return undefined;
  let text: string;
  try {
    if(uri.slice(0,comma).toLowerCase().endsWith(';base64')){
      const binary=atob(uri.slice(comma+1)),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));text=decode(bytes);
    } else text=decodeURIComponent(uri.slice(comma+1));
  } catch {return undefined;}
  let at=0;
  const space=()=>{while(at<text.length&&/[\s\u0085]/u.test(text[at]!))at++;};
  const starts=(value: string)=>text.startsWith(value,at);
  const name=(c: string)=>/[\p{L}\p{Nd}_:.-]/u.test(c);
  space();
  while(starts('<?')||starts('<!--')){
    const marker=starts('<?')?'?>':'-->',end=text.indexOf(marker,at+2);if(end<0)return undefined;
    // The rendered copy is UTF-8, regardless of the source declaration.
    if(starts('<?xml')&&at+5<text.length&&/[\s\u0085]/u.test(text[at+5]!))text=text.slice(0,at)+text.slice(end+marker.length);
    else at=end+marker.length;space();
  }
  if(at>=text.length||text[at++]!=='<')return undefined;
  let start=at;while(at<text.length&&name(text[at]!))at++;
  const root=text.slice(start,at);if(root.slice(root.lastIndexOf(':')+1)!=='svg')return undefined;
  let valueStart: number|undefined,valueEnd=0,insert=0;
  for(;;){
    const beforeSpace=at;space();if(at>=text.length)return undefined;
    if(text[at]==='>'||text[at]==='/'){insert=at;if(text[at]==='/'&&text[at+1]!=='>')return undefined;break;}
    if(at===beforeSpace)return undefined;
    start=at;while(at<text.length&&name(text[at]!))at++;if(at===start)return undefined;
    const attribute=text.slice(start,at);space();if(at>=text.length||text[at++]!=='=')return undefined;
    space();if(at>=text.length||!['\'', '"'].includes(text[at]!))return undefined;
    const quote=text[at++]!,begin=at,end=text.indexOf(quote,at);if(end<0)return undefined;
    if(attribute==='preserveAspectRatio'){if(valueStart!==undefined)return undefined;valueStart=begin;valueEnd=end;}at=end+1;
  }
  const policy=keep?'xMidYMid meet':'none';
  text=valueStart!==undefined?text.slice(0,valueStart)+policy+text.slice(valueEnd):text.slice(0,insert)+` preserveAspectRatio="${policy}"`+text.slice(insert);
  let binary='';for(const value of new TextEncoder().encode(text))binary+=String.fromCharCode(value);
  return `${prefix};base64,${btoa(binary)}`;
}
function decode(bytes: Uint8Array): string {
  if((bytes[0]===255&&bytes[1]===254&&bytes[2]===0&&bytes[3]===0)||(bytes[0]===0&&bytes[1]===0&&bytes[2]===254&&bytes[3]===255)){
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),little=bytes[0]===255;let text='';
    for(let at=4;at<bytes.length;at+=4){const point=at+4<=bytes.length?view.getUint32(at,little):0xfffd;text+=String.fromCodePoint(point>0x10ffff||(point>=0xd800&&point<=0xdfff)?0xfffd:point);}return text;
  }
  const encoding=bytes[0]===255&&bytes[1]===254?'utf-16le':bytes[0]===254&&bytes[1]===255?'utf-16be':'utf-8';
  return new TextDecoder(encoding).decode(bytes);
}
