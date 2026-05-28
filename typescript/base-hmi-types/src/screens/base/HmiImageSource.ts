export enum HmiImageSourceKind {
  Uri = "Uri",
  DataUri = "DataUri",
}

export interface HmiImageSource {
  uri?: string;
  kind: HmiImageSourceKind;
}
