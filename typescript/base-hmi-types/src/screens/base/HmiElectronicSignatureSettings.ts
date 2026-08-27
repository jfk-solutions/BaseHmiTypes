export enum HmiElectronicSignatureDomainSource {
  Constant = "Constant",
  Variable = "Variable",
}

export class HmiElectronicSignatureSettings {
  required?: boolean;
  allowBlankComment?: boolean;
  requireReAuthentication?: boolean;
  requireCounterSignature?: boolean;
  authorizedGroup?: string;
  domainNameVisible?: boolean;
  domainNameSource?: HmiElectronicSignatureDomainSource;
  domainName?: string;
  variableDomainName?: string;
  domainNameDisabled?: boolean;
}
