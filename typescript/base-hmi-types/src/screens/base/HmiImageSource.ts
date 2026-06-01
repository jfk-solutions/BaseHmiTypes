export enum HmiImageSourceKind {
  Uri = "Uri",
  DataUri = "DataUri",
}

export interface HmiImageSource {
  imageId?: string;
  imageName?: string;
  uri?: string;
  kind: HmiImageSourceKind;
}
