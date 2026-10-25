import { HmiScreenItemBase } from './HmiScreenItemBase.js';

/** Nonvisual screen-local physical-key target. Native codes are opaque identities. */
export class HmiDeviceKeyBinding extends HmiScreenItemBase {
  inputCode = '';
}
