import { HmiProperty } from "./HmiProperty.js";
import { HmiTrendOverlayAnchorType } from "./HmiTrendOverlayAnchorType.js";

export class HmiTrendOverlay {
  snapshotName?: string;
  anchorType?: HmiProperty<HmiTrendOverlayAnchorType>;
  startTime?: string;
  useDefaultStartTime?: HmiProperty<boolean>;
  offsetPercent?: HmiProperty<number>;
  visible?: HmiProperty<boolean>;
  startPenNumber?: HmiProperty<number>;
  endPenNumber?: HmiProperty<number>;
}
