import { HmiProperty } from "../base.js";
import { HmiHandshakeResetMode } from "./HmiHandshakeResetMode.js";

export class HmiEnterHandshakeSettings {
  enterSignal?: HmiProperty<number>;
  acknowledgementSignal?: HmiProperty<number>;
  resetMode?: HmiProperty<HmiHandshakeResetMode>;
  controlDelay?: HmiProperty<number>;
  acknowledgementTimeout?: HmiProperty<number>;
  holdTime?: HmiProperty<number>;
}
