using System.Globalization;
using BaseHmiTypes.Common;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiMultilingualTextTests
{
    [TestMethod]
    public void ReturnsCultureSpecificAndFallbackTextParts()
    {
        var text = HmiMultilingualText.FromText("Speed");
        text.Parts[-1] = [new HmiTextPart { Kind = HmiTextPartKind.Literal, Text = "Speed " }];
        text.Parts[1031] = [new HmiTextPart
        {
            Kind = HmiTextPartKind.NumericVariable,
            SourceText = "/*N:3 MotorSpeed NOFILL DP:0*/",
            Expression = "MotorSpeed",
            FieldLength = 3,
            PreviewText = "###"
        }];

        Assert.AreEqual("MotorSpeed", text.GetParts(CultureInfo.GetCultureInfo(1031)).Single().Expression);
        Assert.AreEqual("Speed ", text.GetParts(CultureInfo.GetCultureInfo(1033)).Single().Text);
    }
}
