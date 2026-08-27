import { HmiCustomWidgetContainer } from "./HmiCustomWidgetContainer.js";
import { HmiAxHostState } from "./HmiAxHostState.js";
import { HmiObjectType } from "./HmiObjectType.js";

export class HmiOcxControl extends HmiCustomWidgetContainer {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiOcxControl;
  }

  ocxGuid?: string;
  ocxName?: string;
  ocxProgramId?: string;
  ocxFileName?: string;
  ocxFileVersion?: string;
  ocxTypeLibrary?: string;
  ocxTypeLibraryVersion?: string;
  ocxState?: Uint8Array;
  ocxStateFormat?: string;
  axHostState?: HmiAxHostState;
}
