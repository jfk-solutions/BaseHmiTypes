import { HmiScreenItemBase } from "../base/HmiScreenItemBase.js";

export class HmiDefaultProfile {
  private readonly values = new Map<string, unknown>();

  constructor(readonly name: string) {}

  set<T>(objectType: string, propertyName: string, value: T | undefined): void {
    this.values.set(getKey(objectType, propertyName), value);
  }

  tryGet<T>(item: HmiScreenItemBase, propertyName: string): { found: true; value: T | undefined } | { found: false } {
    if (item.hmiObjectType?.trim()) {
      const key = getKey(item.hmiObjectType, propertyName);
      if (this.values.has(key)) {
        return { found: true, value: this.values.get(key) as T | undefined };
      }
    }

    for (const objectType of getObjectTypeKeys(item)) {
      if (item.hmiObjectType === objectType) {
        continue;
      }

      const key = getKey(objectType, propertyName);
      if (this.values.has(key)) {
        return { found: true, value: this.values.get(key) as T | undefined };
      }
    }

    return { found: false };
  }
}

function getKey(objectType: string, propertyName: string): string {
  return `${objectType}\0${propertyName}`;
}

function getObjectTypeKeys(item: HmiScreenItemBase): string[] {
  const keys: string[] = [];
  let prototype = Object.getPrototypeOf(item);
  while (prototype !== undefined && prototype !== null) {
    const constructorName = prototype.constructor?.name;
    if (constructorName !== undefined && constructorName !== "Object") {
      keys.push(constructorName);
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return keys;
}
