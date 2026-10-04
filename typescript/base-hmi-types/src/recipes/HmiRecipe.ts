export class HmiRecipe {
  name?: string;
  comment?: string;
  lastModified?: Date;
  readonly parameters: HmiRecipeParameter[] = [];
  readonly dataSets: HmiRecipeDataSet[] = [];
}

export class HmiRecipeParameter {
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

export class HmiRecipeDataSet {
  sourceNumber?: number;
  name?: string;
  readonly values: Record<string, string | undefined> = {};
}
