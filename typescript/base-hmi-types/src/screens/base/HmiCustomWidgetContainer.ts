import { HmiLayoutContainerBase } from "./HmiLayoutContainerBase.js";
import { HmiObjectType } from "./HmiObjectType.js";
import { HmiProperty } from "./HmiProperty.js";

export class HmiCustomWidgetContainer extends HmiLayoutContainerBase {
  constructor() {
    super();
    this.hmiObjectType = HmiObjectType.HmiCustomWidgetContainer;
  }

  resizable?: HmiProperty<boolean>;
  movable?: HmiProperty<boolean>;
  showWindowBorder?: HmiProperty<boolean>;
  showCaption?: HmiProperty<boolean>;
  showMaximizeButton?: HmiProperty<boolean>;
  showCloseButton?: HmiProperty<boolean>;
  alwaysOnTop?: HmiProperty<boolean>;
  hostedApplication?: HmiProperty<string>;
  hostedTemplate?: HmiProperty<string>;
}
