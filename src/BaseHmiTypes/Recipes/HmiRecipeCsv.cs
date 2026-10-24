using System.Globalization;
using System.Text;

namespace BaseHmiTypes.Recipes;

/// <summary>Documented TIA engineering CSV profile; runtime-native layouts are version dependent.</summary>
public static class HmiRecipeCsv
{
    public static IReadOnlyList<HmiRecipeCsvRecord> Parse(string text,IReadOnlyList<string> parameters,char separator=';')
    {
        Validate(parameters,separator);
        if(text is null || text.Length>16*1024*1024)throw new FormatException("Recipe CSV exceeds the text limit");
        if(text.StartsWith("\uFEFF",StringComparison.Ordinal))text=text.Substring(1);
        var rows=new List<List<string>>();var row=new List<string>();var field=new StringBuilder();var quoted=false;var closed=false;
        void Cell(){row.Add(field.ToString());field.Clear();closed=false;if(row.Count>parameters.Count+3)throw new FormatException("Too many recipe CSV columns");}
        void Line(){Cell();rows.Add(row);row=new List<string>();if(rows.Count>100001)throw new FormatException("Too many recipe CSV records");}
        for(var i=0;i<text.Length;i++) {
            var c=text[i];
            if(quoted){if(c=='"'){if(i+1<text.Length && text[i+1]=='"'){field.Append('"');i++;}else{quoted=false;closed=true;}}else field.Append(c);continue;}
            if(c==separator){Cell();continue;}
            if(c=='\r' || c=='\n'){if(c=='\r' && i+1<text.Length && text[i+1]=='\n')i++;Line();continue;}
            if(closed)throw new FormatException("Characters after quoted recipe CSV field");
            if(c=='"'){if(field.Length>0)throw new FormatException("Quote inside unquoted recipe CSV field");quoted=true;}else field.Append(c);
        }
        if(quoted)throw new FormatException("Unterminated recipe CSV field");
        if(field.Length>0 || closed || row.Count>0)Line();
        var header=new[]{"ID"}.Concat(parameters).Concat(new[]{"LastUser","LastAccess[UTC]"}).ToArray();
        if(rows.Count==0 || !rows[0].SequenceEqual(header))throw new FormatException("Recipe CSV schema mismatch");
        var ids=new HashSet<long>();var result=new List<HmiRecipeCsvRecord>();
        foreach(var cells in rows.Skip(1)) {
            if(cells.Count!=header.Length || cells[0].Length==0 || cells[0][0]=='0' || cells[0].Any(c=>c<'0'||c>'9') || !long.TryParse(cells[0],NumberStyles.None,CultureInfo.InvariantCulture,out var id) || id>9007199254740991L || !ids.Add(id))throw new FormatException("Duplicate or invalid recipe CSV ID");
            var record=new HmiRecipeCsvRecord {Id=id,LastUser=cells[cells.Count-2],LastAccess=cells[cells.Count-1]};
            for(var i=0;i<parameters.Count;i++)record.Values[parameters[i]]=cells[i+1];result.Add(record);
        }
        return result;
    }
    public static string Write(IReadOnlyList<HmiRecipeCsvRecord> records,IReadOnlyList<string> parameters,char separator=';')
    {
        Validate(parameters,separator);if(records.Count>100000)throw new FormatException("Too many recipe CSV records");
        if(records.Any(record=>record.ArrayValues.Count!=0 || record.SparseArrayValues.Count!=0 || record.BinaryValues.Count!=0))throw new FormatException("Engineering CSV does not define array columns");
        long length=(long)(records.Count+1)*(parameters.Count+4);
        string Quote(string value){if(value is null)throw new FormatException("Recipe CSV requires string cells");length+=value.Length+2;foreach(var c in value)if(c=='"')length++;if(length>16*1024*1024)throw new FormatException("Recipe CSV exceeds the text limit");return "\""+value.Replace("\"","\"\"")+"\"";}
        var rows=new List<IEnumerable<string>> {new[]{"ID"}.Concat(parameters).Concat(new[]{"LastUser","LastAccess[UTC]"})};
        rows.AddRange(records.Select(r=>new[]{r.Id.ToString(CultureInfo.InvariantCulture)}.Concat(parameters.Select(p=>r.Values[p])).Concat(new[]{r.LastUser,r.LastAccess})));
        var text=string.Join("\r\n",rows.Select(r=>string.Join(separator.ToString(),r.Select(Quote))))+"\r\n";
        Parse(text,parameters,separator);return text;
    }
    private static void Validate(IReadOnlyList<string> parameters,char separator)
    {
        if(separator!=';' && separator!=',' && separator!='\t' || parameters.Count>10000 || parameters.Any(p=>string.IsNullOrEmpty(p) || p=="ID" || p=="LastUser" || p=="LastAccess[UTC]") || parameters.Distinct(StringComparer.Ordinal).Count()!=parameters.Count)throw new FormatException("Invalid recipe CSV schema or separator");
    }
}

public sealed class HmiRecipeCsvRecord
{
    /// <summary>Optional record name supplied by formats with a separate name row.</summary>
    public string? Name {get;set;}
    public long Id {get;set;}
    public IDictionary<string,string> Values {get;}=new Dictionary<string,string>(StringComparer.Ordinal);
    public IDictionary<string,HmiRecipeSparseArray> SparseArrayValues {get;}=new Dictionary<string,HmiRecipeSparseArray>(StringComparer.Ordinal);
    public IDictionary<string,IDictionary<string,string>> BinaryValues {get;}=new Dictionary<string,IDictionary<string,string>>(StringComparer.Ordinal);
    public IDictionary<string,IList<string>> ArrayValues {get;}=new Dictionary<string,IList<string>>(StringComparer.Ordinal);
    public string LastUser {get;set;}="";
    public string LastAccess {get;set;}="";
}
