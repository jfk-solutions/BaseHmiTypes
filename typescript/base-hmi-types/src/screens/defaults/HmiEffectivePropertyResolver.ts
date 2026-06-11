import { defaultProperty, HmiProperty } from "../base/HmiProperty.js";
import { HmiScreenItemBase } from "../base/HmiScreenItemBase.js";
import { HmiDefaultProfile } from "./HmiDefaultProfile.js";
import { HmiDefaultProfiles } from "./HmiDefaultProfiles.js";

export class HmiEffectivePropertyResolver {
  constructor(readonly defaultProfile: HmiDefaultProfile = HmiDefaultProfiles.empty) {}

  resolve<T>(item: HmiScreenItemBase, propertyName: string, property: HmiProperty<T> | undefined): HmiProperty<T> | undefined {
    if (property !== undefined) {
      return property;
    }

    const defaultValue = this.defaultProfile.tryGet<T>(item, propertyName);
    return defaultValue.found ? defaultProperty(defaultValue.value, this.defaultProfile.name, propertyName) : undefined;
  }

  tryGetStaticValue<T>(
    item: HmiScreenItemBase,
    propertyName: string,
    property: HmiProperty<T> | undefined,
  ): { found: boolean; value?: T } {
    const resolved = this.resolve(item, propertyName, property);
    if (resolved?.staticValue === undefined || resolved.staticValue === null) {
      return { found: false };
    }

    return { found: true, value: resolved.staticValue };
  }
}
