// Element assertions must not match template strings in the embedded runtime.
export function withoutRuntimeScripts(html) {
  return html.replace(/<script\b[^>]*>.*?<\/script>/gis, "");
}
