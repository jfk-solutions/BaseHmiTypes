export abstract class HmiModelBase {
  id?: string;
  name?: string;
}

export abstract class HmiScreenModelBase extends HmiModelBase {}

export abstract class HmiScreenBase extends HmiScreenModelBase {
  readonly layers: HmiLayer[] = [];
}

export class HmiLayer extends HmiModelBase {
  visible = true;
  locked = false;
  readonly items: HmiScreenItemBase[] = [];
}

export abstract class HmiScreenItemBase extends HmiScreenModelBase {
  x = 0;
  y = 0;
  width = 0;
  height = 0;
  visible = true;
}

export abstract class HmiLayoutContainerBase extends HmiScreenItemBase {
  readonly items: HmiScreenItemBase[] = [];
}

export abstract class HmiSimpleScreenItemBase extends HmiScreenItemBase {}

export abstract class HmiWindowBase extends HmiScreenItemBase {}

export class HmiGroup extends HmiLayoutContainerBase {}

export class HmiCustomWidgetContainer extends HmiSimpleScreenItemBase {}

export abstract class HmiContainerBase extends HmiWindowBase {
  readonly items: HmiScreenItemBase[] = [];
}

export abstract class HmiControlWindowBase extends HmiWindowBase {}

export class HmiDcsFaceplateContainer extends HmiWindowBase {}

export class HmiSymbolContainer extends HmiCustomWidgetContainer {}

export class HmiCustomWebControlContainer extends HmiContainerBase {}

export class HmiDotNetControlContainer extends HmiContainerBase {}

export class HmiFaceplateContainer extends HmiContainerBase {}

export class HmiSwacContainer extends HmiContainerBase {}

export class HmiFaceplateType extends HmiScreenBase {}

export abstract class HmiCompanionBase extends HmiControlWindowBase {}

export abstract class HmiTrendControlBase extends HmiControlWindowBase {}
