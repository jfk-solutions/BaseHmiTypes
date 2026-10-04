type KeyedImage = { source: string; key: string; policy: string; result?: string };
const images = new WeakMap<HTMLImageElement, KeyedImage>();

function update(image: HTMLImageElement): void {
  const previous = images.get(image);
  const src = image.getAttribute("src") ?? "";
  const source = previous?.result === src ? previous.source : src;
  const key = image.dataset.hmiImageColorKey;
  if (!key || !/^\d{1,3},\d{1,3},\d{1,3}$/.test(key) || key.split(",").some(x => Number(x) > 255)) {
    images.delete(image);
    delete image.dataset.hmiImageColorKeyStatus;
    if (previous?.result === src) image.src = source;
    return;
  }
  // Generated graphic views have no responsive source set. Do not replace or
  // defeat an externally supplied responsive image selection.
  if (image.srcset) {
    images.delete(image);
    image.dataset.hmiImageColorKeyStatus = "unavailable";
    if (previous?.result === src) image.src = source;
    return;
  }
  const policy = `${image.crossOrigin ?? ""}:${image.referrerPolicy}`;
  if (previous?.source === source && previous.key === key && previous.policy === policy) return;
  const state: KeyedImage = {source, key, policy};
  images.set(image, state);
  image.dataset.hmiImageColorKeyStatus = "pending";
  const decoded = new Image();
  if (image.crossOrigin !== null) decoded.crossOrigin = image.crossOrigin;
  decoded.referrerPolicy = image.referrerPolicy;
  const current = () => images.get(image) === state && image.isConnected;
  decoded.onload = () => {
    if (!current()) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = decoded.naturalWidth;
      canvas.height = decoded.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context || !canvas.width || !canvas.height) throw new Error("No decoded image pixels");
      context.drawImage(decoded, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
      const [red, green, blue] = key.split(",").map(Number);
      for (let i = 0; i < pixels.data.length; i += 4) {
        if (pixels.data[i] === red && pixels.data[i + 1] === green && pixels.data[i + 2] === blue)
          pixels.data[i + 3] = 0;
      }
      context.putImageData(pixels, 0, 0);
      state.result = canvas.toDataURL("image/png");
      image.src = state.result;
      image.dataset.hmiImageColorKeyStatus = "applied";
    } catch {
      // For example, cross-origin pixels without CORS taint the canvas. Keep
      // the original image visible; do not bypass browser security or hide it.
      image.dataset.hmiImageColorKeyStatus = "unavailable";
    }
  };
  decoded.onerror = () => {
    if (current()) image.dataset.hmiImageColorKeyStatus = "unavailable";
  };
  decoded.src = source;
}

function scan(node: Node): void {
  if (node instanceof HTMLImageElement) update(node);
  if (node instanceof Element)
    for (const image of node.querySelectorAll<HTMLImageElement>("img[data-hmi-image-color-key]")) update(image);
}
scan(document.documentElement);
document.addEventListener("load", event => {
  if (event.target instanceof HTMLImageElement) update(event.target);
}, true);
new MutationObserver(records => {
  for (const record of records) {
    if (record.type === "attributes") scan(record.target);
    else for (const node of record.addedNodes) scan(node);
  }
}).observe(document.documentElement, {subtree: true, childList: true, attributes: true,
  attributeFilter: ["src", "srcset", "data-hmi-image-color-key", "crossorigin", "referrerpolicy"]});
