import { HmiTextListEntryType } from "../../text-graphic-lists/HmiTextList.js";
import { HmiRecipe, HmiRecipeCommunicationType, HmiRecipeSizeType, HmiRecipeStorageMedia } from "../../recipes/HmiRecipe.js";

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
    if (recipe.classicConfiguration) {
      const configuration = recipe.classicConfiguration;
      const values: [string, string | undefined][] = [
        ["Recipe number", configuration.sourceNumber?.toString()],
        ["Maximum record count", configuration.maximumRecordCount?.toString()],
        ["Recipe version", configuration.recipeVersion],
        ["Communication type", configuration.communicationType === undefined ? undefined : HmiRecipeCommunicationType[configuration.communicationType] ?? String(configuration.communicationType)],
        ["Size type", configuration.sizeType === undefined ? undefined : HmiRecipeSizeType[configuration.sizeType] ?? String(configuration.sizeType)],
        ["Storage media", configuration.storageMedia === undefined ? undefined : HmiRecipeStorageMedia[configuration.storageMedia] ?? String(configuration.storageMedia)],
        ["Last modification used", formatFlag(configuration.lastModificationUsed)],
        ["Last user used", formatFlag(configuration.lastUserUsed)],
        ["Log user action", formatFlag(configuration.logUserAction)],
        ["Offline", formatFlag(configuration.offline)],
        ["Sign saving", formatFlag(configuration.signSaving)],
        ["Sign transferring", formatFlag(configuration.signTransferring)],
        ["Synchronize tags", formatFlag(configuration.syncTags)],
        ["Synchronize transfer", formatFlag(configuration.syncTransfer)],
        ["Synchronized", formatFlag(configuration.synchronized)],
      ].filter(pair => pair[1] !== undefined) as [string, string][];
      if (values.length > 0) {
        html.push("<h2>Classic configuration</h2><dl>");
        for (const [label, value] of values) appendConfiguration(html, label, value);
        html.push("</dl>");
      }
    }
    if (recipe.references.size > 0) {
      html.push("<h2>References</h2><table><thead><tr><th scope=\"col\">Role</th><th scope=\"col\">Source reference</th><th scope=\"col\">Name</th></tr></thead><tbody>");
      for (const [role, reference] of recipe.references)
        html.push("<tr><th scope=\"row\">", encode(role), "</th><td>", encode(reference.sourceId), "</td><td>", encode(reference.name), "</td></tr>");
      html.push("</tbody></table>");
    }
    html.push("<h2>Fields</h2><div class=\"table-scroll\"><table><thead><tr>");
    for (const header of ["Index", "Name", "Tag", "Data type", "Unit", "Minimum", "Maximum", "Comment", "Element ID", "Default", "Decimal places", "Maximum length", "Tag array count", "Required", "Unique", "Indexed", "Display name", "Info text", "Trigger redraw"])
      html.push("<th scope=\"col\">", header, "</th>");
    html.push("</tr></thead><tbody>");
    for (const field of recipe.parameters) {
      html.push("<tr>");
      for (const value of [field.sourceIndex?.toString(), field.name, field.tag, field.dataType, field.unit,
        field.minimumValue, field.maximumValue, field.sourceTagComment?.getText(cultureLcid) ?? field.sourcePlcComment?.getText(cultureLcid) ?? field.comment, field.sourceElementId?.toString(), field.defaultValue,
        field.decimalPlaces?.toString(), field.maximumLength?.toString(), field.tagArrayCount?.toString(),
        formatFlag(field.required), formatFlag(field.unique), formatFlag(field.indexed),
        field.displayName?.getText(cultureLcid), field.infoText?.getText(cultureLcid), formatFlag(field.triggerRedraw)]) html.push("<td>", encode(value), "</td>");
      html.push("</tr>");
    }
    html.push("</tbody></table></div>");
    if (recipe.parameters.some(field => field.references.size > 0)) {
      html.push('<h2>Field references</h2><div class="table-scroll"><table><thead><tr><th scope="col">Index</th><th scope="col">Field</th><th scope="col">Element ID</th><th scope="col">Role</th><th scope="col">Source reference</th><th scope="col">Name</th></tr></thead><tbody>');
      for (const field of recipe.parameters) for (const [role, reference] of field.references)
        html.push('<tr><td>', encode(field.sourceIndex?.toString()), '</td><th scope="row">', encode(field.name), '</th><td>', encode(field.sourceElementId?.toString()),
          '</td><td>', encode(role), '</td><td>', encode(reference.sourceId), '</td><td>', encode(reference.name), '</td></tr>');
      html.push('</tbody></table></div>');
    }
    const sourceTagFields = recipe.parameters.filter(field => field.sourceTagStartValue !== undefined || field.sourceTagSubstituteValue !== undefined || field.sourceTagSubstituteValueUsage !== undefined);
    if (sourceTagFields.length > 0) {
      html.push('<h2>Source tag values</h2><div class="table-scroll"><table><thead><tr><th scope="col">Field</th><th scope="col">Start value</th><th scope="col">Substitute value</th><th scope="col">Substitute usage flags (raw)</th></tr></thead><tbody>');
      for (const field of sourceTagFields) {
        html.push('<tr><th scope="row">', encode(field.name), '</th>');
        for (const value of [field.sourceTagStartValue, field.sourceTagSubstituteValue, field.sourceTagSubstituteValueUsage?.toString()])
          html.push('<td data-value-state="', value === undefined ? "missing" : "present", '">', encode(value ?? "Missing"), '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    const tagTypes = [
      ...recipe.parameters.map(field => ({ kind: "Field", name: field.name, settings: field.sourceTagTypeSettings })),
      ...recipe.sourceTagDeclarations.map(declaration => ({ kind: "Declaration", name: declaration.name, settings: declaration.typeSettings })),
    ].filter(row => row.settings !== undefined);
    if (tagTypes.length > 0) {
      html.push('<h2>Source tag type settings</h2><div class="table-scroll"><table><thead><tr><th scope="col">Kind</th><th scope="col">Name</th><th scope="col">Shape flags (raw)</th><th scope="col">Coding flags (raw)</th><th scope="col">Data type source ID</th><th scope="col">Data type name</th></tr></thead><tbody>');
      for (const row of tagTypes) {
        const settings = row.settings!;
        html.push('<tr><td>', row.kind, '</td><th scope="row">', encode(row.name), '</th>');
        for (const value of [settings.shapeFlags?.toString(), settings.codingFlags?.toString(), settings.dataType?.sourceId, settings.dataType?.name])
          html.push('<td data-value-state="', value === undefined ? "missing" : "present", '">', encode(value ?? "Missing"), '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    const tagLimits = [
      ...recipe.parameters.flatMap(field => field.sourceTagLimits.map(limit => ({ kind: "Field", name: field.name, limit }))),
      ...recipe.sourceTagDeclarations.flatMap(declaration => declaration.limits.map(limit => ({ kind: "Declaration", name: declaration.name, limit }))),
    ];
    if (tagLimits.length > 0) {
      html.push('<h2>Source tag limits</h2><div class="table-scroll"><table><thead><tr><th scope="col">Kind</th><th scope="col">Name</th><th scope="col">Limit</th><th scope="col">Mode (raw)</th><th scope="col">Constant</th><th scope="col">Tag source ID</th><th scope="col">Tag name</th></tr></thead><tbody>');
      for (const row of tagLimits) {
        html.push('<tr><td>', row.kind, '</td><th scope="row">', encode(row.name), '</th>');
        for (const value of [row.limit.kind, row.limit.mode?.toString(), row.limit.constant, row.limit.tag?.sourceId, row.limit.tag?.name])
          html.push('<td data-value-state="', value === undefined ? "missing" : "present", '">', encode(value ?? "Missing"), '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    const tagScalings = [
      ...recipe.parameters.map(field => ({ kind: "Field", name: field.name, scaling: field.sourceTagScaling })),
      ...recipe.sourceTagDeclarations.map(declaration => ({ kind: "Declaration", name: declaration.name, scaling: declaration.scaling })),
    ].filter(row => row.scaling !== undefined);
    if (tagScalings.length > 0) {
      html.push('<h2>Source tag scaling</h2><div class="table-scroll"><table><thead><tr><th scope="col">Kind</th><th scope="col">Name</th><th scope="col">Linear scaling</th><th scope="col">HMI low</th><th scope="col">HMI high</th><th scope="col">PLC low</th><th scope="col">PLC high</th></tr></thead><tbody>');
      for (const row of tagScalings) {
        const scaling = row.scaling!;
        html.push('<tr><td>', row.kind, '</td><th scope="row">', encode(row.name), '</th>');
        for (const value of [scaling.linearScaling === undefined ? undefined : scaling.linearScaling ? "Yes" : "No",
          scaling.hmiLow?.toString(), scaling.hmiHigh?.toString(), scaling.plcLow?.toString(), scaling.plcHigh?.toString()])
          html.push('<td data-value-state="', value === undefined ? "missing" : "present", '">', encode(value ?? "Missing"), '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    if (recipe.sourceTagDeclarations.length > 0) {
      html.push('<h2>Source tag composite declarations</h2><div class="table-scroll"><table><thead><tr><th scope="col">Declaration</th><th scope="col">Data type</th><th scope="col">Comment</th><th scope="col">Start value</th><th scope="col">Substitute value</th><th scope="col">Substitute usage flags (raw)</th><th scope="col">Minimum</th><th scope="col">Maximum</th></tr></thead><tbody>');
      for (const declaration of recipe.sourceTagDeclarations) {
        html.push('<tr><th scope="row">', encode(declaration.name), '</th>');
        for (const value of [declaration.dataType, declaration.comment?.getText(cultureLcid), declaration.startValue, declaration.substituteValue, declaration.substituteValueUsage?.toString(), declaration.minimumValue, declaration.maximumValue])
          html.push('<td data-value-state="', value === undefined ? 'missing' : 'present', '">', encode(value ?? 'Missing'), '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    const plcFields = recipe.parameters.filter(field => field.sourcePlcStartValue !== undefined || field.sourcePlcTypeDefaultStartValue !== undefined || field.sourcePlcStartValueConstantName !== undefined || field.sourcePlcHasExplicitStartValue !== undefined);
    if (plcFields.length > 0) {
      html.push('<h2>Source PLC declaration values</h2><div class="table-scroll"><table><thead><tr><th scope="col">Field</th><th scope="col">Resolved start value</th><th scope="col">Type default start value</th><th scope="col">Symbolic constant</th><th scope="col">Explicit start value</th></tr></thead><tbody>');
      for (const field of plcFields) {
        html.push('<tr><th scope="row">', encode(field.name), '</th>');
        for (const value of [field.sourcePlcStartValue, field.sourcePlcTypeDefaultStartValue, field.sourcePlcStartValueConstantName, formatFlag(field.sourcePlcHasExplicitStartValue)])
          html.push('<td data-value-state="', value === undefined ? "missing" : "present", '">', encode(value ?? "Missing"), '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    if (recipe.sourcePlcDeclarations.length > 0) {
      html.push('<h2>Source PLC composite declarations</h2><div class="table-scroll"><table><thead><tr><th scope="col">Declaration</th><th scope="col">Data type</th><th scope="col">Start value</th><th scope="col">Type default</th><th scope="col">Symbolic constant</th><th scope="col">Explicit start value</th></tr></thead><tbody>');
      for (const declaration of recipe.sourcePlcDeclarations) {
        html.push('<tr><th scope="row">', encode(declaration.name), '</th>');
        for (const value of [declaration.dataType, declaration.startValue, declaration.typeDefaultStartValue, declaration.startValueConstantName, formatFlag(declaration.hasExplicitStartValue)])
          html.push('<td data-value-state="', value === undefined ? "missing" : "present", '">', encode(value ?? "Missing"), '</td>');
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    if (recipe.sourcePlcDeclarations.some(declaration => declaration.subelementValues.size > 0 || declaration.subelementValueConstantNames.size > 0 || declaration.typeDefaultSubelementValues.size > 0)) {
      html.push('<h2>Source PLC sparse values</h2><div class="table-scroll"><table><thead><tr><th scope="col">Declaration</th><th scope="col">Kind</th><th scope="col">Source key</th><th scope="col">Value</th></tr></thead><tbody>');
      for (const declaration of recipe.sourcePlcDeclarations)
        for (const [kind, values] of [["Explicit value", declaration.subelementValues], ["Symbolic constant", declaration.subelementValueConstantNames], ["Type default", declaration.typeDefaultSubelementValues]] as const)
          for (const [key, value] of values)
            html.push('<tr><th scope="row">', encode(declaration.name), '</th><td>', kind, '</td><td>', encode(key), '</td><td data-value-state="present">', encode(value), '</td></tr>');
      html.push('</tbody></table></div>');
    }
    if (recipe.sourcePlcDeclarations.some(declaration => declaration.comment !== undefined)) {
      html.push('<h2>Source PLC declaration comments</h2><div class="table-scroll"><table><thead><tr><th scope="col">Declaration</th><th scope="col">Comment</th></tr></thead><tbody>');
      for (const declaration of recipe.sourcePlcDeclarations.filter(declaration => declaration.comment !== undefined))
        html.push('<tr><th scope="row">', encode(declaration.name), '</th><td data-value-state="present">', encode(declaration.comment!.getText(cultureLcid)), '</td></tr>');
      html.push('</tbody></table></div>');
    }
    if (recipe.sourcePlcDeclarations.some(declaration => declaration.subelementComments.size > 0)) {
      html.push('<h2>Source PLC sparse comments</h2><div class="table-scroll"><table><thead><tr><th scope="col">Declaration</th><th scope="col">Source key</th><th scope="col">Comment</th></tr></thead><tbody>');
      for (const declaration of recipe.sourcePlcDeclarations)
        for (const [key, comment] of declaration.subelementComments)
          html.push('<tr><th scope="row">', encode(declaration.name), '</th><td>', encode(key), '</td><td data-value-state="present">', encode(comment.getText(cultureLcid)), '</td></tr>');
      html.push('</tbody></table></div>');
    }
    appendFieldTextLists(html,recipe,cultureLcid);
    appendPlcArrays(html,recipe);
    html.push("<h2>Stored records</h2>");
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
    if (recipe.dataSets.some(record => record.sourceValues.size > 0)) {
      html.push("<h2>Stored source values</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Record</th><th scope=\"col\">Number</th><th scope=\"col\">Source key</th><th scope=\"col\">Value</th></tr></thead><tbody>");
      for (const record of recipe.dataSets)
        for (const [key, value] of record.sourceValues)
          html.push("<tr><th scope=\"row\">", encode(record.name), "</th><td>", encode(record.sourceNumber?.toString()), "</td><td>", encode(key),
            "</td><td data-value-state=\"", value == null ? "null" : "present", "\">", encode(value == null ? "Null" : value), "</td></tr>");
      html.push("</tbody></table></div>");
    }
    if (recipe.dataSets.some(record=>record.lastModification!==undefined || record.lastUser!==undefined)) {
      html.push('<h2>Stored record metadata</h2><div class="table-scroll"><table><thead><tr><th scope="col">Record</th><th scope="col">Number</th><th scope="col">Last modification (stored)</th><th scope="col">Last user</th></tr></thead><tbody>');
      for(const record of recipe.dataSets) {
        html.push('<tr><th scope="row">',encode(record.name),'</th>');
        appendViewValue(html,record.sourceNumber);
        const modified=record.lastModification;
        appendViewValue(html,modified instanceof Date && Number.isFinite(modified.getTime())?modified.toISOString():undefined);
        appendViewValue(html,record.lastUser);
        html.push('</tr>');
      }
      html.push('</tbody></table></div>');
    }
    appendRecipeViews(html, recipe, cultureLcid);
    return html.concat("</body></html>").join("");
  }
}

function appendFieldTextLists(html: string[], recipe: HmiRecipe, cultureLcid?: number): void {
  const fields = recipe.parameters.filter(field => field.textList !== undefined);
  if (!fields.length) return;
  html.push('<h2>Field text lists</h2><div class="table-scroll"><table><thead><tr><th scope="col">Field</th><th scope="col">Index</th><th scope="col">Element ID</th><th scope="col">Source reference</th><th scope="col">List name</th><th scope="col">Range mode</th><th scope="col">Comment</th><th scope="col">Default entry source ID</th><th scope="col">Default entry name</th><th scope="col">Entries</th></tr></thead><tbody>');
  for (const field of fields) {
    const list = field.textList!;
    html.push('<tr>');
    for (const value of [field.name,field.sourceIndex,field.sourceElementId,field.references.get("TextList")?.sourceId,list.name,list.rangeType,list.comment?.getText(cultureLcid),list.defaultEntryReference?.sourceId,list.defaultEntryReference?.name,list.entries.length]) appendViewValue(html,value);
    html.push('</tr>');
  }
  html.push('</tbody></table></div>');
  if (!fields.some(field=>field.textList!.entries.length>0)) return;
  html.push('<h2>Field text-list entries</h2><div class="table-scroll"><table><thead><tr><th scope="col">Field</th><th scope="col">Index</th><th scope="col">Element ID</th><th scope="col">Source reference</th><th scope="col">Position</th><th scope="col">Entry</th><th scope="col">From</th><th scope="col">To</th><th scope="col">Default entry</th><th scope="col">Text</th><th scope="col">Entry source ID</th><th scope="col">Entry mode</th></tr></thead><tbody>');
  for (const field of fields) {
    let position = 0;
    for (const entry of field.textList!.entries) {
      html.push('<tr>');
      for (const value of [field.name,field.sourceIndex,field.sourceElementId,field.references.get("TextList")?.sourceId,++position,entry.name,entry.from,entry.to,entry.default ? "Yes" : "No",entry.text?.getText(cultureLcid),entry.sourceId,entry.entryType === undefined ? undefined : (HmiTextListEntryType[entry.entryType] ?? String(entry.entryType))]) appendViewValue(html,value);
      html.push('</tr>');
    }
  }
  html.push('</tbody></table></div>');
}

function appendPlcArrays(html: string[], recipe: HmiRecipe): void {
  const arrays = [
    ...recipe.parameters.flatMap(p => p.sourcePlcArray === undefined ? [] : [{ kind: "Field", name: p.name, array: p.sourcePlcArray }]),
    ...recipe.sourcePlcDeclarations.flatMap(d => d.array === undefined ? [] : [{ kind: "Composite declaration", name: d.name, array: d.array }]),
  ];
  if (!arrays.length) return;
  html.push('<h2>Source PLC array declarations</h2><div class="table-scroll"><table><thead><tr><th scope="col">Kind</th><th scope="col">Declaration</th><th scope="col">Original type</th><th scope="col">Element type</th><th scope="col">Open array</th><th scope="col">Declared dimensions</th><th scope="col">Resolved dimensions</th></tr></thead><tbody>');
  for (const entry of arrays) {
    html.push('<tr>');
    for (const value of [entry.kind,entry.name,entry.array.originalTypeName,entry.array.elementTypeName,entry.array.isStarArray ? "Yes" : "No",entry.array.dimensions?.length,entry.array.resolvedDimensions?.length]) appendViewValue(html,value);
    html.push('</tr>');
  }
  html.push('</tbody></table></div>');
  if (!arrays.some(e => (e.array.dimensions?.length ?? 0) > 0 || (e.array.resolvedDimensions?.length ?? 0) > 0)) return;
  html.push('<h2>Source PLC array bounds</h2><div class="table-scroll"><table><thead><tr><th scope="col">Kind</th><th scope="col">Declaration</th><th scope="col">Bounds</th><th scope="col">List position</th><th scope="col">Start</th><th scope="col">End</th></tr></thead><tbody>');
  for (const entry of arrays) {
    function row(kind: string, position: number, start: string | number | undefined, end: string | number | undefined): void {
      html.push('<tr>');
      for (const value of [entry.kind,entry.name,kind,position,start,end]) appendViewValue(html,value);
      html.push('</tr>');
    }
    entry.array.dimensions?.forEach((d,i)=>row("Declared",i+1,d.start,d.end));
    entry.array.resolvedDimensions?.forEach((d,i)=>row("Resolved",i+1,d.start,d.end));
  }
  html.push('</tbody></table></div>');
}

function appendRecipeViews(html: string[], recipe: HmiRecipe, cultureLcid?: number): void {
  if (recipe.views.length === 0) return;
  html.push('<h2>Recipe views</h2><div class="table-scroll"><table><thead><tr><th scope="col">Name</th><th scope="col">Source ID</th><th scope="col">Number</th><th scope="col">Display name</th><th scope="col">Statement (stored)</th><th scope="col">Display name source ID</th><th scope="col">Display name reference</th></tr></thead><tbody>');
  for (const view of recipe.views) {
    html.push("<tr>");
    for (const value of [view.name,view.sourceId,view.sourceNumber,view.displayName?.getText(cultureLcid),view.statement,view.displayNameReference?.sourceId,view.displayNameReference?.name]) appendViewValue(html,value);
    html.push("</tr>");
  }
  html.push("</tbody></table></div>");
  if (!recipe.views.some(v=>v.elements.length>0)) return;
  html.push('<h2>Recipe view elements</h2><div class="table-scroll"><table><thead><tr><th scope="col">View</th><th scope="col">View source ID</th><th scope="col">Name</th><th scope="col">Source ID</th><th scope="col">Number</th><th scope="col">Display name</th><th scope="col">Target source ID</th><th scope="col">Target name</th><th scope="col">Display name source ID</th><th scope="col">Display name reference</th></tr></thead><tbody>');
  for (const view of recipe.views) for (const element of view.elements) {
    html.push("<tr>");
    for (const value of [view.name,view.sourceId,element.name,element.sourceId,element.sourceNumber,element.displayName?.getText(cultureLcid),element.targetElement?.sourceId,element.targetElement?.name,element.displayNameReference?.sourceId,element.displayNameReference?.name]) appendViewValue(html,value);
    html.push("</tr>");
  }
  html.push("</tbody></table></div>");
}

function appendViewValue(html: string[], value: string | number | undefined): void {
  html.push('<td data-value-state="',value===undefined?"missing":"present",'">',encode(value===undefined?"Missing":String(value)),"</td>");
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
