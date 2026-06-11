export class HmiAxHostState {
  fields: Record<string, unknown> = {};
  type?: number;
  manualUpdate?: boolean;
  licenseKey?: string;
  buffer?: Uint8Array;
  length?: number;
}
