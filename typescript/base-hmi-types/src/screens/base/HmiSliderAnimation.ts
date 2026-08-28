import { HmiAnimationRangeSource } from "./HmiAnimationRangeSource.js";

/** Describes a writable slider animation that maps object movement to a tag value. */
export class HmiSliderAnimation {
  tag?: string;
  rangeSource?: HmiAnimationRangeSource;
  tagMinimum?: number;
  tagMaximum?: number;
  minimumTag?: string;
  maximumTag?: string;
  offsetMinimum?: number;
  offsetMaximum?: number;
}
