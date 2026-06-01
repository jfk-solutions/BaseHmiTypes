export interface IHmiDatabase {
  dispose?(): Promise<void>;
  readTable(tableName: string, columns?: readonly string[], signal?: AbortSignal): Promise<readonly HmiDatabaseRow[]>;
}

export class HmiDatabaseRow {
  private readonly values = new Map<string, unknown>();

  constructor(values: Iterable<readonly [string, unknown]> | Record<string, unknown>) {
    if (Symbol.iterator in Object(values)) {
      for (const [key, value] of values as Iterable<readonly [string, unknown]>) {
        this.values.set(key.toLocaleLowerCase(), value);
      }
    } else {
      for (const [key, value] of Object.entries(values)) {
        this.values.set(key.toLocaleLowerCase(), value);
      }
    }
  }

  get columnNames(): readonly string[] {
    return [...this.values.keys()];
  }

  getValue(columnName: string): unknown {
    return this.values.get(columnName.toLocaleLowerCase());
  }

  hasColumn(columnName: string): boolean {
    return this.values.has(columnName.toLocaleLowerCase());
  }

  get<T>(columnName: string): T | undefined {
    const value = this.getValue(columnName);
    return value === null || value === undefined ? undefined : value as T;
  }

  getGuid(columnName: string): string {
    const guid = this.tryGetGuid(columnName);
    if (guid === undefined) {
      throw new Error(`Column '${columnName}' is not a GUID.`);
    }

    return guid;
  }

  tryGetGuid(columnName: string): string | undefined {
    const value = this.getValue(columnName);
    if (typeof value === "string" && isGuid(value)) {
      return value;
    }

    if (value instanceof Uint8Array && value.byteLength === 16) {
      return bytesToGuid(value);
    }

    if (Array.isArray(value) && value.length === 16 && value.every((entry) => typeof entry === "number")) {
      return bytesToGuid(new Uint8Array(value));
    }

    return undefined;
  }

  getBytes(columnName: string): Uint8Array | undefined {
    const value = this.getValue(columnName);
    if (value === null || value === undefined) {
      return undefined;
    }

    if (value instanceof Uint8Array) {
      return value;
    }

    if (Array.isArray(value) && value.every((entry) => typeof entry === "number")) {
      return new Uint8Array(value);
    }

    throw new Error(`Column '${columnName}' is not binary data.`);
  }
}

function isGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function bytesToGuid(bytes: Uint8Array): string {
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0"));
  return `${hex[3]}${hex[2]}${hex[1]}${hex[0]}-${hex[5]}${hex[4]}-${hex[7]}${hex[6]}-${hex[8]}${hex[9]}-${hex.slice(10).join("")}`;
}
