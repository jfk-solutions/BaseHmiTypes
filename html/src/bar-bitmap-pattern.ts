// Native bitmap brushes tile in screen/world coordinates, not rectangle-local coordinates.
// Keep the opaque two-color image separate from the track underneath it.
import { gdiHatchCoverage } from "./gdi-hatch-coverage.js";
const selector = "[data-hmi-bar-bitmap],[data-hmi-bar-hatch-style]";
const previous = new WeakMap<HTMLElement, string>();
const tiles = new WeakMap<HTMLElement, HTMLSpanElement>();
let pending = false;
function update(): void {
  pending = false;
  for (const fill of document.querySelectorAll<HTMLElement>(selector)) {
    const rows = fill.dataset.hmiBarBitmap ?? "";
    const hatch = fill.dataset.hmiBarHatchStyle === undefined ? undefined : Number(fill.dataset.hmiBarHatchStyle);
    const coverage = hatch === undefined || !Number.isInteger(hatch) ? undefined : gdiHatchCoverage[hatch];
    if (hatch === undefined && !/^[0-9a-f]{16}$/i.test(rows)) continue;
    const screen = fill.closest<HTMLElement>("[data-hmi-screen]");
    if (!screen) continue;
    const root = screen.getBoundingClientRect();
    const rect = fill.getBoundingClientRect();
    const sx = screen.offsetWidth ? root.width / screen.offsetWidth : 1;
    const sy = screen.offsetHeight ? root.height / screen.offsetHeight : 1;
    if (!(sx > 0 && sy > 0)) continue;
    const left = -(rect.left - root.left) / sx;
    const top = -(rect.top - root.top) / sy;
    const position = `${left}px ${top}px`;
    const color = getComputedStyle(fill).color;
    const pattern = fill.dataset.hmiBarPatternColor ?? "#000000";
    const dpr = window.devicePixelRatio || 1;
    const key = `${rows}|${hatch}|${color}|${pattern}|${position}|${root.width}|${root.height}|${dpr}`;
    if (previous.get(fill) === key) continue;
    previous.set(fill, key);
    // Values are renderer-emitted CSS colors, but escape XML before building a data URL.
    const escape = (value: string): string => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
    let svg = `<svg ${["xml", "ns"].join("")}="http://www.w3.org/2000/svg" width="8" height="8" shape-rendering="crispEdges">`;
    const palette = coverage === undefined ? undefined : hatchPalette(pattern, color);
    for (let y = 0; y < 8; y++) {
      const bits = parseInt(rows.slice(y * 2, y * 2 + 2), 16);
      for (let x = 0; x < 8; x++)
        svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${escape(hatch === undefined ? bits & (0x80 >> x) ? color : pattern : palette?.[Number(coverage?.[y * 8 + x])] ?? "transparent")}"/>`;
    }
    svg += "</svg>";
    const image = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    let tile = tiles.get(fill);
    if (!tile) {
      tile = document.createElement("span");
      tile.dataset.hmiBarBitmapTile = "true";
      tile.style.position = "absolute";
      tile.style.pointerEvents = "none";
      tile.style.imageRendering = "pixelated";
      fill.append(tile);
      tiles.set(fill, tile);
      fill.style.overflow = "hidden";
      fill.style.backgroundColor = "transparent";
    }
    // A screen-sized layer has an integer/world-aligned raster origin even when
    // the clipping value rectangle starts at a fractional CSS pixel.
    tile.style.left = `${left}px`;
    tile.style.top = `${top}px`;
    tile.style.width = `${root.width / sx}px`;
    tile.style.height = `${root.height / sy}px`;
    tile.style.backgroundSize = hatch === undefined ? "8px 8px" : `${8 / (dpr * sx)}px ${8 / (dpr * sy)}px`;
    tile.style.backgroundImage = image;
    if (fill.style.backgroundPosition !== position) fill.style.backgroundPosition = position;
  }
}

function rgba(css: string): number[] {
  if (/^#[0-9a-f]{6}$/i.test(css)) return [parseInt(css.slice(1, 3), 16), parseInt(css.slice(3, 5), 16), parseInt(css.slice(5, 7), 16), 255];
  const values = css.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return [values[0], values[1], values[2], Math.round((values[3] ?? 1) * 255)];
}

function hatchPalette(foreground: string, background: string): string[] {
  const fore = rgba(foreground), back = rgba(background);
  const weights = [0, 1, 0.25, Math.fround(Math.fround(Math.sqrt(2)) - 0.5)];
  return weights.map(weight => {
    const mix = (a: number, b: number): number => Math.floor(Math.fround(Math.fround(a * weight) + Math.fround(b * Math.fround(1 - weight))));
    const alpha = mix(fore[3], back[3]);
    if (!alpha) return "transparent";
    const channels = [0, 1, 2].map(index => {
      const f = Math.floor((fore[index] * fore[3] + 127) / 255);
      const b = Math.floor((back[index] * back[3] + 127) / 255);
      // Reconstruct a straight CSS color that rasterizes to the verified GDI+
      // premultiplied byte; native GetPixel's unpremultiplication truncates and
      // cannot simply be fed back into another renderer's premultiplication.
      return Math.round(mix(f, b) * 255 / alpha);
    });
    return `rgba(${channels.join(",")},${alpha / 255})`;
  });
}
function schedule(): void {
  if (!pending) { pending = true; requestAnimationFrame(update); }
}
const sizes = new ResizeObserver(schedule);
function observe(): void {
  sizes.disconnect();
  for (const element of document.querySelectorAll(`${selector},[data-hmi-screen]`)) sizes.observe(element);
  schedule();
}
new MutationObserver(records => {
  if (records.some(record => record.type === "childList")) observe();
  else schedule();
}).observe(document.documentElement, { subtree: true, childList: true, attributes: true,
  attributeFilter: ["style", "class", "data-hmi-bar-bitmap", "data-hmi-bar-hatch-style", "data-hmi-bar-pattern-color"] });
window.addEventListener("resize", schedule);
function watchDensity(): void {
  matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`).addEventListener("change", () => {
    schedule();
    watchDensity();
  }, { once: true });
}
watchDensity();
document.addEventListener("scroll", schedule, true);
observe();
