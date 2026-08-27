import { HmiAnimationRangeSource } from "./HmiAnimationRangeSource.js";
import { HmiRangeAnimationOutputUnit } from "./HmiRangeAnimationOutputUnit.js";

/** Describes a linear animation that maps an input expression range to an output range. */
export class HmiRangeAnimation {
  expression?: string;
  rangeSource?: HmiAnimationRangeSource;
  expressionMinimum?: number;
  expressionMaximum?: number;
  expressionMinimumTag?: string;
  expressionMaximumTag?: string;
  outputMinimum?: number;
  outputMaximum?: number;
  outputUnit?: HmiRangeAnimationOutputUnit;
}
