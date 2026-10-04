using System.Globalization;
using System.Net;
using System.Text;
using BaseHmiTypes.Recipes;

namespace BaseHmiTypes.Converters.Html;

/// <summary>Renders stored engineering recipe definitions and records as a standalone HTML document.</summary>
public sealed class HmiRecipeToHtmlConverter
{
    public string Convert(HmiRecipe recipe)
    {
        if (recipe is null) throw new ArgumentNullException(nameof(recipe));
        var html = new StringBuilder("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>");
        html.Append(Encode(recipe.Name ?? "Recipe"));
        html.Append("</title><style>body{font-family:system-ui,sans-serif;margin:24px;color:#202124}table{border-collapse:collapse;margin-bottom:24px}th,td{border:1px solid #ccd0d5;padding:8px;text-align:left;vertical-align:top;white-space:pre-wrap}thead{background:#edf1f5}td[data-value-state=missing],td[data-value-state=null]{color:#666;font-style:italic}.table-scroll{overflow:auto}</style></head><body><h1>");
        html.Append(Encode(recipe.Name ?? "Recipe")).Append("</h1>");
        if (recipe.Comment != null) html.Append("<p>").Append(Encode(recipe.Comment)).Append("</p>");
        html.Append("<h2>Fields</h2><div class=\"table-scroll\"><table><thead><tr>");
        foreach (var header in new[] { "Index", "Name", "Tag", "Data type", "Unit", "Minimum", "Maximum", "Comment", "Element ID", "Default", "Decimal places", "Maximum length", "Tag array count", "Required", "Unique", "Indexed" })
            html.Append("<th scope=\"col\">").Append(header).Append("</th>");
        html.Append("</tr></thead><tbody>");
        foreach (var field in recipe.Parameters)
        {
            html.Append("<tr>");
            foreach (var value in new[] { field.SourceIndex?.ToString(CultureInfo.InvariantCulture), field.Name,
                         field.Tag, field.DataType, field.Unit, field.MinimumValue, field.MaximumValue, field.Comment,
                         field.SourceElementId?.ToString(CultureInfo.InvariantCulture), field.DefaultValue,
                         field.DecimalPlaces?.ToString(CultureInfo.InvariantCulture), field.MaximumLength?.ToString(CultureInfo.InvariantCulture),
                         field.TagArrayCount?.ToString(CultureInfo.InvariantCulture), FormatFlag(field.Required), FormatFlag(field.Unique), FormatFlag(field.Indexed) })
                html.Append("<td>").Append(Encode(value)).Append("</td>");
            html.Append("</tr>");
        }
        html.Append("</tbody></table></div><h2>Stored records</h2>");
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
            html.Append("<div class=\"table-scroll\"><table><thead><tr><th scope=\"col\">Record</th><th scope=\"col\">Number</th>");
            foreach (var column in columns) html.Append("<th scope=\"col\">").Append(Encode(column)).Append("</th>");
            html.Append("</tr></thead><tbody>");
            foreach (var record in recipe.DataSets)
            {
                html.Append("<tr><th scope=\"row\">").Append(Encode(record.Name)).Append("</th><td>")
                    .Append(record.SourceNumber?.ToString(CultureInfo.InvariantCulture)).Append("</td>");
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
        return html.Append("</body></html>").ToString();
    }

    private static string Encode(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);
    private static string? FormatFlag(bool? value) => value is null ? null : value.Value ? "Yes" : "No";
}
