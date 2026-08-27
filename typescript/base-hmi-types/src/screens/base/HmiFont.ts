import { HmiProperty } from "./HmiProperty.js";

export class HmiFont {
  name?: HmiProperty<string>;
  size?: HmiProperty<number>;
  characterWidth?: HmiProperty<number>;
  bold?: HmiProperty<boolean>;
  italic?: HmiProperty<boolean>;
  underline?: HmiProperty<boolean>;
  strikethrough?: HmiProperty<boolean>;
}
