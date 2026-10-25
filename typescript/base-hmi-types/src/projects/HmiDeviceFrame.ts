/** Coordinates are in the SVG viewBox, independent of display resolution. */
export class HmiDeviceFrameBounds {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
}

/** A physical input is either an HMI key or a hardware signal handled by an adapter. */
export enum HmiDeviceInputKind { RuntimeKey = "RuntimeKey", HardwareSignal = "HardwareSignal" }

export type HmiDeviceFrameLedEncoding = 'off-fast-slow-on' | 'off-slow-fast-on' | 'off-flash-red-green';

/** Assignment in a normalized logical LED image; no PLC address is inferred. */
export class HmiDeviceFrameLedBinding {
  outputCode = '';
  ledId?: string;
  bitIndex = 0;
  bitCount = 2;
}

export class HmiDeviceFrameLedRouting {
  encoding: HmiDeviceFrameLedEncoding = 'off-fast-slow-on';
  readonly bindings: HmiDeviceFrameLedBinding[] = [];
}

export class HmiDeviceFrameControl {
  id = "";
  label = "";
  bounds = new HmiDeviceFrameBounds();
  inputKind = HmiDeviceInputKind.RuntimeKey;
  /** Native key identity (e.g. F1, Enter), or adapter-specific hardware signal. */
  inputCode = "";
}

export class HmiDeviceFrameLed {
  id = "";
  label = "";
  bounds = new HmiDeviceFrameBounds();
  offColor = "#343b32";
  onColor = "#70ee54";
  /** Optional native output identity. Protocol addressing belongs to the project/adapter. */
  outputCode?: string;
}

/** Passive device artwork and geometry. No scripts or simulator state belong in the SVG. */
export class HmiDeviceFrame {
  id = "";
  name = "";
  /** Schematic drawings must not imply measured enclosure dimensions. */
  isSchematic = true;
  width = 0;
  height = 0;
  svg = "";
  displayBounds = new HmiDeviceFrameBounds();
  displayWidth = 0;
  displayHeight = 0;
  controls: HmiDeviceFrameControl[] = [];
  leds: HmiDeviceFrameLed[] = [];
}
