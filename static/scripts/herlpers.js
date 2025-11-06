/** Scales the given container by setting its CSS `zoom` value. Note that this
 * requires a parent whose width is independent of this container's width.
 * @param {HTMLElement} container The container which will be scaled.
 * @author SreenikethaI
 * @link https://github.com/SreenikethanI/timetabler/blob/main/scripts%2Fhelper.js#L376
 */
export function fitContainerByZoom(container) {
  container.style.zoom = 1;
  const w = container.scrollWidth,
    h = container.scrollHeight;

  const wBound = document.body.clientWidth - 10;
  const hBound = Math.min(document.body.scrollHeight, window.innerHeight - 20);

  const factor = Math.min(1, Math.min(wBound / w, hBound / h));
  container.style.zoom = factor;
}
