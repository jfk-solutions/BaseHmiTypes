import { HmiProperty } from "./HmiProperty.js";

export class HmiTrendPen {
  /** One-based pen number as exposed by the engineering system. */
  number = 0;
  name?: string;
  value?: HmiProperty<number>;
}
