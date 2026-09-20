import { HmiAnimationRangeSource } from "./HmiAnimationRangeSource.js";
import { HmiFillDirection } from "./HmiFillDirection.js";

export class HmiFillAnimation {
  expression?: string;
  /** Static value used to preview a dynamic expression. */
  expressionFallback?: number;
  rangeSource?: HmiAnimationRangeSource;
  expressionMinimum?: number;
  expressionMaximum?: number;
  expressionMinimumTag?: string;
  expressionMaximumTag?: string;
  fillMinimum?: number;
  fillMaximum?: number;
  direction?: HmiFillDirection;
  insideOnly?: boolean;
}
