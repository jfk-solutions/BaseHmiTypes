using BaseHmiTypes.Screens.Base;
using BaseHmiTypes.Screens.Controls;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiSystemDiagnosisTests
{
    [TestMethod]
    public void DiagnosticsListRetainsDocumentedPresentation()
    {
        var control = new HmiSystemDiagnosisControl
        {
            ViewKind = HmiSystemDiagnosisViewKind.DiagnosticsList,
            KeyNavigation = true,
            WrapAround = true,
            SelectionBackgroundColor = HmiColor.FromArgb(255, 0x10, 0x20, 0x30),
            SelectionForegroundColor = HmiColor.FromArgb(255, 0xF0, 0xE0, 0xD0),
            ContentFont = new HmiFont { Name = "Arial" }
        };

        Assert.IsTrue(control.KeyNavigation!.StaticValue);
        Assert.IsTrue(control.WrapAround!.StaticValue);
        Assert.AreEqual((byte)0x10, control.SelectionBackgroundColor!.StaticValue.Red);
        Assert.AreEqual((byte)0xF0, control.SelectionForegroundColor!.StaticValue.Red);
        Assert.AreEqual("Arial", control.ContentFont.Name!.StaticValue);
    }
}
