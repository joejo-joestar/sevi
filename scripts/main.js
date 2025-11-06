import * as Helper from "./helpers.js";
import { renderMap } from "./map.js";

let loadComplete = false;

/**
 * Initialize the main page functionality, including rendering the map.
 * Shows a loading overlay while the map is being prepared.
 */
export async function init() {
  loadComplete = false;
  // Show a loading overlay anchored to the #map container
  const overlay = Helper.showLoading({ parent: "#map", text: "Loading map…" });

  try {
    // Wait for the map render to finish (renderMap returns a promise)
    await renderMap();
    loadComplete = true;
  } catch (err) {
    console.error("Map initialization failed:", err);
    // Optionally update overlay text to show error
    if (overlay)
      overlay.querySelector("span:last-child").textContent =
        "Failed to load map";
  } finally {
    // Ensure the overlay is removed once the map is fully loaded (or on error)
    Helper.hideLoading();
  }
}

if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", () => init(), { once: true });
}
