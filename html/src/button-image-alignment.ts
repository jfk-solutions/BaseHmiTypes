function updateAlignment(image: HTMLImageElement): void {
  const layout = image.closest<HTMLElement>("[data-hmi-button-image-layout]");
  if (!layout) return;
  // Explicit pixel extents make the two stretch axes independent, rather than
  // having CSS auto-sizing rescale the other axis through the intrinsic ratio.
  image.style.width = layout.dataset.imageHorizontal === "stretch" || image.naturalWidth === 0
    ? "100%" : `${image.naturalWidth}px`;
  image.style.height = layout.dataset.imageVertical === "stretch" || image.naturalHeight === 0
    ? "100%" : `${image.naturalHeight}px`;
}

function scan(node: Node): void {
  if (node instanceof HTMLImageElement) updateAlignment(node);
  if (node instanceof Element) {
    for (const image of node.querySelectorAll<HTMLImageElement>("[data-hmi-button-image-layout] img"))
      updateAlignment(image);
  }
}

// Image load events reach document capture, but not window capture in Chrome.
for (const type of ["load", "error"])
  document.addEventListener(type, event => {
    if (event.target instanceof HTMLImageElement) updateAlignment(event.target);
  }, true);

scan(document.documentElement);
new MutationObserver(records => {
  for (const record of records) {
    if (record.type === "attributes") scan(record.target);
    else for (const node of record.addedNodes) scan(node);
  }
}).observe(document.documentElement, {subtree: true, childList: true, attributes: true,
  attributeFilter: ["src", "srcset", "data-image-horizontal", "data-image-vertical"]});
