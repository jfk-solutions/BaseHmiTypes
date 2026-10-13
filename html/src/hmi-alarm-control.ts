import type { HmiAlarmDisplayData } from "../../typescript/base-hmi-types/dist/screens/controls/HmiAlarmDisplayData.js";

/** Presentation only: the host owns filtering, acquisition, alarm state and acknowledgement. */
export class HmiAlarmControlElement extends HTMLElement {
  private snapshot?: HmiAlarmDisplayData;
  constructor() {
    super();
    this.addEventListener("click", event => {
      if (!(event.target instanceof Element)) return;
      const action = event.target.closest<HTMLButtonElement>("[data-alarm-action]");
      if (action && !action.disabled) {
        this.dispatchEvent(new CustomEvent("hmi-alarm-action", {bubbles:true,composed:true,detail:{action:action.dataset.alarmAction,keys:[...(this.snapshot?.selectedKeys ?? [])]}}));
        return;
      }
      const row = event.target.closest<HTMLElement>("[data-alarm-key]");
      if (row?.dataset.alarmKey && this.snapshot) {
        this.snapshot.selectedKeys = [row.dataset.alarmKey]; this.refresh();
        this.dispatchEvent(new CustomEvent("hmi-alarm-select", {bubbles:true,composed:true,detail:{keys:[row.dataset.alarmKey]}}));
      }
    });
  }
  get alarmData(): HmiAlarmDisplayData | undefined { return this.snapshot && structuredClone(this.snapshot); }
  set alarmData(data: HmiAlarmDisplayData | undefined) {
    this.snapshot = data && structuredClone(data); this.refresh();
  }
  setAlarmData(data: HmiAlarmDisplayData): void { this.alarmData = data; }
  connectedCallback(): void { this.refresh(); }
  /** Reapply the process image after a host updates static layout or binding properties. */
  refresh(): void {
    if (!this.snapshot) return;
    const table = this.querySelector<HTMLTableElement>("table.hmi-alarm-table");
    const template = this.querySelector<HTMLTemplateElement>("template[data-hmi-alarm-row]");
    const body = table?.tBodies[0]; if (!body || !template) return;
    const nodes = this.snapshot.rows.map(alarm => {
      const fragment = template.content.cloneNode(true) as DocumentFragment;
      const row = fragment.querySelector<HTMLTableRowElement>("tr")!;
      row.dataset.alarmKey = alarm.key; row.dataset.alarmActive = String(alarm.active); row.dataset.alarmAcknowledged = String(alarm.acknowledged);
      const selected = this.snapshot!.selectedKeys?.includes(alarm.key) ?? false;
      row.setAttribute("aria-selected", String(selected));
      const height = Number(table!.dataset.viewRowHeight); if (Number.isFinite(height) && height > 0) row.style.height = `${height}px`;
      if (selected) {
        row.style.backgroundColor = table!.dataset.viewSelectionBackgroundColor ?? this.dataset.selectionBackgroundColor ?? "Highlight";
        row.style.color = table!.dataset.viewSelectionForegroundColor ?? this.dataset.selectionForegroundColor ?? "HighlightText";
      }
      for (const cell of row.cells) {
        if (selected) { cell.style.backgroundColor=row.style.backgroundColor;cell.style.color=row.style.color; }
        cell.textContent = alarm.cells[cell.dataset.columnType ?? ""] ?? alarm.cells[cell.dataset.columnSourceType ?? ""] ?? (cell.dataset.columnType === "Message" ? alarm.text : "");
      }
      return fragment;
    });
    body.replaceChildren(...nodes);
    for (const button of this.querySelectorAll<HTMLButtonElement>('button[data-alarm-action="acknowledge"]'))
      button.disabled = button.dataset.enabled === "false" || this.dataset.readOnlyMode === "true" || !this.snapshot.rows.some(row => this.snapshot!.selectedKeys?.includes(row.key) && row.canAcknowledge);
  }
}

/** Configured alarm banner, defaulting to one visible message. */
export class HmiAlarmLineControlElement extends HTMLElement {
  private snapshot?: HmiAlarmDisplayData;
  get alarmData(): HmiAlarmDisplayData | undefined { return this.snapshot && structuredClone(this.snapshot); }
  set alarmData(data: HmiAlarmDisplayData | undefined) { this.snapshot = data && structuredClone(data); this.refresh(); }
  setAlarmData(data: HmiAlarmDisplayData): void { this.alarmData = data; }
  connectedCallback(): void { this.refresh(); }
  refresh(): void {
    if (!this.snapshot) return;
    const count = Number(this.dataset.numberOfRows) || 1;
    const columns: string[] = JSON.parse(this.dataset.alarmLineColumns ?? "[]");
    const rows = this.snapshot.rows.slice(0, Math.max(1,count)).map(alarm => {
      const line = document.createElement("div"); line.dataset.alarmKey = alarm.key;
      line.textContent = columns.length ? columns.map(column => alarm.cells[column] ?? "").join(" ") : [
        this.dataset.showAlarmTime === "true" ? alarm.cells.AlarmTime : undefined,
        this.dataset.showAlarmState === "true" ? alarm.cells.AlarmState : undefined,
        this.dataset.showTriggerLabel === "true" ? alarm.cells.TriggerLabel : undefined,
        this.dataset.showTriggerValue === "true" ? alarm.cells.TriggerValue : undefined,
        alarm.text].filter(part => part !== undefined && part !== "").join(" ");
      return line;
    });
    this.style.flexDirection = "column"; this.style.alignItems = "stretch";
    this.replaceChildren(...rows);
  }
}
if (!customElements.get("hmi-alarm-control")) customElements.define("hmi-alarm-control", HmiAlarmControlElement);
if (!customElements.get("hmi-alarm-line-control")) customElements.define("hmi-alarm-line-control", HmiAlarmLineControlElement);
