using BaseHmiTypes.Alarms;
using Microsoft.VisualStudio.TestTools.UnitTesting;

namespace BaseHmiTypes.Tests;

[TestClass]
public sealed class HmiAlarmListTests
{
    [TestMethod]
    public void RetainsNeutralSourceIdentity()
    {
        var list = new HmiAlarmList
        {
            SourceIdentifier = "Alarms",
            SourceFormatVersion = "1.0",
            SourceProductIdentifier = "{123-456-789}"
        };

        Assert.AreEqual("Alarms", list.SourceIdentifier);
        Assert.AreEqual("1.0", list.SourceFormatVersion);
        Assert.AreEqual("{123-456-789}", list.SourceProductIdentifier);
    }
}
