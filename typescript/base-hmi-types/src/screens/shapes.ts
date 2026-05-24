import { HmiSimpleScreenItemBase } from "./base.js";

export abstract class HmiShapeBase extends HmiSimpleScreenItemBase {}

export abstract class HmiCentricShapeBase extends HmiShapeBase {
  centerX = 0;
  centerY = 0;
}

export abstract class HmiSurfaceShapeBase extends HmiShapeBase {}

export abstract class HmiCircularShapeBase extends HmiCentricShapeBase {
  radius = 0;
}

export abstract class HmiEllipticalShapeBase extends HmiCentricShapeBase {
  radiusX = 0;
  radiusY = 0;
}

export class HmiRectangle extends HmiSurfaceShapeBase {}

export class HmiText extends HmiSurfaceShapeBase {
  text?: string;
}

export class HmiGraphicView extends HmiSurfaceShapeBase {
  source?: string;
}

export class HmiLine extends HmiSurfaceShapeBase {}

export abstract class HmiPointBasedShapeBase extends HmiSurfaceShapeBase {
  readonly points: HmiPoint[] = [];
}

export class HmiCircle extends HmiCircularShapeBase {}

export class HmiCircleSegment extends HmiCircle {}

export class HmiCircularArc extends HmiCircularShapeBase {
  startAngle = 0;
  sweepAngle = 0;
}

export class HmiEllipse extends HmiEllipticalShapeBase {}

export class HmiEllipseSegment extends HmiEllipse {}

export class HmiEllipticalArc extends HmiEllipticalShapeBase {
  startAngle = 0;
  sweepAngle = 0;
}

export class HmiPolygon extends HmiPointBasedShapeBase {}

export class HmiPolyline extends HmiPointBasedShapeBase {}

export interface HmiPoint {
  x: number;
  y: number;
}
