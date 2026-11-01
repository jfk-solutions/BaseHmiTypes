import { unifiedXmlEngineeringTypes } from '../../converters/unified-xml/HmiUnifiedXmlContract.g.js';

export interface HmiUnifiedEngineeringProperty {
  readonly name: string;
  readonly kind: string;
  readonly type?: string;
  readonly enumValues?: Readonly<Record<string, string>>;
}
export interface HmiUnifiedEngineeringMember {
  readonly name: string;
  readonly collection: boolean;
  readonly type?: string;
}
export interface HmiUnifiedEngineeringType {
  readonly name: string;
  readonly tag: string;
  readonly properties: readonly HmiUnifiedEngineeringProperty[];
  readonly members: readonly HmiUnifiedEngineeringMember[];
}

/** Editable engineering settings beyond the neutral preview model, never original XML or parser snapshots. */
export class HmiUnifiedEngineeringObject {
  readonly unmappedProperties: string[] = [];
  static readonly types: readonly HmiUnifiedEngineeringType[] = unifiedXmlEngineeringTypes;
  readonly values: Record<string, unknown> = {};
  constructor(public typeName: string, public tag: string) {}
}

/** Exact runtime type for object-valued properties, including arrays and enum values. */
export class HmiUnifiedEngineeringValue {
  constructor(public kind: string, public typeName: string | undefined, public value: unknown, public encoding?: string) {}
}
