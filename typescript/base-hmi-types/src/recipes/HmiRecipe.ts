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
  readonly parameters: HmiRecipeParameter[] = [];
  readonly dataSets: HmiRecipeDataSet[] = [];
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

export class HmiRecipeReference {
  sourceId?: string;
  name?: string;
}

export class HmiRecipeParameter {
  readonly references = new Map<string, HmiRecipeReference>();
  triggerRedraw?: boolean;
  sourcePlcStartValue?: string;
  sourcePlcTypeDefaultStartValue?: string;
  sourcePlcStartValueConstantName?: string;
  sourcePlcHasExplicitStartValue?: boolean;
  sourceTagStartValue?: string;
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

export class HmiRecipePlcDeclaration {
  name?: string;
  dataType?: string;
  startValue?: string;
  typeDefaultStartValue?: string;
  startValueConstantName?: string;
  hasExplicitStartValue?: boolean;
  readonly subelementValues = new Map<string, string>();
  readonly subelementValueConstantNames = new Map<string, string>();
  readonly typeDefaultSubelementValues = new Map<string, string>();
}

export class HmiRecipeDataSet {
  displayName?: HmiMultilingualText;
  sourceNumber?: number;
  name?: string;
  readonly values: Record<string, string | undefined> = Object.create(null);
  readonly sourceValues = new Map<string, string | undefined>();
}
