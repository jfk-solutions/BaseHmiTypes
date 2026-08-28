using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Widgets;

public enum HmiSignatureButtonOperation
{
    SetNumericValue,
    SetStringValue,
    SetBooleanValue,
    SetDateTimeValue,
    SendCommand,
    DownloadInputValues
}

public sealed class HmiSignatureButtonSettings
{
    public HmiSignatureButtonOperation? Operation { get; set; }

    public HmiMultilingualText? WindowTitle { get; set; }

    public HmiMultilingualText? OperationDescription { get; set; }

    public double? NumericMinimum { get; set; }

    public double? NumericMaximum { get; set; }

    public int? DecimalPlaces { get; set; }

    public string? Command { get; set; }

    public string? ValueExpression { get; set; }

    public string? DatePartExpression { get; set; }

    public string? TimePartExpression { get; set; }

    public string? DateTimeStringExpression { get; set; }

    public bool? PerformerAuthenticationEnabled { get; set; }

    public string? PerformerGroup { get; set; }

    public bool? ApproverAuthenticationEnabled { get; set; }

    public string? ApproverGroup { get; set; }

    public string? DefaultDomain { get; set; }
}
