const layouts = new Set<HTMLElement>();
const observed = new Map<HTMLElement, Element[]>();

function update(layout: HTMLElement): void {
  if (!layout.isConnected) {
    layouts.delete(layout);
    for (const target of observed.get(layout) ?? []) resize.unobserve(target);
    observed.delete(layout);
    return;
  }
  const content = layout.closest<HTMLElement>("[data-hmi-button-content]");
  const graphic = content?.querySelector<HTMLElement>("[data-hmi-button-graphic]");
  const image = graphic?.querySelector<HTMLImageElement>("img");
  let inset = 0;
  if (content && graphic && !graphic.hidden && image && image.naturalWidth > 0) {
    const box = content.getBoundingClientRect(), picture = image.getBoundingClientRect();
    const scale = content.clientWidth > 0 ? box.width / content.clientWidth : 0;
    if (scale > 0) inset = Math.min(content.clientWidth, Math.max(0,
      (layout.dataset.hmiButtonCaptionAvoidImage === "start" ? picture.right - box.left : box.right - picture.left) / scale));
  }
  layout.style.paddingLeft = layout.dataset.hmiButtonCaptionAvoidImage === "start" ? `${inset}px` : "0px";
  layout.style.paddingRight = layout.dataset.hmiButtonCaptionAvoidImage === "end" ? `${inset}px` : "0px";
}

let scheduled = false;
function schedule(): void {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { scheduled = false; for (const layout of layouts) update(layout); });
}
const resize = new ResizeObserver(schedule);
function scan(node: Node): void {
  if (!(node instanceof Element)) return;
  const found = node.matches("[data-hmi-button-caption-avoid-image]") ? [node] : [];
  found.push(...node.querySelectorAll("[data-hmi-button-caption-avoid-image]"));
  for (const candidate of found) if (candidate instanceof HTMLElement) {
    layouts.add(candidate);
    const content = candidate.closest("[data-hmi-button-content]");
    const image = content?.querySelector("img");
    const targets = [content, image].filter((target): target is Element => target !== null && target !== undefined);
    const old = observed.get(candidate) ?? [];
    for (const target of old) if (!targets.includes(target)) resize.unobserve(target);
    for (const target of targets) if (!old.includes(target)) resize.observe(target);
    observed.set(candidate, targets);
  }
  schedule();
}
scan(document.documentElement);
for (const type of ["load", "error"]) document.addEventListener(type, schedule, true);
new MutationObserver(records => {
  for (const record of records) {
    if (record.type === "childList") for (const node of record.addedNodes) scan(node);
    else scan(record.target);
  }
  schedule();
}).observe(document.documentElement, {subtree: true, childList: true, attributes: true,
  attributeFilter: ["src", "srcset", "hidden", "data-hmi-button-caption-avoid-image", "data-image-horizontal", "data-image-vertical"]});
