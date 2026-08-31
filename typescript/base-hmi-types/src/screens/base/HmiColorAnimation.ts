import { HmiColorAnimationState } from "./HmiColorAnimationState.js";

export class HmiColorAnimation {
  expression?: string;
  /** Complete blink cycle duration in seconds. */
  blinkRate?: number;
  readonly states: HmiColorAnimationState[] = [];
}
