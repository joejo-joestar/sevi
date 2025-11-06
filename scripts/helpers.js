/**
 * Scales the given container by setting its CSS `zoom` value. Note that this
 * requires a parent whose width is independent of this container's width.
 * @param {HTMLElement} container The container which will be scaled.
 * @author SreenikethanI
 * @link https://github.com/SreenikethanI/timetabler/blob/main/scripts%2Fhelper.js#L376
 */
export function fitContainerByZoom(container) {
  container.style.zoom = 1;
  const w = container.scrollWidth;
  const h = container.scrollHeight;

  const wBound = document.body.clientWidth - 10;
  const hBound = Math.min(document.body.scrollHeight, window.innerHeight - 20);

  const factor = Math.min(1, Math.min(wBound / w, hBound / h));
  container.style.zoom = factor;
}

/**
 * Show a loading overlay for a parent container (defaults to #home or body).
 * Returns the created overlay element.
 * @param {{parent: (HTMLElement|string), text: string}=} options
 */
export function showLoading(options = {}) {
  const { parent: parentOpt, text = "Loading…" } = options;
  let parent = null;
  if (typeof parentOpt === "string") parent = document.querySelector(parentOpt);
  else if (parentOpt instanceof HTMLElement) parent = parentOpt;
  parent = parent || document.querySelector("#home") || document.body;

  // Avoid creating multiple overlays
  if (parent.querySelector("#loading-overlay"))
    return parent.querySelector("#loading-overlay");

  // Ensure parent can contain absolutely positioned overlay
  const computed = getComputedStyle(parent);
  const prevPosition = parent.style.position || "";
  if (computed.position === "static") parent.style.position = "relative";

  const overlay = document.createElement("div");
  overlay.id = "loading-overlay";
  overlay.setAttribute("role", "status");
  overlay.style.position = "absolute";
  overlay.style.inset = "0";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.background = "rgba(0,0,0,0.45)";
  overlay.style.color = "#fff";
  overlay.style.zIndex = "9999";
  overlay.style.padding = "1rem";
  overlay.style.backdropFilter = "blur(3px)";
  overlay.style.borderRadius = "6px";
  overlay.dataset._sevi_prev_position = prevPosition;

  const inner = document.createElement("div");
  inner.style.display = "flex";
  inner.style.gap = "0.6rem";
  inner.style.alignItems = "center";

  const spinner = document.createElement("span");
  spinner.className = "spinner";
  // Spinner appearance is provided via external CSS (helpers.css)

  const label = document.createElement("span");
  label.textContent = text;
  label.style.fontSize = "0.95rem";

  inner.appendChild(spinner);
  inner.appendChild(label);
  overlay.appendChild(inner);
  parent.appendChild(overlay);

  return overlay;
}

/**
 * Hide/remove the loading overlay previously added with showLoading.
 */
export function hideLoading() {
  const overlay = document.querySelector("#loading-overlay");
  if (!overlay) return;
  const parent = overlay.parentElement;
  const prevPosition = overlay.dataset._sevi_prev_position;
  overlay.remove();
  // restore previous inline position value if we changed it
  if (parent && typeof prevPosition !== "undefined") {
    parent.style.position = prevPosition;
  }
}
