import { HmiRecipe } from "../../recipes/HmiRecipe.js";

/** Renders stored engineering recipe definitions and records as a standalone HTML document. */
export class HmiRecipeToHtmlConverter {
  convert(recipe: HmiRecipe, cultureLcid?: number): string {
    const title = recipe.displayName?.getText(cultureLcid) ?? recipe.name ?? "Recipe";
    const html = ["<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>", encode(title),
      "</title><style>body{font-family:system-ui,sans-serif;margin:24px;color:#202124}table{border-collapse:collapse;margin-bottom:24px}th,td{border:1px solid #ccd0d5;padding:8px;text-align:left;vertical-align:top;white-space:pre-wrap}thead{background:#edf1f5}td[data-value-state=missing],td[data-value-state=null]{color:#666;font-style:italic}.table-scroll{overflow:auto}</style></head><body><h1>",
      encode(title), "</h1>"];
    if (recipe.displayName != null) html.push("<p>Name: ", encode(recipe.name), "</p>");
    if (recipe.infoText != null) html.push("<p>", encode(recipe.infoText.getText(cultureLcid)), "</p>");
    if (recipe.comment != null) html.push("<p>", encode(recipe.comment), "</p>");
    if (recipe.sourceId !== undefined || recipe.sourceDisplayName !== undefined || recipe.storagePath !== undefined) {
      html.push("<h2>Configuration</h2><dl>");
      appendConfiguration(html, "Parameter set type ID", recipe.sourceId?.toString());
      appendConfiguration(html, "Source display name", recipe.sourceDisplayName);
      appendConfiguration(html, "Storage path", recipe.storagePath);
      html.push("</dl>");
    }
    if (recipe.references.size > 0) {
      html.push("<h2>References</h2><table><thead><tr><th scope=\"col\">Role</th><th scope=\"col\">Source reference</th><th scope=\"col\">Name</th></tr></thead><tbody>");
      for (const [role, reference] of recipe.references)
        html.push("<tr><th scope=\"row\">", encode(role), "</th><td>", encode(reference.sourceId), "</td><td>", encode(reference.name), "</td></tr>");
      html.push("</tbody></table>");
    }
    html.push("<h2>Fields</h2><div class=\"table-scroll\"><table><thead><tr>");
    for (const header of ["Index", "Name", "Tag", "Data type", "Unit", "Minimum", "Maximum", "Comment", "Element ID", "Default", "Decimal places", "Maximum length", "Tag array count", "Required", "Unique", "Indexed", "Display name", "Info text"])
      html.push("<th scope=\"col\">", header, "</th>");
    html.push("</tr></thead><tbody>");
    for (const field of recipe.parameters) {
      html.push("<tr>");
      for (const value of [field.sourceIndex?.toString(), field.name, field.tag, field.dataType, field.unit,
        field.minimumValue, field.maximumValue, field.comment, field.sourceElementId?.toString(), field.defaultValue,
        field.decimalPlaces?.toString(), field.maximumLength?.toString(), field.tagArrayCount?.toString(),
        formatFlag(field.required), formatFlag(field.unique), formatFlag(field.indexed),
        field.displayName?.getText(cultureLcid), field.infoText?.getText(cultureLcid)]) html.push("<td>", encode(value), "</td>");
      html.push("</tr>");
    }
    html.push("</tbody></table></div><h2>Stored records</h2>");
    if (recipe.dataSets.length === 0) html.push("<p>No stored records.</p>");
    else {
      // Preserve definition order, then include raw record keys not represented by a named field.
      const columns: string[] = [];
      const seen = new Set<string>();
      const addColumn = (name: string) => {
        const key = ordinalKey(name);
        if (!seen.has(key)) { seen.add(key); columns.push(name); }
      };
      for (const field of recipe.parameters) if (field.name != null) addColumn(field.name);
      for (const record of recipe.dataSets) for (const key of Object.keys(record.values)) addColumn(key);
      html.push("<div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Record</th><th scope=\"col\">Number</th><th scope=\"col\">Display name</th>");
      for (const column of columns) html.push("<th scope=\"col\">", encode(column), "</th>");
      html.push("</tr></thead><tbody>");
      for (const record of recipe.dataSets) {
        html.push("<tr><th scope=\"row\">", encode(record.name), "</th><td>", encode(record.sourceNumber?.toString()), "</td><td>",
          encode(record.displayName?.getText(cultureLcid)), "</td>");
        const keys = new Map(Object.keys(record.values).map(key => [ordinalKey(key), key]));
        for (const column of columns) {
          const key = keys.get(ordinalKey(column));
          const found = key !== undefined;
          const value = found ? record.values[key] : undefined;
          const state = !found ? "missing" : value == null ? "null" : "present";
          html.push("<td data-value-state=\"", state, "\">", encode(!found ? "Missing" : value == null ? "Null" : value), "</td>");
        }
        html.push("</tr>");
      }
      html.push("</tbody></table></div>");
    }
    return html.concat("</body></html>").join("");
  }
}

function appendConfiguration(html: string[], label: string, value: string | undefined): void {
  if (value !== undefined) html.push("<dt>", label, "</dt><dd>", encode(value), "</dd>");
}

function formatFlag(value: boolean | undefined): string | undefined {
  return value === undefined ? undefined : value ? "Yes" : "No";
}

function encode(value: string | undefined): string {
  return (value ?? "").replace(/[&<>"'\u00a0-\u00ff]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g, character => {
    switch (character) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return `&#${character.codePointAt(0)};`;
    }
  });
}

function ordinalKey(value: string): string {
  // Ordinal case matching does not expand letters or map non-ASCII letters into ASCII.
  return Array.from(value, character => {
    const upper = character.toUpperCase();
    return upper.length !== character.length || (character.charCodeAt(0) > 127 && upper.charCodeAt(0) <= 127)
      ? character : upper;
  }).join("");
}
