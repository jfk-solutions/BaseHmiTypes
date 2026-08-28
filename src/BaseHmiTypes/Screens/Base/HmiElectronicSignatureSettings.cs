using BaseHmiTypes.Common;

namespace BaseHmiTypes.Screens.Base;

public enum HmiElectronicSignatureDomainSource
{
    Constant,
    Variable
}

public sealed class HmiElectronicSignatureSettings
{
    public bool? Required { get; set; }

    public bool? AllowBlankComment { get; set; }

    public bool? ShowConfirmationMessage { get; set; }

    public HmiMultilingualText? ConfirmationMessage { get; set; }

    public bool? RequireReAuthentication { get; set; }

    public bool? RequireCounterSignature { get; set; }

    public string? AuthorizedGroup { get; set; }

    public bool? DomainNameVisible { get; set; }

    public HmiElectronicSignatureDomainSource? DomainNameSource { get; set; }

    public string? DomainName { get; set; }

    public string? VariableDomainName { get; set; }

    public bool? DomainNameDisabled { get; set; }
}
