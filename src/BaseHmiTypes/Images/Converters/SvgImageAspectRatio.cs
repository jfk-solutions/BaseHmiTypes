using System;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
namespace BaseHmiTypes.Images.Converters;

/// <summary>Overrides only the root viewport policy of an embedded SVG copy, preserving the source.</summary>
internal static class SvgImageAspectRatio
{
    public static string? TryOverrideDataUri(string uri, bool keep)
    {
        const string prefix = "data:image/svg+xml";
        if (!uri.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) || uri.Length <= prefix.Length || uri[prefix.Length] is not (';' or ',')) return uri;
        var comma = uri.IndexOf(','); if (comma < 0) return null;
        string text;
        try
        {
            if (uri.Substring(0, comma).EndsWith(";base64", StringComparison.OrdinalIgnoreCase))
            {
                var bytes = Convert.FromBase64String(uri.Substring(comma + 1));
                using var reader = new StreamReader(new MemoryStream(bytes, false), Encoding.UTF8, true);
                text = reader.ReadToEnd();
            }
            else text = Uri.UnescapeDataString(uri.Substring(comma + 1));
        }
        catch (FormatException) { return null; }
        var at = 0;
        void Space() { while (at < text.Length && (char.IsWhiteSpace(text[at]) || text[at] == '\ufeff')) at++; }
        bool At(string value) => at + value.Length <= text.Length && string.CompareOrdinal(text, at, value, 0, value.Length) == 0;
        Space();
        var doctypeSeen = false;
        while (At("<?") || At("<!--") || At("<!DOCTYPE"))
        {
            if (At("<!DOCTYPE"))
            {
                // Copy a bare/external header without parsing a DTD or fetching its URI.
                // Internal subsets remain unsupported, rather than expanding entities.
                if (doctypeSeen) return null;
                var match = Regex.Match(text.Substring(at), "^<!DOCTYPE[ \\t\\r\\n]+svg(?:[ \\t\\r\\n]+(?:SYSTEM[ \\t\\r\\n]+(?:\"[^\"]*\"|'[^']*')|PUBLIC[ \\t\\r\\n]+(?:\"[^\"]*\"|'[^']*')[ \\t\\r\\n]+(?:\"[^\"]*\"|'[^']*')))?[ \\t\\r\\n]*>");
                if (!match.Success) return null;
                at += match.Length; doctypeSeen = true; Space(); continue;
            }
            var endMarker = At("<?") ? "?>" : "-->";
            var end = text.IndexOf(endMarker, at + 2, StringComparison.Ordinal); if (end < 0) return null;
            // Output is UTF-8. Remove an XML encoding declaration instead of retaining
            // a source UTF-16 declaration that would make the copied image undecodable.
            if (At("<?xml") && at + 5 < text.Length && char.IsWhiteSpace(text[at + 5]))
                text = text.Remove(at, end + endMarker.Length - at);
            else at = end + endMarker.Length;
            Space();
        }
        // Do not interpret other declarations, entities or nested SVGs as the root.
        if (at >= text.Length || text[at++] != '<') return null;
        var nameStart = at;
        bool Name(char c) => char.IsLetterOrDigit(c) || c is '_' or ':' or '-' or '.';
        while (at < text.Length && Name(text[at])) at++;
        var name = text.Substring(nameStart, at - nameStart);
        if (doctypeSeen && name != "svg") return null;
        if (name.Substring(name.LastIndexOf(':') + 1) != "svg") return null;
        int? valueStart = null; var valueEnd = 0; var insert = 0;
        while (true)
        {
            var beforeSpace = at; Space();
            if (at >= text.Length) return null;
            if (text[at] == '>' || text[at] == '/')
            {
                insert = at;
                if (text[at] == '/' && (at + 1 >= text.Length || text[at + 1] != '>')) return null;
                break;
            }
            if (at == beforeSpace) return null;
            nameStart = at;
            while (at < text.Length && Name(text[at])) at++;
            if (at == nameStart) return null;
            var attribute = text.Substring(nameStart, at - nameStart);
            Space(); if (at >= text.Length || text[at++] != '=') return null;
            Space(); if (at >= text.Length || text[at] is not ('\'' or '"')) return null;
            var quote = text[at++]; var start = at; var end = text.IndexOf(quote, at); if (end < 0) return null;
            if (attribute == "preserveAspectRatio") { if (valueStart != null) return null; valueStart = start; valueEnd = end; }
            at = end + 1;
        }
        var policy = keep ? "xMidYMid meet" : "none";
        text = valueStart is {} startAt
            ? text.Substring(0, startAt) + policy + text.Substring(valueEnd)
            : text.Substring(0, insert) + " preserveAspectRatio=\"" + policy + "\"" + text.Substring(insert);
        return prefix + ";base64," + Convert.ToBase64String(Encoding.UTF8.GetBytes(text));
    }
}
