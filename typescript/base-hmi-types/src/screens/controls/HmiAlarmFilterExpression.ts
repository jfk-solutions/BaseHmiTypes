import { HmiAlarmFilterExpressionType } from "./HmiAlarmFilterExpressionType.js";
import { HmiAlarmFilterFieldType } from "./HmiAlarmFilterFieldType.js";
import { HmiAlarmFilterOperator } from "./HmiAlarmFilterOperator.js";
import { HmiAlarmFilterValueType } from "./HmiAlarmFilterValueType.js";

export class HmiAlarmFilterExpression {
  type = HmiAlarmFilterExpressionType.Unknown;
  field = HmiAlarmFilterFieldType.Unknown;
  sourceField?: string;
  operator = HmiAlarmFilterOperator.Unknown;
  sourceOperator?: string;
  valueType = HmiAlarmFilterValueType.Unknown;
  textValue?: string;
  numericValue?: number;
  booleanValue?: boolean;
  sourceValue?: string;
  readonly children: HmiAlarmFilterExpression[] = [];
}
