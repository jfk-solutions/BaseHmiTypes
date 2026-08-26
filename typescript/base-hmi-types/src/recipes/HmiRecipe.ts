export class HmiRecipe {
  name?: string;
  comment?: string;
  lastModified?: Date;
  readonly parameters: HmiRecipeParameter[] = [];
  readonly dataSets: HmiRecipeDataSet[] = [];
}

export class HmiRecipeParameter {
  name?: string;
  tag?: string;
  dataType?: string;
  unit?: string;
  comment?: string;
}

export class HmiRecipeDataSet {
  name?: string;
  readonly values: Record<string, string | undefined> = {};
}
