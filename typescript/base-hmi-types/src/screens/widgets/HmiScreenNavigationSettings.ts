import { HmiProperty } from "../base.js";
import { HmiDisplayParameterSource } from "./HmiDisplayParameterSource.js";

export class HmiScreenNavigationSettings {
  targetScreen?: HmiProperty<string>;
  parameterFile?: string;
  parameterList?: string;
  parameterSource?: HmiDisplayParameterSource;
  useVariableTarget?: boolean;
  positionEnabled?: boolean;
  useVariablePosition?: boolean;
  positionX?: HmiProperty<number>;
  positionY?: HmiProperty<number>;
}
