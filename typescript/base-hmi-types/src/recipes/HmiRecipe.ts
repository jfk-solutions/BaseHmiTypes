import { HmiTextList } from "../text-graphic-lists/HmiTextList.js";
import { HmiMultilingualText } from "../common/HmiMultilingualText.js";

export class HmiRecipe {
  classicConfiguration?: HmiClassicRecipeConfiguration;
  sourceId?: number;
  sourceDisplayName?: string;
  storagePath?: string;
  readonly references = new Map<string, HmiRecipeReference>();
  displayName?: HmiMultilingualText;
  infoText?: HmiMultilingualText;
  name?: string;
  comment?: string;
  lastModified?: Date;
  readonly views: HmiRecipeView[] = [];
  readonly parameters: HmiRecipeParameter[] = [];
  readonly dataSets: HmiRecipeDataSet[] = [];
  readonly sourceTagDeclarations: HmiRecipeTagDeclaration[] = [];
  readonly sourcePlcDeclarations: HmiRecipePlcDeclaration[] = [];
}

export enum HmiRecipeCommunicationType { Tags = 0, NoCommunication = 1, RawDataTag = 2 }
export enum HmiRecipeSizeType { Limited = 0, Unlimited = 1 }
export enum HmiRecipeStorageMedia { Database = 0, File = 1, Memory = 2 }

export class HmiClassicRecipeConfiguration {
  sourceNumber?: number;
  maximumRecordCount?: number;
  recipeVersion?: string;
  communicationType?: HmiRecipeCommunicationType;
  sizeType?: HmiRecipeSizeType;
  storageMedia?: HmiRecipeStorageMedia;
  lastModificationUsed?: boolean;
  lastUserUsed?: boolean;
  logUserAction?: boolean;
  offline?: boolean;
  signSaving?: boolean;
  signTransferring?: boolean;
  syncTags?: boolean;
  syncTransfer?: boolean;
  synchronized?: boolean;
}

/** Parsed PLC array declaration; dimensions are retained without expanding instances. */
export class HmiRecipePlcArray {
  originalTypeName?: string;
  elementTypeName?: string;
  isStarArray = false;
  dimensions?: HmiRecipeArrayDimension[];
  resolvedDimensions?: HmiRecipeResolvedArrayDimension[];
}

export class HmiRecipeArrayDimension {
  start?: string;
  end?: string;
}

export class HmiRecipeResolvedArrayDimension {
  start = 0;
  end = 0;
}

export class HmiRecipeReference {
  sourceId?: string;
  name?: string;
}

export class HmiRecipeParameter {
  textList?: HmiTextList;
  sourcePlcArray?: HmiRecipePlcArray;
  readonly sourceTagLimits: HmiRecipeTagLimit[] = [];
  readonly references = new Map<string, HmiRecipeReference>();
  triggerRedraw?: boolean;
  sourcePlcStartValue?: string;
  sourcePlcTypeDefaultStartValue?: string;
  sourcePlcStartValueConstantName?: string;
  sourcePlcHasExplicitStartValue?: boolean;
  sourcePlcComment?: HmiMultilingualText;
  sourceTagComment?: HmiMultilingualText;
  sourceTagStartValue?: string;
  sourceTagTypeSettings?: HmiRecipeTagTypeSettings;
  sourceTagScaling?: HmiRecipeTagScaling;
  sourceTagSubstituteValue?: string;
  sourceTagSubstituteValueUsage?: number;
  displayName?: HmiMultilingualText;
  infoText?: HmiMultilingualText;
  sourceIndex?: number;
  sourceElementId?: number;
  defaultValue?: string;
  decimalPlaces?: number;
  maximumLength?: number;
  tagArrayCount?: number;
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  name?: string;
  tag?: string;
  dataType?: string;
  unit?: string;
  minimumValue?: string;
  maximumValue?: string;
  comment?: string;
}

export class HmiRecipeTagTypeSettings {
  shapeFlags?: number;
  codingFlags?: number;
  dataType?: HmiRecipeReference;
}

export class HmiRecipeTagLimit {
  kind?: string;
  mode?: number;
  constant?: string;
  tag?: HmiRecipeReference;
}

export class HmiRecipeTagScaling {
  linearScaling?: boolean;
  hmiLow?: number;
  hmiHigh?: number;
  plcLow?: number;
  plcHigh?: number;
}

export class HmiRecipeTagDeclaration {
  readonly limits: HmiRecipeTagLimit[] = [];
  typeSettings?: HmiRecipeTagTypeSettings;
  scaling?: HmiRecipeTagScaling;
  name?: string;
  dataType?: string;
  comment?: HmiMultilingualText;
  startValue?: string;
  substituteValue?: string;
  substituteValueUsage?: number;
  minimumValue?: string;
  maximumValue?: string;
}

export class HmiRecipePlcDeclaration {
  array?: HmiRecipePlcArray;
  name?: string;
  dataType?: string;
  startValue?: string;
  typeDefaultStartValue?: string;
  startValueConstantName?: string;
  hasExplicitStartValue?: boolean;
  comment?: HmiMultilingualText;
  readonly subelementValues = new Map<string, string>();
  readonly subelementValueConstantNames = new Map<string, string>();
  readonly typeDefaultSubelementValues = new Map<string, string>();
  readonly subelementComments = new Map<string, HmiMultilingualText>();
}

export class HmiRecipeDataSet {
  lastModification?: Date;
  lastUser?: string;
  displayName?: HmiMultilingualText;
  sourceNumber?: number;
  name?: string;
  readonly values: Record<string, string | undefined> = Object.create(null);
  readonly sourceValues = new Map<string, string | undefined>();
  /** Flat stored members in storage order, with exact source keys; no PLC bounds are inferred. */
  readonly sourceArrayValues = new Map<string, Array<string | undefined>>();
  readonly sourceBinaryValues = new Map<string, HmiRecipeBinaryValue>();
  readonly sourceBinaryArrayValues = new Map<string, HmiRecipeBinaryArray>();
}

/** Decoded byte snapshot; absent payload means unavailable, empty Base64 means an empty payload. */
export class HmiRecipeBinaryValue {
  sourceType?: string;
  sourceBlobType?: number;
  sourceDeclaredLength?: string;
  decodedByteLength?: number;
  payloadBase64?: string;
}

export class HmiRecipeBinaryArray {
  sourceElementType?: string;
  readonly values: Array<HmiRecipeBinaryValue | undefined> = [];
}

export class HmiRecipeView {
  sourceId?: string;
  name?: string;
  sourceNumber?: number;
  displayName?: HmiMultilingualText;
  displayNameReference?: HmiRecipeReference;
  statement?: string;
  readonly elements: HmiRecipeViewElement[] = [];
}

export class HmiRecipeViewElement {
  sourceId?: string;
  name?: string;
  sourceNumber?: number;
  displayName?: HmiMultilingualText;
  displayNameReference?: HmiRecipeReference;
  targetElement?: HmiRecipeReference;
}

export function recipeValueKey(value: string): string {
  // Ordinal case matching does not expand letters or map non-ASCII letters into ASCII.
  return Array.from(value, character => {
    const upper = character.toUpperCase();
    return upper.length !== character.length || (character.charCodeAt(0) > 127 && upper.charCodeAt(0) <= 127)
      ? character : upper;
  }).join("");
}
