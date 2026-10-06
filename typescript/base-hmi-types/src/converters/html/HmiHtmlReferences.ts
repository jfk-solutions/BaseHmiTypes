import { IHmiProject } from "../../projects/IHmiProject.js";
import { HmiFaceplateContainer } from "../../screens/base/HmiFaceplateContainer.js";
import { HmiFaceplateType } from "../../screens/base/HmiFaceplateType.js";
import { HmiScreenBase } from "../../screens/base/HmiScreenBase.js";

/** Reference results shared by inspection and rendering within one conversion. */
export class HmiHtmlReferenceResolver {
  private readonly faceplates = new WeakMap<HmiFaceplateContainer, Promise<HmiFaceplateType | undefined>>();

  constructor(private readonly project?: IHmiProject) {}

  resolveFaceplateAsync(item: HmiFaceplateContainer, signal?: AbortSignal): Promise<HmiFaceplateType | undefined> {
    signal?.throwIfAborted();
    let result = this.faceplates.get(item);
    if (!result) {
      result = this.loadFaceplateAsync(item, signal);
      this.faceplates.set(item, result);
    }
    return result;
  }

  private async loadFaceplateAsync(item: HmiFaceplateContainer, signal?: AbortSignal): Promise<HmiFaceplateType | undefined> {
    let result: HmiFaceplateType | undefined;
    if (this.project && item.faceplateId?.trim())
      result = await this.project.getFaceplate(item.faceplateId, signal);
    if (!result && this.project && item.faceplateName?.trim() && item.faceplateVersion?.trim())
      result = await this.project.getFaceplateByNameAndVersion(item.faceplateName, item.faceplateVersion, signal);
    return result;
  }
}

export function ordinalIgnoreCaseKey(value: string): string {
  // Ordinal matching preserves characters whose uppercase mapping expands or crosses into ASCII.
  return Array.from(value, character => {
    const upper = character.toUpperCase();
    return upper.length !== character.length || (character.charCodeAt(0) > 127 && upper.charCodeAt(0) <= 127)
      ? character : upper;
  }).join("");
}

export function isScreenInStack(screen: HmiScreenBase, screenStack: Set<HmiScreenBase>): boolean {
  for (const active of screenStack) {
    if (active === screen) return true;
    if (screen.id?.trim() && active.id !== undefined && ordinalIgnoreCaseKey(active.id) === ordinalIgnoreCaseKey(screen.id)) return true;
    if (!screen.id?.trim() && !active.id?.trim() && screen.name?.trim() && active.kind === screen.kind
      && active.name !== undefined && ordinalIgnoreCaseKey(active.name) === ordinalIgnoreCaseKey(screen.name)) return true;
  }
  return false;
}
