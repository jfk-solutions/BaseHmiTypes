// Graphic-or-text buttons keep their caption in the DOM for failed images.
// Capture load/error on document: these events do not bubble, and image load
// does not reach window capture in Chrome.
function updateFallback(image: HTMLImageElement): void {
  const graphic = image.closest<HTMLElement>("[data-hmi-button-graphic]");
  const button = graphic?.closest<HTMLButtonElement>("button[data-hmi-button-image-fallback]");
  const caption = button?.querySelector<HTMLElement>("[data-hmi-button-caption]");
  if (!graphic || !button || !caption) return;
  const failed = image.complete && image.naturalWidth === 0;
  graphic.hidden = failed;
  caption.hidden = !failed;
}

function scan(node: Node): void {
  if (node instanceof HTMLImageElement) updateFallback(node);
  if (node instanceof Element) {
    for (const image of node.querySelectorAll<HTMLImageElement>("[data-hmi-button-graphic] img"))
      updateFallback(image);
  }
}

for (const type of ["load", "error"])
  document.addEventListener(type, event => {
    if (event.target instanceof HTMLImageElement) updateFallback(event.target);
  }, true);

scan(document.documentElement);
new MutationObserver(records => {
  for (const record of records) {
    if (record.type === "attributes") scan(record.target);
    else for (const node of record.addedNodes) scan(node);
  }
}).observe(document.documentElement, {subtree: true, childList: true, attributes: true, attributeFilter: ["src", "srcset"]});
