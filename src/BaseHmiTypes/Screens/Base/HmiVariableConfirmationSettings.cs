namespace BaseHmiTypes.Screens.Base;

using BaseHmiTypes.Screens.Widgets;

public sealed class HmiVariableConfirmationSettings
{
    public bool? Enabled { get; set; }

    public string? Selector { get; set; }

    public double? ConfirmationValue { get; set; }

    public double? FirstSignatureValue { get; set; }

    public double? SecondSignatureValue { get; set; }

    public HmiConfirmationDialogSettings? ConfirmationDialog { get; set; }

    public HmiElectronicSignatureSettings? FirstSignature { get; set; }

    public HmiElectronicSignatureSettings? SecondSignature { get; set; }
}
