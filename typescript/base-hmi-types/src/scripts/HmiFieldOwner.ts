import {HmiEventBinding} from './HmiEventBinding.js';

/** A source field and its actions, including unresolved rendered object associations. */
export class HmiFieldOwner {
  id = '';
  sourceFormat?: string;
  sourceData?: Uint8Array;
  sourceProperties: Record<string,string> = {};
  events: HmiEventBinding[] = [];
}
