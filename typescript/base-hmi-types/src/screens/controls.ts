import {
  HmiCompanionBase,
  HmiControlWindowBase,
  HmiSimpleScreenItemBase,
  HmiTrendControlBase,
} from "./base.js";

export class HmiAlarmLineControl extends HmiSimpleScreenItemBase {}

export class HmiAlarmControl extends HmiControlWindowBase {}

export class HmiDataGridControl extends HmiControlWindowBase {}

export class HmiDetailedParameterControl extends HmiControlWindowBase {}

export class HmiMediaControl extends HmiControlWindowBase {}

export class HmiObjectExplorerControl extends HmiControlWindowBase {}

export class HmiProcessControl extends HmiControlWindowBase {}

export class HmiProcessDiagnosisGraphOverviewControl extends HmiControlWindowBase {}

export class HmiProcessDiagnosisOverviewControl extends HmiControlWindowBase {}

export class HmiProcessDiagnosisPlcCodeViewerControl extends HmiControlWindowBase {}

export class HmiSystemDiagnosisControl extends HmiControlWindowBase {}

export class HmiWebControl extends HmiControlWindowBase {}

export class HmiProcessDiagnosisCriteriaAnalysisControl extends HmiCompanionBase {}

export class HmiTrendCompanion extends HmiCompanionBase {}

export class HmiFunctionTrendControl extends HmiTrendControlBase {}

export class HmiTrendControl extends HmiTrendControlBase {}
