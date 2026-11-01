using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.Xml.Linq;

namespace BaseHmiTypes.Converters.UnifiedXml;

/// <summary>Compact multilingual HTML payloads; native body/paragraph wrappers stay out of ordinary XML.</summary>
internal static class HmiUnifiedXmlText
{
    internal const string EmptyFormattedText = "<body><p/></body>";
    private static readonly XNamespace N = "urn:s7mcp:wincc-unified:2";
    private static readonly HashSet<string> Blocks = new(StringComparer.OrdinalIgnoreCase)
    { "p", "div", "ul", "ol", "li", "dl", "dt", "dd", "table", "thead", "tbody", "tfoot", "tr", "td", "th",
      "h1", "h2", "h3", "h4", "h5", "h6", "pre", "blockquote", "hr", "section", "article", "header", "footer",
      "main", "aside", "nav", "address", "figure", "figcaption", "form", "fieldset", "details", "summary", "menu", "center" };

    internal static bool IsPayloadAttribute(XAttribute attribute) =>
        attribute.Name.Namespace == XNamespace.Xml || attribute.Name.Namespace == XNamespace.None &&
        (attribute.Name.LocalName == "paragraph" || attribute.Name.LocalName.StartsWith("body-", StringComparison.Ordinal));

    internal static void Write(XElement item, string text)
    {
        item.Attribute("text")?.Remove();
        item.RemoveNodes();
        foreach (var attribute in item.Attributes().Where(IsPayloadAttribute).ToArray()) attribute.Remove();
        if (text == EmptyFormattedText) return;
        XElement? body = null;
        if (text.StartsWith("<body", StringComparison.Ordinal) && !Regex.IsMatch(text, @"&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9a-fA-F]+;)"))
        {
            try
            {
                using var reader = XmlReader.Create(new System.IO.StringReader(ProtectWhitespace(text)),
                    new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null, MaxCharactersInDocument = 16 * 1024 * 1024 });
                body = XElement.Load(reader, LoadOptions.PreserveWhitespace);
                if (body.Name != XName.Get("body")) body = null;
            }
            catch (XmlException) { } // Literal strings that resemble markup remain plain text.
        }
        if (body == null) { item.SetAttributeValue("text", text); return; }
        foreach (var attribute in body.Attributes().Where(a => !a.IsNamespaceDeclaration))
        {
            if (attribute.Name.Namespace == XNamespace.Xml) item.Add(new XAttribute(attribute));
            else if (attribute.Name.Namespace == XNamespace.None) item.SetAttributeValue("body-" + attribute.Name.LocalName, attribute.Value);
            else throw new FormatException("Unsupported namespace on formatted body attribute.");
        }
        var nodes = body.Nodes().ToArray();
        var paragraph = nodes.Length == 1 && nodes[0] is XElement p && p.Name == XName.Get("p") && !p.HasAttributes;
        if (paragraph) nodes = ((XElement)nodes[0]).Nodes().ToArray();
        var inferred = !nodes.OfType<XElement>().Any(e => Blocks.Contains(e.Name.LocalName));
        if (paragraph != inferred) item.SetAttributeValue("paragraph", paragraph ? "True" : "False");
        if (nodes.Length > 0)
        {
            // XmlWriter treats this as mixed content and does not indent inside the payload.
            item.Add(new XText(""));
            item.Add(nodes.Select(node => Copy(node, N)));
        }
    }

    internal static string Read(XElement item)
    {
        var plain = item.Attribute("text");
        var nodes = item.Nodes().Where(node => node is not XText t || t.Value.Length != 0).ToArray();
        var metadata = item.Attributes().Where(IsPayloadAttribute).ToArray();
        if (plain != null)
        {
            if (nodes.Length != 0 || metadata.Length != 0) throw new FormatException("Plain text and formatted content cannot both be supplied.");
            return plain.Value;
        }
        if (nodes.Length == 0 && metadata.Length == 0) return EmptyFormattedText;
        var paragraphValue = (string?)item.Attribute("paragraph");
        if (paragraphValue != null && paragraphValue != "True" && paragraphValue != "False") throw new FormatException("Invalid paragraph flag.");
        var paragraph = paragraphValue == "True" || paragraphValue == null && !nodes.OfType<XElement>().Any(e => Blocks.Contains(e.Name.LocalName));
        var body = new XElement("body");
        foreach (var attribute in metadata.Where(a => a.Name.LocalName != "paragraph" || a.Name.Namespace != XNamespace.None))
        {
            if (attribute.Name.Namespace == XNamespace.Xml) body.Add(new XAttribute(attribute));
            else
            {
                var name = attribute.Name.LocalName.Substring(5);
                if (name.Length == 0) throw new FormatException("Missing formatted body attribute name.");
                body.SetAttributeValue(name, attribute.Value);
            }
        }
        var values = nodes.Select(node => Copy(node, XNamespace.None));
        body.Add(paragraph ? new XElement("p", values) : (object)values);
        return Serialize(body);
    }

    private static XNode Copy(XNode node, XNamespace target)
    {
        if (node is XElement element)
        {
            if (element.Name.Namespace != XNamespace.None && element.Name.Namespace != N)
                throw new FormatException("Unsupported namespace on HTML formatting element.");
            var result = new XElement(target + element.Name.LocalName);
            foreach (var attribute in element.Attributes().Where(a => !a.IsNamespaceDeclaration))
            {
                if (attribute.Name.Namespace != XNamespace.None && attribute.Name.Namespace != XNamespace.Xml)
                    throw new FormatException("Unsupported namespace on HTML formatting attribute.");
                result.Add(new XAttribute(attribute));
            }
            result.Add(element.Nodes().Select(child => Copy(child, target)));
            return result;
        }
        if (node is XText text) return new XText(text.Value);
        if (node is XComment comment) return new XComment(comment.Value);
        throw new FormatException("Unsupported formatted text node.");
    }

    private static string ProtectWhitespace(string value)
    {
        var result = new StringBuilder(); var inTag = false; var quote = '\0';
        foreach (var ch in value)
        {
            if (inTag && quote != '\0')
            {
                result.Append(ch == '\r' ? "&#xD;" : ch == '\n' ? "&#xA;" : ch == '\t' ? "&#x9;" : ch.ToString());
                if (ch == quote) quote = '\0';
            }
            else
            {
                result.Append(!inTag && ch == '\r' ? "&#xD;" : ch.ToString());
                if (ch == '<') inTag = true;
                else if (inTag && (ch == '"' || ch == '\'')) quote = ch;
                else if (ch == '>') inTag = false;
            }
        }
        return result.ToString();
    }

    private static string Escape(string value, bool attribute = false)
    {
        var escaped = value.Replace("&", "&amp;").Replace("<", "&lt;").Replace(">", "&gt;");
        return attribute ? escaped.Replace("\r", "&#xD;").Replace("\"", "&quot;").Replace("\n", "&#xA;").Replace("\t", "&#x9;") : escaped;
    }
    private static string Serialize(XNode node)
    {
        if (node is XText text) return Escape(text.Value);
        if (node is XComment comment) return "<!--" + comment.Value + "-->";
        var element = (XElement)node;
        var attrs = string.Concat(element.Attributes().Select(a => " " + (a.Name.Namespace == XNamespace.Xml ? "xml:" : "") + a.Name.LocalName + "=\"" + Escape(a.Value, true) + "\""));
        var nodes = element.Nodes().Where(n => n is not XText t || t.Value.Length != 0).ToArray();
        return "<" + element.Name.LocalName + attrs + (nodes.Length == 0 ? "/>" : ">" + string.Concat(nodes.Select(Serialize)) + "</" + element.Name.LocalName + ">");
    }
}
