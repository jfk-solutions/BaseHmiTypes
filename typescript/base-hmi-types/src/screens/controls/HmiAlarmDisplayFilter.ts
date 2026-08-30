import { HmiProperty } from "../base.js";
import { HmiAlarmFilterExpression } from "./HmiAlarmFilterExpression.js";

export class HmiAlarmDisplayFilter {
  name?: string;
  definition?: HmiProperty<string>;
  expression?: HmiAlarmFilterExpression;
  isInitial?: HmiProperty<boolean>;
}
