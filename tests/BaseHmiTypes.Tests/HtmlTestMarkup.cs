using System.Text.RegularExpressions;

namespace BaseHmiTypes.Tests;

internal static class HtmlTestMarkup
{
    // Element assertions must not match template strings in the embedded runtime.
    public static string WithoutScripts(string html) => Regex.Replace(html, "<script\\b[^>]*>.*?</script>", "", RegexOptions.Singleline | RegexOptions.IgnoreCase);
}
