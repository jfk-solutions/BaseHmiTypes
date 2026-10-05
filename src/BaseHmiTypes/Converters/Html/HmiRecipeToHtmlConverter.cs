using System.Globalization;
using System.Net;
using System.Text;
using BaseHmiTypes.Recipes;

namespace BaseHmiTypes.Converters.Html;

/// <summary>Renders stored engineering recipe definitions and records as a standalone HTML document.</summary>
public sealed class HmiRecipeToHtmlConverter
{
    public string Convert(HmiRecipe recipe)
        => Convert(recipe, null);

    public string Convert(HmiRecipe recipe, int? cultureLcid)
    {
        if (recipe is null) throw new ArgumentNullException(nameof(recipe));
        var culture = cultureLcid is { } lcid ? CultureInfo.GetCultureInfo(lcid) : null;
        var title = recipe.DisplayName?.GetText(culture) ?? recipe.Name ?? "Recipe";
        var html = new StringBuilder("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>");
        html.Append(Encode(title));
        html.Append("</title><style>body{font-family:system-ui,sans-serif;margin:24px;color:#202124}table{border-collapse:collapse;margin-bottom:24px}th,td{border:1px solid #ccd0d5;padding:8px;text-align:left;vertical-align:top;white-space:pre-wrap}thead{background:#edf1f5}td[data-value-state=missing],td[data-value-state=null]{color:#666;font-style:italic}.table-scroll{overflow:auto}</style></head><body><h1>");
        html.Append(Encode(title)).Append("</h1>");
        if (recipe.DisplayName != null) html.Append("<p>Name: ").Append(Encode(recipe.Name)).Append("</p>");
        if (recipe.InfoText != null) html.Append("<p>").Append(Encode(recipe.InfoText.GetText(culture))).Append("</p>");
        if (recipe.Comment != null) html.Append("<p>").Append(Encode(recipe.Comment)).Append("</p>");
        if (recipe.SourceId != null || recipe.SourceDisplayName != null || recipe.StoragePath != null)
        {
            html.Append("<h2>Configuration</h2><dl>");
            AppendConfiguration(html, "Parameter set type ID", recipe.SourceId?.ToString(CultureInfo.InvariantCulture));
            AppendConfiguration(html, "Source display name", recipe.SourceDisplayName);
            AppendConfiguration(html, "Storage path", recipe.StoragePath);
            html.Append("</dl>");
        }
        if (recipe.ClassicConfiguration is { } configuration)
        {
            var values = new (string Label, string? Value)[]
            {
                ("Recipe number", configuration.SourceNumber?.ToString(CultureInfo.InvariantCulture)),
                ("Maximum record count", configuration.MaximumRecordCount?.ToString(CultureInfo.InvariantCulture)),
                ("Recipe version", configuration.RecipeVersion),
                ("Communication type", configuration.CommunicationType?.ToString()),
                ("Size type", configuration.SizeType?.ToString()),
                ("Storage media", configuration.StorageMedia?.ToString()),
                ("Last modification used", FormatFlag(configuration.LastModificationUsed)),
                ("Last user used", FormatFlag(configuration.LastUserUsed)),
                ("Log user action", FormatFlag(configuration.LogUserAction)),
                ("Offline", FormatFlag(configuration.Offline)),
                ("Sign saving", FormatFlag(configuration.SignSaving)),
                ("Sign transferring", FormatFlag(configuration.SignTransferring)),
                ("Synchronize tags", FormatFlag(configuration.SyncTags)),
                ("Synchronize transfer", FormatFlag(configuration.SyncTransfer)),
                ("Synchronized", FormatFlag(configuration.Synchronized)),
            }.Where(pair => pair.Value != null).ToArray();
            if (values.Length > 0)
            {
                html.Append("<h2>Classic configuration</h2><dl>");
                foreach (var pair in values) AppendConfiguration(html, pair.Label, pair.Value);
                html.Append("</dl>");
            }
        }
        if (recipe.References.Count > 0)
        {
            html.Append("<h2>References</h2><table><thead><tr><th scope=\"col\">Role</th><th scope=\"col\">Source reference</th><th scope=\"col\">Name</th></tr></thead><tbody>");
            foreach (var pair in recipe.References)
                html.Append("<tr><th scope=\"row\">").Append(Encode(pair.Key)).Append("</th><td>")
                    .Append(Encode(pair.Value.SourceId)).Append("</td><td>").Append(Encode(pair.Value.Name)).Append("</td></tr>");
            html.Append("</tbody></table>");
        }
        html.Append("<h2>Fields</h2><div class=\"table-scroll\"><table><thead><tr>");
        foreach (var header in new[] { "Index", "Name", "Tag", "Data type", "Unit", "Minimum", "Maximum", "Comment", "Element ID", "Default", "Decimal places", "Maximum length", "Tag array count", "Required", "Unique", "Indexed", "Display name", "Info text", "Trigger redraw" })
            html.Append("<th scope=\"col\">").Append(header).Append("</th>");
        html.Append("</tr></thead><tbody>");
        foreach (var field in recipe.Parameters)
        {
            html.Append("<tr>");
            foreach (var value in new[] { field.SourceIndex?.ToString(CultureInfo.InvariantCulture), field.Name,
                         field.Tag, field.DataType, field.Unit, field.MinimumValue, field.MaximumValue, field.SourceTagComment?.GetText(culture) ?? field.SourcePlcComment?.GetText(culture) ?? field.Comment,
                         field.SourceElementId?.ToString(CultureInfo.InvariantCulture), field.DefaultValue,
                         field.DecimalPlaces?.ToString(CultureInfo.InvariantCulture), field.MaximumLength?.ToString(CultureInfo.InvariantCulture),
                         field.TagArrayCount?.ToString(CultureInfo.InvariantCulture), FormatFlag(field.Required), FormatFlag(field.Unique), FormatFlag(field.Indexed),
                         field.DisplayName?.GetText(culture), field.InfoText?.GetText(culture), FormatFlag(field.TriggerRedraw) })
                html.Append("<td>").Append(Encode(value)).Append("</td>");
            html.Append("</tr>");
        }
        html.Append("</tbody></table></div>");
        if (recipe.Parameters.Any(field => field.References.Count > 0))
        {
            html.Append("<h2>Field references</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Index</th><th scope=\"col\">Field</th><th scope=\"col\">Element ID</th><th scope=\"col\">Role</th><th scope=\"col\">Source reference</th><th scope=\"col\">Name</th></tr></thead><tbody>");
            foreach (var field in recipe.Parameters)
                foreach (var pair in field.References)
                    html.Append("<tr><td>").Append(field.SourceIndex?.ToString(CultureInfo.InvariantCulture)).Append("</td><th scope=\"row\">").Append(Encode(field.Name))
                        .Append("</th><td>").Append(field.SourceElementId?.ToString(CultureInfo.InvariantCulture)).Append("</td><td>").Append(Encode(pair.Key))
                        .Append("</td><td>").Append(Encode(pair.Value.SourceId)).Append("</td><td>").Append(Encode(pair.Value.Name)).Append("</td></tr>");
            html.Append("</tbody></table></div>");
        }
        if (recipe.Parameters.Any(field => field.SourceTagStartValue != null || field.SourceTagSubstituteValue != null || field.SourceTagSubstituteValueUsage != null))
        {
            html.Append("<h2>Source tag values</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Field</th><th scope=\"col\">Start value</th><th scope=\"col\">Substitute value</th><th scope=\"col\">Substitute usage flags (raw)</th></tr></thead><tbody>");
            foreach (var field in recipe.Parameters.Where(field => field.SourceTagStartValue != null || field.SourceTagSubstituteValue != null || field.SourceTagSubstituteValueUsage != null))
            {
                html.Append("<tr><th scope=\"row\">").Append(Encode(field.Name)).Append("</th>");
                foreach (var value in new[] { field.SourceTagStartValue, field.SourceTagSubstituteValue, field.SourceTagSubstituteValueUsage?.ToString(CultureInfo.InvariantCulture) })
                    html.Append("<td data-value-state=\"").Append(value == null ? "missing" : "present").Append("\">").Append(Encode(value ?? "Missing")).Append("</td>");
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        var tagTypes = recipe.Parameters.Where(field => field.SourceTagTypeSettings != null)
            .Select(field => (Kind: "Field", field.Name, Settings: field.SourceTagTypeSettings!))
            .Concat(recipe.SourceTagDeclarations.Where(declaration => declaration.TypeSettings != null)
                .Select(declaration => (Kind: "Declaration", declaration.Name, Settings: declaration.TypeSettings!))).ToArray();
        if (tagTypes.Length > 0)
        {
            html.Append("<h2>Source tag type settings</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Kind</th><th scope=\"col\">Name</th><th scope=\"col\">Shape flags (raw)</th><th scope=\"col\">Coding flags (raw)</th><th scope=\"col\">Data type source ID</th><th scope=\"col\">Data type name</th></tr></thead><tbody>");
            foreach (var row in tagTypes)
            {
                html.Append("<tr><td>").Append(row.Kind).Append("</td><th scope=\"row\">").Append(Encode(row.Name)).Append("</th>");
                foreach (var value in new[] { row.Settings.ShapeFlags?.ToString(CultureInfo.InvariantCulture), row.Settings.CodingFlags?.ToString(CultureInfo.InvariantCulture), row.Settings.DataType?.SourceId, row.Settings.DataType?.Name })
                    html.Append("<td data-value-state=\"").Append(value == null ? "missing" : "present").Append("\">").Append(Encode(value ?? "Missing")).Append("</td>");
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        var tagLimits = recipe.Parameters.SelectMany(field => field.SourceTagLimits.Select(limit => (Kind: "Field", field.Name, Limit: limit)))
            .Concat(recipe.SourceTagDeclarations.SelectMany(declaration => declaration.Limits.Select(limit => (Kind: "Declaration", declaration.Name, Limit: limit)))).ToArray();
        if (tagLimits.Length > 0)
        {
            html.Append("<h2>Source tag limits</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Kind</th><th scope=\"col\">Name</th><th scope=\"col\">Limit</th><th scope=\"col\">Mode (raw)</th><th scope=\"col\">Constant</th><th scope=\"col\">Tag source ID</th><th scope=\"col\">Tag name</th></tr></thead><tbody>");
            foreach (var row in tagLimits)
            {
                html.Append("<tr><td>").Append(row.Kind).Append("</td><th scope=\"row\">").Append(Encode(row.Name)).Append("</th>");
                foreach (var value in new[] { row.Limit.Kind, row.Limit.Mode?.ToString(CultureInfo.InvariantCulture), row.Limit.Constant, row.Limit.Tag?.SourceId, row.Limit.Tag?.Name })
                    html.Append("<td data-value-state=\"").Append(value == null ? "missing" : "present").Append("\">").Append(Encode(value ?? "Missing")).Append("</td>");
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        var tagScalings = recipe.Parameters.Where(field => field.SourceTagScaling != null)
            .Select(field => (Kind: "Field", field.Name, Scaling: field.SourceTagScaling!))
            .Concat(recipe.SourceTagDeclarations.Where(declaration => declaration.Scaling != null)
                .Select(declaration => (Kind: "Declaration", declaration.Name, Scaling: declaration.Scaling!))).ToArray();
        if (tagScalings.Length > 0)
        {
            html.Append("<h2>Source tag scaling</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Kind</th><th scope=\"col\">Name</th><th scope=\"col\">Linear scaling</th><th scope=\"col\">HMI low</th><th scope=\"col\">HMI high</th><th scope=\"col\">PLC low</th><th scope=\"col\">PLC high</th></tr></thead><tbody>");
            foreach (var row in tagScalings)
            {
                var scaling = row.Scaling;
                html.Append("<tr><td>").Append(row.Kind).Append("</td><th scope=\"row\">").Append(Encode(row.Name)).Append("</th>");
                foreach (var value in new[] { scaling.LinearScaling is bool enabled ? (enabled ? "Yes" : "No") : null,
                    scaling.HmiLow?.ToString(CultureInfo.InvariantCulture), scaling.HmiHigh?.ToString(CultureInfo.InvariantCulture),
                    scaling.PlcLow?.ToString(CultureInfo.InvariantCulture), scaling.PlcHigh?.ToString(CultureInfo.InvariantCulture) })
                    html.Append("<td data-value-state=\"").Append(value == null ? "missing" : "present").Append("\">").Append(Encode(value ?? "Missing")).Append("</td>");
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        if (recipe.SourceTagDeclarations.Count > 0)
        {
            html.Append("<h2>Source tag composite declarations</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Declaration</th><th scope=\"col\">Data type</th><th scope=\"col\">Comment</th><th scope=\"col\">Start value</th><th scope=\"col\">Substitute value</th><th scope=\"col\">Substitute usage flags (raw)</th><th scope=\"col\">Minimum</th><th scope=\"col\">Maximum</th></tr></thead><tbody>");
            foreach (var declaration in recipe.SourceTagDeclarations)
            {
                html.Append("<tr><th scope=\"row\">").Append(Encode(declaration.Name)).Append("</th>");
                foreach (var value in new[] { declaration.DataType, declaration.Comment?.GetText(culture), declaration.StartValue, declaration.SubstituteValue, declaration.SubstituteValueUsage?.ToString(CultureInfo.InvariantCulture), declaration.MinimumValue, declaration.MaximumValue })
                    html.Append("<td data-value-state=\"").Append(value == null ? "missing" : "present").Append("\">").Append(Encode(value ?? "Missing")).Append("</td>");
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        var plcFields = recipe.Parameters.Where(field => field.SourcePlcStartValue != null || field.SourcePlcTypeDefaultStartValue != null || field.SourcePlcStartValueConstantName != null || field.SourcePlcHasExplicitStartValue != null).ToArray();
        if (plcFields.Length > 0)
        {
            html.Append("<h2>Source PLC declaration values</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Field</th><th scope=\"col\">Resolved start value</th><th scope=\"col\">Type default start value</th><th scope=\"col\">Symbolic constant</th><th scope=\"col\">Explicit start value</th></tr></thead><tbody>");
            foreach (var field in plcFields)
            {
                html.Append("<tr><th scope=\"row\">").Append(Encode(field.Name)).Append("</th>");
                foreach (var value in new[] { field.SourcePlcStartValue, field.SourcePlcTypeDefaultStartValue, field.SourcePlcStartValueConstantName, FormatFlag(field.SourcePlcHasExplicitStartValue) })
                    html.Append("<td data-value-state=\"").Append(value == null ? "missing" : "present").Append("\">").Append(Encode(value ?? "Missing")).Append("</td>");
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        if (recipe.SourcePlcDeclarations.Count > 0)
        {
            html.Append("<h2>Source PLC composite declarations</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Declaration</th><th scope=\"col\">Data type</th><th scope=\"col\">Start value</th><th scope=\"col\">Type default</th><th scope=\"col\">Symbolic constant</th><th scope=\"col\">Explicit start value</th></tr></thead><tbody>");
            foreach (var declaration in recipe.SourcePlcDeclarations)
            {
                html.Append("<tr><th scope=\"row\">").Append(Encode(declaration.Name)).Append("</th>");
                foreach (var value in new[] { declaration.DataType, declaration.StartValue, declaration.TypeDefaultStartValue, declaration.StartValueConstantName, FormatFlag(declaration.HasExplicitStartValue) })
                    html.Append("<td data-value-state=\"").Append(value == null ? "missing" : "present").Append("\">").Append(Encode(value ?? "Missing")).Append("</td>");
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        if (recipe.SourcePlcDeclarations.Any(declaration => declaration.SubelementValues.Count > 0 || declaration.SubelementValueConstantNames.Count > 0 || declaration.TypeDefaultSubelementValues.Count > 0))
        {
            html.Append("<h2>Source PLC sparse values</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Declaration</th><th scope=\"col\">Kind</th><th scope=\"col\">Source key</th><th scope=\"col\">Value</th></tr></thead><tbody>");
            foreach (var declaration in recipe.SourcePlcDeclarations)
                foreach (var group in new[] { ("Explicit value", declaration.SubelementValues), ("Symbolic constant", declaration.SubelementValueConstantNames), ("Type default", declaration.TypeDefaultSubelementValues) })
                    foreach (var pair in group.Item2)
                        html.Append("<tr><th scope=\"row\">").Append(Encode(declaration.Name)).Append("</th><td>").Append(group.Item1).Append("</td><td>").Append(Encode(pair.Key)).Append("</td><td data-value-state=\"present\">").Append(Encode(pair.Value)).Append("</td></tr>");
            html.Append("</tbody></table></div>");
        }
        if (recipe.SourcePlcDeclarations.Any(declaration => declaration.Comment != null))
        {
            html.Append("<h2>Source PLC declaration comments</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Declaration</th><th scope=\"col\">Comment</th></tr></thead><tbody>");
            foreach (var declaration in recipe.SourcePlcDeclarations.Where(declaration => declaration.Comment != null))
                html.Append("<tr><th scope=\"row\">").Append(Encode(declaration.Name)).Append("</th><td data-value-state=\"present\">")
                    .Append(Encode(declaration.Comment!.GetText(culture))).Append("</td></tr>");
            html.Append("</tbody></table></div>");
        }
        if (recipe.SourcePlcDeclarations.Any(declaration => declaration.SubelementComments.Count > 0))
        {
            html.Append("<h2>Source PLC sparse comments</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Declaration</th><th scope=\"col\">Source key</th><th scope=\"col\">Comment</th></tr></thead><tbody>");
            foreach (var declaration in recipe.SourcePlcDeclarations)
                foreach (var pair in declaration.SubelementComments)
                    html.Append("<tr><th scope=\"row\">").Append(Encode(declaration.Name)).Append("</th><td>").Append(Encode(pair.Key))
                        .Append("</td><td data-value-state=\"present\">").Append(Encode(pair.Value.GetText(culture))).Append("</td></tr>");
            html.Append("</tbody></table></div>");
        }
        AppendFieldTextLists(html, recipe, culture);
        AppendPlcArrays(html, recipe);
        html.Append("<h2>Stored records</h2>");
        if (recipe.DataSets.Count == 0)
            html.Append("<p>No stored records.</p>");
        else
        {
            // Preserve definition order, then include raw record keys not represented by a named field.
            var columns = new List<string>();
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var field in recipe.Parameters)
                if (field.Name != null && seen.Add(field.Name)) columns.Add(field.Name);
            foreach (var record in recipe.DataSets)
                foreach (var key in record.Values.Keys)
                    if (seen.Add(key)) columns.Add(key);
            html.Append("<div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Record</th><th scope=\"col\">Number</th><th scope=\"col\">Display name</th>");
            foreach (var column in columns) html.Append("<th scope=\"col\">").Append(Encode(column)).Append("</th>");
            html.Append("</tr></thead><tbody>");
            foreach (var record in recipe.DataSets)
            {
                html.Append("<tr><th scope=\"row\">").Append(Encode(record.Name)).Append("</th><td>")
                    .Append(record.SourceNumber?.ToString(CultureInfo.InvariantCulture)).Append("</td><td>")
                    .Append(Encode(record.DisplayName?.GetText(culture))).Append("</td>");
                foreach (var column in columns)
                {
                    var found = record.Values.TryGetValue(column, out var value);
                    var state = !found ? "missing" : value == null ? "null" : "present";
                    html.Append("<td data-value-state=\"").Append(state).Append("\">")
                        .Append(Encode(!found ? "Missing" : value == null ? "Null" : value)).Append("</td>");
                }
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        if (recipe.DataSets.Any(record => record.SourceValues.Count > 0))
        {
            html.Append("<h2>Stored source values</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Record</th><th scope=\"col\">Number</th><th scope=\"col\">Source key</th><th scope=\"col\">Value</th></tr></thead><tbody>");
            foreach (var record in recipe.DataSets)
                foreach (var pair in record.SourceValues)
                    html.Append("<tr><th scope=\"row\">").Append(Encode(record.Name)).Append("</th><td>")
                        .Append(record.SourceNumber?.ToString(CultureInfo.InvariantCulture)).Append("</td><td>").Append(Encode(pair.Key))
                        .Append("</td><td data-value-state=\"").Append(pair.Value == null ? "null" : "present").Append("\">")
                        .Append(Encode(pair.Value == null ? "Null" : pair.Value)).Append("</td></tr>");
            html.Append("</tbody></table></div>");
        }
        if (recipe.DataSets.Any(record => record.LastModification != null || record.LastUser != null))
        {
            html.Append("<h2>Stored record metadata</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Record</th><th scope=\"col\">Number</th><th scope=\"col\">Last modification (stored)</th><th scope=\"col\">Last user</th></tr></thead><tbody>");
            foreach (var record in recipe.DataSets)
            {
                html.Append("<tr><th scope=\"row\">").Append(Encode(record.Name)).Append("</th>");
                AppendViewValue(html, record.SourceNumber?.ToString(CultureInfo.InvariantCulture));
                AppendViewValue(html, record.LastModification?.ToString("O", CultureInfo.InvariantCulture));
                AppendViewValue(html, record.LastUser);
                html.Append("</tr>");
            }
            html.Append("</tbody></table></div>");
        }
        AppendRecipeViews(html, recipe, culture);
        return html.Append("</body></html>").ToString();
    }

    private static void AppendFieldTextLists(StringBuilder html, HmiRecipe recipe, CultureInfo? culture)
    {
        var fields = recipe.Parameters.Where(field => field.TextList != null).ToArray();
        if (fields.Length == 0) return;
        html.Append("<h2>Field text lists</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Field</th><th scope=\"col\">Index</th><th scope=\"col\">Element ID</th><th scope=\"col\">Source reference</th><th scope=\"col\">List name</th><th scope=\"col\">Range mode</th><th scope=\"col\">Comment</th><th scope=\"col\">Entries</th></tr></thead><tbody>");
        foreach (var field in fields)
        {
            field.References.TryGetValue("TextList", out var reference);
            var list = field.TextList!;
            html.Append("<tr>");
            foreach (var value in new[] { field.Name, field.SourceIndex?.ToString(CultureInfo.InvariantCulture), field.SourceElementId?.ToString(CultureInfo.InvariantCulture),
                reference?.SourceId, list.Name, list.RangeType.ToString(), list.Comment?.GetText(culture), list.Entries.Count.ToString(CultureInfo.InvariantCulture) }) AppendViewValue(html, value);
            html.Append("</tr>");
        }
        html.Append("</tbody></table></div>");
        if (!fields.Any(field => field.TextList!.Entries.Count > 0)) return;
        html.Append("<h2>Field text-list entries</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Field</th><th scope=\"col\">Index</th><th scope=\"col\">Element ID</th><th scope=\"col\">Source reference</th><th scope=\"col\">Position</th><th scope=\"col\">Entry</th><th scope=\"col\">From</th><th scope=\"col\">To</th><th scope=\"col\">Default entry</th><th scope=\"col\">Text</th></tr></thead><tbody>");
        foreach (var field in fields)
        {
            field.References.TryGetValue("TextList", out var reference);
            var position = 0;
            foreach (var entry in field.TextList!.Entries)
            {
                html.Append("<tr>");
                foreach (var value in new[] { field.Name, field.SourceIndex?.ToString(CultureInfo.InvariantCulture), field.SourceElementId?.ToString(CultureInfo.InvariantCulture),
                    reference?.SourceId, (++position).ToString(CultureInfo.InvariantCulture), entry.Name, entry.From.ToString(CultureInfo.InvariantCulture),
                    entry.To.ToString(CultureInfo.InvariantCulture), FormatFlag(entry.Default), entry.Text?.GetText(culture) }) AppendViewValue(html, value);
                html.Append("</tr>");
            }
        }
        html.Append("</tbody></table></div>");
    }

    private static void AppendPlcArrays(StringBuilder html, HmiRecipe recipe)
    {
        var arrays = recipe.Parameters.Where(p => p.SourcePlcArray != null).Select(p => (Kind: "Field", p.Name, Array: p.SourcePlcArray!))
            .Concat(recipe.SourcePlcDeclarations.Where(d => d.Array != null).Select(d => (Kind: "Composite declaration", d.Name, Array: d.Array!))).ToArray();
        if (arrays.Length == 0) return;
        html.Append("<h2>Source PLC array declarations</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Kind</th><th scope=\"col\">Declaration</th><th scope=\"col\">Original type</th><th scope=\"col\">Element type</th><th scope=\"col\">Open array</th><th scope=\"col\">Declared dimensions</th><th scope=\"col\">Resolved dimensions</th></tr></thead><tbody>");
        foreach (var entry in arrays)
        {
            html.Append("<tr>");
            foreach (var value in new[] { entry.Kind, entry.Name, entry.Array.OriginalTypeName, entry.Array.ElementTypeName, FormatFlag(entry.Array.IsStarArray),
                entry.Array.Dimensions?.Count.ToString(CultureInfo.InvariantCulture), entry.Array.ResolvedDimensions?.Count.ToString(CultureInfo.InvariantCulture) }) AppendViewValue(html, value);
            html.Append("</tr>");
        }
        html.Append("</tbody></table></div>");
        if (!arrays.Any(e => e.Array.Dimensions?.Count > 0 || e.Array.ResolvedDimensions?.Count > 0)) return;
        html.Append("<h2>Source PLC array bounds</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Kind</th><th scope=\"col\">Declaration</th><th scope=\"col\">Bounds</th><th scope=\"col\">List position</th><th scope=\"col\">Start</th><th scope=\"col\">End</th></tr></thead><tbody>");
        foreach (var entry in arrays)
        {
            void Row(string kind, int position, string? start, string? end)
            {
                html.Append("<tr>");
                foreach (var value in new[] { entry.Kind, entry.Name, kind, position.ToString(CultureInfo.InvariantCulture), start, end }) AppendViewValue(html, value);
                html.Append("</tr>");
            }
            if (entry.Array.Dimensions != null) for (var i = 0; i < entry.Array.Dimensions.Count; i++) Row("Declared", i + 1, entry.Array.Dimensions[i].Start, entry.Array.Dimensions[i].End);
            if (entry.Array.ResolvedDimensions != null) for (var i = 0; i < entry.Array.ResolvedDimensions.Count; i++) Row("Resolved", i + 1, entry.Array.ResolvedDimensions[i].Start.ToString(CultureInfo.InvariantCulture), entry.Array.ResolvedDimensions[i].End.ToString(CultureInfo.InvariantCulture));
        }
        html.Append("</tbody></table></div>");
    }

    private static void AppendRecipeViews(StringBuilder html, HmiRecipe recipe, CultureInfo? culture)
    {
        if (recipe.Views.Count == 0) return;
        html.Append("<h2>Recipe views</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Name</th><th scope=\"col\">Source ID</th><th scope=\"col\">Number</th><th scope=\"col\">Display name</th><th scope=\"col\">Statement (stored)</th><th scope=\"col\">Display name source ID</th><th scope=\"col\">Display name reference</th></tr></thead><tbody>");
        foreach (var view in recipe.Views)
        {
            html.Append("<tr>");
            AppendViewValue(html, view.Name); AppendViewValue(html, view.SourceId);
            AppendViewValue(html, view.SourceNumber?.ToString(CultureInfo.InvariantCulture));
            AppendViewValue(html, view.DisplayName?.GetText(culture)); AppendViewValue(html, view.Statement);
            AppendViewValue(html, view.DisplayNameReference?.SourceId); AppendViewValue(html, view.DisplayNameReference?.Name);
            html.Append("</tr>");
        }
        html.Append("</tbody></table></div>");
        if (!recipe.Views.Any(v => v.Elements.Count > 0)) return;
        html.Append("<h2>Recipe view elements</h2><div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">View</th><th scope=\"col\">View source ID</th><th scope=\"col\">Name</th><th scope=\"col\">Source ID</th><th scope=\"col\">Number</th><th scope=\"col\">Display name</th><th scope=\"col\">Target source ID</th><th scope=\"col\">Target name</th><th scope=\"col\">Display name source ID</th><th scope=\"col\">Display name reference</th></tr></thead><tbody>");
        foreach (var view in recipe.Views) foreach (var element in view.Elements)
        {
            html.Append("<tr>");
            AppendViewValue(html, view.Name); AppendViewValue(html, view.SourceId);
            AppendViewValue(html, element.Name); AppendViewValue(html, element.SourceId);
            AppendViewValue(html, element.SourceNumber?.ToString(CultureInfo.InvariantCulture));
            AppendViewValue(html, element.DisplayName?.GetText(culture));
            AppendViewValue(html, element.TargetElement?.SourceId); AppendViewValue(html, element.TargetElement?.Name);
            AppendViewValue(html, element.DisplayNameReference?.SourceId); AppendViewValue(html, element.DisplayNameReference?.Name);
            html.Append("</tr>");
        }
        html.Append("</tbody></table></div>");
    }

    private static void AppendViewValue(StringBuilder html, string? value)
        => html.Append("<td data-value-state=\"").Append(value is null ? "missing" : "present").Append("\">")
            .Append(Encode(value ?? "Missing")).Append("</td>");

    private static void AppendConfiguration(StringBuilder html, string label, string? value)
    {
        if (value != null) html.Append("<dt>").Append(label).Append("</dt><dd>").Append(Encode(value)).Append("</dd>");
    }

    private static string Encode(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);
    private static string? FormatFlag(bool? value) => value is null ? null : value.Value ? "Yes" : "No";
}
