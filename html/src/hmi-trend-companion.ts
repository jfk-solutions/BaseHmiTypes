interface CompanionColumn { mode?: number; infoBlock?: number; name?: string; header?: string; visible?: boolean; width?: number }
interface CompanionRow { values?: Record<string, unknown> }

/** Displays evaluated trend data supplied by the owning runtime; never generates sample values. */
export class HmiTrendCompanion extends HTMLElement {
  static get observedAttributes(): string[] { return ['columns', 'mode', 'values', 'source-control-name']; }
  private readonly root = this.attachShadow({mode: 'open'});
  connectedCallback(): void { this.render(); }
  attributeChangedCallback(): void { this.render(); }

  private render(): void {
    const mode = Number(this.getAttribute('mode') ?? 0);
    const columns = array<CompanionColumn>(this.getAttribute('columns'))
      .filter(column => (column.mode ?? 0) === mode && column.visible !== false);
    const rows = array<CompanionRow>(this.getAttribute('values'));
    const title = ['Ruler values', 'Statistics area', 'Statistics'][mode] ?? 'Trend evaluation';
    const headings = columns.map(column => `<th class="heading" scope="col"${typeof column.width === 'number' && Number.isFinite(column.width) && column.width >= 0 ? ` style="width:${column.width}px"` : ''}>${escape(column.header ?? column.name ?? String(column.infoBlock ?? ''))}</th>`).join('');
    const body = rows.map(row => `<tr>${columns.map(column => `<td>${escape(scalar(row.values?.[String(column.infoBlock)]))}</td>`).join('')}</tr>`).join('');
    this.root.innerHTML = `<style>:host{display:block;overflow:auto;box-sizing:border-box}table{width:100%;border-collapse:collapse;font:inherit;color:inherit}th,td{padding:4px 6px;border:1px solid #888;text-align:left;white-space:nowrap}caption{text-align:left;padding:4px 6px}th{background:#8882}.empty{text-align:center;opacity:.7}</style><table aria-label="${title}"><caption>${title}${this.getAttribute('source-control-name') ? ` · ${escape(this.getAttribute('source-control-name'))}` : ''}</caption><thead class="head"><tr>${headings}</tr></thead><tbody>${body || `<tr><td class="empty" colspan="${Math.max(1, columns.length)}">No trend evaluation data</td></tr>`}</tbody></table>`;
  }
}
function array<T>(value: string | null): T[] {
  try { const parsed: unknown = JSON.parse(value ?? '[]'); return Array.isArray(parsed) ? parsed.filter(item => item && typeof item === 'object' && !Array.isArray(item)) : []; }
  catch { return []; }
}
function scalar(value: unknown): string { return typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number' && Number.isFinite(value) ? String(value) : ''; }
function escape(value: unknown): string { return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]!)); }
customElements.define('hmi-trend-companion', HmiTrendCompanion);
