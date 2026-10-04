// Native bitmap brushes tile in screen/world coordinates, not rectangle-local coordinates.
// Keep the opaque two-color image separate from the track underneath it.
const selector = "[data-hmi-bar-bitmap]";
const previous = new WeakMap<HTMLElement, string>();
const tiles = new WeakMap<HTMLElement, HTMLSpanElement>();
let pending = false;
function update(): void {
  pending = false;
  for (const fill of document.querySelectorAll<HTMLElement>(selector)) {
    const rows = fill.dataset.hmiBarBitmap ?? "";
    if (!/^[0-9a-f]{16}$/i.test(rows)) continue;
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
    const key = `${rows}|${color}|${pattern}|${position}|${root.width}|${root.height}`;
    if (previous.get(fill) === key) continue;
    previous.set(fill, key);
    // Values are renderer-emitted CSS colors, but escape XML before building a data URL.
    const escape = (value: string): string => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
    let svg = `<svg ${["xml", "ns"].join("")}="http://www.w3.org/2000/svg" width="8" height="8" shape-rendering="crispEdges">`;
    for (let y = 0; y < 8; y++) {
      const bits = parseInt(rows.slice(y * 2, y * 2 + 2), 16);
      for (let x = 0; x < 8; x++)
        svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="${escape(bits & (0x80 >> x) ? color : pattern)}"/>`;
    }
    svg += "</svg>";
    const image = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    let tile = tiles.get(fill);
    if (!tile) {
      tile = document.createElement("span");
      tile.dataset.hmiBarBitmapTile = "true";
      tile.style.position = "absolute";
      tile.style.pointerEvents = "none";
      tile.style.backgroundSize = "8px 8px";
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
    tile.style.backgroundImage = image;
    if (fill.style.backgroundPosition !== position) fill.style.backgroundPosition = position;
  }
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
  attributeFilter: ["style", "class", "data-hmi-bar-bitmap", "data-hmi-bar-pattern-color"] });
window.addEventListener("resize", schedule);
document.addEventListener("scroll", schedule, true);
observe();
