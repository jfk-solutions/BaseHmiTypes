import { HmiColorAnimationState } from "./HmiColorAnimationState.js";

export class HmiColorAnimation {
  expression?: string;
  blinkRate?: number;
  readonly states: HmiColorAnimationState[] = [];
}
