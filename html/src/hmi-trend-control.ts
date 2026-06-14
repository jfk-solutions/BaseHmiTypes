const trendControlProperties = {
  controlName: String,
  typeName: String,
};

type TrendControlPropertyName = keyof typeof trendControlProperties;
type TimeLabel = {
  primary: string;
  secondary: string;
};

export class HmiTrendControl extends HTMLElement {
  static get observedAttributes(): string[] {
    return Object.keys(trendControlProperties).map(toKebabCase);
  }

  private _controlName = "";
  private _typeName = "Trend control";
  private readonly root = this.attachShadow({ mode: "open" });

  get controlName(): string {
    return this._controlName;
  }
  set controlName(value: string | null | undefined) {
    this.setStringProperty("_controlName", value, "");
  }

  get typeName(): string {
    return this._typeName;
  }
  set typeName(value: string | null | undefined) {
    this.setStringProperty("_typeName", value, "Trend control");
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue)
      return;

    const propertyName = fromKebabCase(name) as TrendControlPropertyName;
    if (trendControlProperties[propertyName] === String) {
      (this as unknown as Record<string, string>)[propertyName] = newValue ?? "";
    }
  }

  private setStringProperty(field: string, value: string | null | undefined, fallback: string): void {
    const next = value == null || value === "" ? fallback : String(value);
    const fields = this as unknown as Record<string, string>;
    if (fields[field] === next)
      return;

    fields[field] = next;
    this.render();
  }

  private render(): void {
    const computed = getComputedStyle(this);
    const backgroundColor = normalizeTransparent(computed.backgroundColor, "#ffffff");
    const foregroundColor = normalizeTransparent(computed.color, "#5a5d64");
    const borderColor = normalizeTransparent(computed.borderTopColor, "#a8acb2");
    const rawBorderWidth = parseFloat(computed.borderTopWidth);
    const borderWidth = Number.isFinite(rawBorderWidth) ? rawBorderWidth : 0;
    const now = new Date();
    const labels = createTimeLabels(now);

    this.root.innerHTML = `
      <style>
        :host {
          box-sizing: border-box;
          display: block;
          min-width: 140px;
          min-height: 90px;
          overflow: hidden;
          font-family: Arial, Helvetica, sans-serif;
          color: ${escapeCss(foregroundColor)};
          background: ${escapeCss(backgroundColor)};
        }

        *, *::before, *::after {
          box-sizing: border-box;
        }

        .frame {
          width: 100%;
          height: 100%;
          position: relative;
          overflow: hidden;
          background: ${escapeCss(backgroundColor)};
          ${borderWidth > 0 ? `border: ${toCss(borderWidth)}px solid ${escapeCss(borderColor)};` : ""}
        }

        .toolbar {
          position: absolute;
          top: 4%;
          right: 2.5%;
          width: min(50%, 700px);
          min-width: 240px;
          height: 13%;
          color: #20242a;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 4px;
          font-size: clamp(11px, 2.1vmin, 18px);
          line-height: 1;
        }

        .caption {
          color: #8b8f97;
          font-size: 0.86em;
        }

        .selector {
          min-height: 0;
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr) 58px;
          align-items: center;
          border: 1px solid #d8d9dc;
          border-radius: 6px;
          background: linear-gradient(#ffffff, #f4f4f5);
          box-shadow:
            inset 0 1px 2px rgba(0, 0, 0, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .legend {
          display: grid;
          place-items: center;
          height: 100%;
        }

        .legend svg {
          width: 44px;
          height: 24px;
        }

        .trend-name {
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          color: #15181d;
          font-weight: 600;
          text-align: center;
        }

        .drop {
          height: 100%;
          display: grid;
          place-items: center;
          background: linear-gradient(90deg, #d9dadd, #a8aaae);
          border-left: 1px solid #c7c9cc;
        }

        .drop::before {
          content: "";
          width: 0;
          height: 0;
          border-left: 10px solid transparent;
          border-right: 10px solid transparent;
          border-top: 12px solid #060606;
        }

        .plot {
          position: absolute;
          left: 10%;
          right: 2.5%;
          top: 29%;
          bottom: 18%;
        }

        .grid {
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }

        .axis-label {
          position: absolute;
          color: ${escapeCss(foregroundColor)};
          font-size: clamp(10px, 2vmin, 18px);
          line-height: 1;
          white-space: nowrap;
        }

        .y-label {
          left: -4.4em;
          transform: translateY(50%);
          text-align: right;
          width: 3.6em;
        }

        .x-label {
          top: calc(100% + 0.9em);
          transform: translateX(-50%);
          text-align: center;
          min-width: 5.2em;
        }

        .info {
          position: absolute;
          left: 0;
          top: 67%;
          transform: translateY(-50%);
          max-width: 44%;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          background: rgba(255, 245, 117, 0.72);
          color: #101010;
          padding: 0 2px;
          font-size: clamp(11px, 2.15vmin, 20px);
          line-height: 1.15;
        }
      </style>
      <div class="frame">
        <div class="toolbar">
          <div class="caption">Min/max threshold:</div>
          <div class="selector">
            <div class="legend">
              <svg viewBox="0 0 44 24" aria-hidden="true">
                <line x1="2" y1="12" x2="42" y2="12" stroke="#0c66b0" stroke-width="4"></line>
                <circle cx="22" cy="12" r="8" fill="#0c66b0"></circle>
              </svg>
            </div>
            <div class="trend-name">Robot Left Position - X Axis</div>
            <div class="drop"></div>
          </div>
        </div>
        <div class="plot">
          <svg class="grid" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            ${renderGrid()}
            <line x1="0" y1="100" x2="100" y2="100" stroke="#444850" stroke-width="0.55"></line>
            <line x1="0" y1="0" x2="0" y2="100" stroke="#444850" stroke-width="0.55"></line>
          </svg>
          ${renderYLabels()}
          ${renderXLabels(labels)}
        </div>
      </div>`;
  }
}

function renderGrid(): string {
  const lines: string[] = [];
  for (let index = 0; index <= 10; index++) {
    const y = index * 10;
    lines.push(`<line x1="0" y1="${y}" x2="100" y2="${y}" stroke="#dedede" stroke-width="0.32"></line>`);
  }
  for (let index = 0; index <= 7; index++) {
    const x = (index / 7) * 100;
    lines.push(`<line x1="${toCss(x)}" y1="0" x2="${toCss(x)}" y2="100" stroke="#dedede" stroke-width="0.32"></line>`);
  }
  return lines.join("");
}

function renderYLabels(): string {
  const labels: string[] = [];
  for (let value = 100; value >= 0; value -= 10) {
    const y = 100 - value;
    labels.push(`<span class="axis-label y-label" style="top:${toCss(y)}%">${value}</span>`);
  }
  return labels.join("");
}

function renderXLabels(values: TimeLabel[]): string {
  return values
    .map((value, index) => {
      const left = (index / Math.max(values.length - 1, 1)) * 100;
      return `<span class="axis-label x-label" style="left:${toCss(left)}%">${escapeHtml(value.primary)}<br>${escapeHtml(value.secondary)}</span>`;
    })
    .join("");
}

function createTimeLabels(now: Date): TimeLabel[] {
  const labels: TimeLabel[] = [];
  for (let index = 0; index < 8; index++) {
    const date = new Date(now.getTime() + index * 9000);
    labels.push(formatTimeLabel(date, index === 0));
  }
  return labels;
}

function formatTimeLabel(date: Date, includeYear: boolean): TimeLabel {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = hours >= 12 ? "PM" : "AM";
  return {
    primary: includeYear ? year.toString() : `${month}/${day}/${year}`,
    secondary: `${hour12}:${minutes}:${seconds}${suffix}`,
  };
}

function normalizeTransparent(value: string, fallback: string): string {
  return value && value !== "rgba(0, 0, 0, 0)" ? value : fallback;
}

function toCss(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(3).replace(/\.?0+$/, "");
}

function toKebabCase(value: string): string {
  return value.replace(/([A-Z])/g, (_, character: string) => `-${character.toLowerCase()}`);
}

function fromKebabCase(value: string): string {
  return value.replace(/-([a-z])/g, (_, character: string) => character.toUpperCase());
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeCss(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"").replaceAll("<", "\\3c ");
}

customElements.define("hmi-trend-control", HmiTrendControl);
