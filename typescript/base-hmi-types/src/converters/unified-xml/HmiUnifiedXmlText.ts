const n = "urn:s7mcp:wincc-unified:2";
const xml = "http://www.w3.org/XML/1998/namespace";
const xmlns = "http://www.w3.org/2000/xmlns/";
const blocks = new Set(["p","div","ul","ol","li","dl","dt","dd","table","thead","tbody","tfoot","tr","td","th",
  "h1","h2","h3","h4","h5","h6","pre","blockquote","hr","section","article","header","footer","main","aside","nav",
  "address","figure","figcaption","form","fieldset","details","summary","menu","center"]);

export function isFormattedTextAttribute(attribute: Attr): boolean {
  return attribute.namespaceURI === xml || !attribute.namespaceURI &&
    (attribute.localName === "paragraph" || attribute.localName.startsWith("body-"));
}

/** Put native formatted content directly in the language entry, without body or a redundant paragraph. */
export function writeUnifiedText(item: Element, value: string): void {
  item.removeAttribute("text");
  while(item.firstChild) item.removeChild(item.firstChild);
  for(const attribute of Array.from(item.attributes).filter(isFormattedTextAttribute)) item.removeAttributeNode(attribute);
  let body: Element | undefined;
  if(value.startsWith("<body") && !/<!DOCTYPE|<!ENTITY/i.test(value) && !/&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9a-fA-F]+;)/.test(value)) {
    try {
      const doc = new DOMParser().parseFromString(protectWhitespace(value),"application/xml");
      if(!doc.getElementsByTagNameNS("*","parsererror").length && doc.documentElement.localName === "body" && !doc.documentElement.namespaceURI) body=doc.documentElement;
    } catch { /* Literal strings that resemble markup remain plain text. */ }
  }
  if(!body) { item.setAttribute("text",value); return; }
  for(const attribute of Array.from(body.attributes).filter(a=>a.namespaceURI!==xmlns)) {
    if(attribute.namespaceURI===xml) item.setAttributeNS(xml,attribute.name,attribute.value);
    else if(!attribute.namespaceURI) item.setAttribute("body-"+attribute.localName,attribute.value);
    else throw new Error("Unsupported namespace on formatted body attribute.");
  }
  let nodes=Array.from(body.childNodes);
  const p=nodes[0] as Element|undefined;
  const paragraph=nodes.length===1 && p?.nodeType===1 && p.localName==="p" && !p.namespaceURI && !p.attributes.length;
  if(paragraph) nodes=Array.from(p!.childNodes);
  const inferred=!nodes.some(node=>node.nodeType===1&&blocks.has((node as Element).localName.toLowerCase()));
  if(paragraph!==inferred)item.setAttribute("paragraph",paragraph?"True":"False");
  for(const node of nodes)item.appendChild(copy(node,item.ownerDocument!,n));
}

export function readUnifiedText(item: Element): string {
  const nodes=Array.from(item.childNodes).filter(node=>node.nodeType!==3||node.nodeValue!=="");
  const metadata=Array.from(item.attributes).filter(isFormattedTextAttribute);
  if(item.hasAttribute("text")) {
    if(nodes.length||metadata.length)throw new Error("Plain text and formatted content cannot both be supplied.");
    return item.getAttribute("text")!;
  }
  const flag=item.getAttribute("paragraph");
  if(item.hasAttribute("paragraph")&&flag!=="True"&&flag!=="False")throw new Error("Invalid paragraph flag.");
  const paragraph=flag==="True"||!item.hasAttribute("paragraph")&&!nodes.some(node=>node.nodeType===1&&blocks.has((node as Element).localName.toLowerCase()));
  const doc=item.ownerDocument!.implementation.createDocument(null,"body",null),body=doc.documentElement;
  for(const attribute of metadata.filter(a=>a.localName!=="paragraph"||!!a.namespaceURI)) {
    if(attribute.namespaceURI===xml)body.setAttributeNS(xml,attribute.name,attribute.value);
    else {
      const name=attribute.localName.slice(5);
      if(!name)throw new Error("Missing formatted body attribute name.");
      body.setAttribute(name,attribute.value);
    }
  }
  const parent=paragraph?doc.createElement("p"):body;
  if(paragraph)body.appendChild(parent);
  for(const node of nodes)parent.appendChild(copy(node,doc,""));
  return serialize(body);
}

function copy(node: Node, doc: Document, target: string): Node {
  if(node.nodeType===1) {
    const source=node as Element;
    if(source.namespaceURI && source.namespaceURI!==n)throw new Error("Unsupported namespace on HTML formatting element.");
    const result=doc.createElementNS(target||null,source.localName);
    for(const attribute of Array.from(source.attributes).filter(a=>a.namespaceURI!==xmlns)) {
      if(attribute.namespaceURI && attribute.namespaceURI!==xml)throw new Error("Unsupported namespace on HTML formatting attribute.");
      result.setAttributeNS(attribute.namespaceURI||null,attribute.name,attribute.value);
    }
    for(const child of Array.from(source.childNodes))result.appendChild(copy(child,doc,target));
    return result;
  }
  if(node.nodeType===3||node.nodeType===4)return doc.createTextNode(node.nodeValue??"");
  if(node.nodeType===8)return doc.createComment(node.nodeValue??"");
  throw new Error("Unsupported formatted text node.");
}
function protectWhitespace(value: string): string {
  let result="",inTag=false,quote="";
  for(const ch of value){
    if(inTag&&quote){
      result+=ch==='\r'?'&#xD;':ch==='\n'?'&#xA;':ch==='\t'?'&#x9;':ch;
      if(ch===quote)quote="";
    }else{
      result+=!inTag&&ch==='\r'?'&#xD;':ch;
      if(ch==='<')inTag=true;
      else if(inTag&&(ch==='"'||ch==="'"))quote=ch;
      else if(ch==='>')inTag=false;
    }
  }
  return result;
}
function escape(value: string, attribute=false): string {
  const escaped=value.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  return attribute?escaped.replaceAll("\r","&#xD;").replaceAll('"',"&quot;").replaceAll("\n","&#xA;").replaceAll("\t","&#x9;"):escaped;
}
function serialize(node: Node): string {
  if(node.nodeType===3||node.nodeType===4)return escape(node.nodeValue??"");
  if(node.nodeType===8)return "<!--"+node.nodeValue+"-->";
  const element=node as Element;
  const attrs=Array.from(element.attributes).map(a=>" "+(a.namespaceURI===xml?"xml:":"")+a.localName+'="'+escape(a.value,true)+'"').join("");
  const nodes=Array.from(node.childNodes).filter(child=>child.nodeType!==3||child.nodeValue!=="");
  return "<"+element.localName+attrs+(nodes.length?">"+nodes.map(serialize).join("")+"</"+element.localName+">":"/>");
}
