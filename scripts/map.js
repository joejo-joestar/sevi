/**
 * A function to render an interactive map of India with SEVI scores.
 * Uses D3.js to create an SVG map with tooltips.
 * @async
 * @returns {Promise<Object>} A promise that resolves to the loaded GeoJSON object when the map is rendered.
 */
export async function renderMap() {
  // Container to anchor the map. Prefer the #map element if present.
  const containerNode = document.querySelector("#home #map") || document.body;

  // Remove any previously rendered wrapper inside the container to avoid duplicates
  const prev = containerNode.querySelector("#map-svg-wrapper");
  if (prev) prev.remove();

  const naturalWidth = 1200;
  const naturalHeight = Math.round(naturalWidth / 0.95); // preserve aspect

  const wrapper = document.createElement("div");
  wrapper.id = "map-svg-wrapper";
  containerNode.appendChild(wrapper);

  const svg = d3
    .select(wrapper)
    .append("svg")
    .attr("viewBox", `0 0 ${naturalWidth} ${naturalHeight}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const projection = d3
    .geoMercator()
    .center([79.9629, 23.5937]) // India center (visually)
    .scale(naturalWidth * 1.5)
    .translate([naturalWidth / 2, naturalHeight / 2]);

  const path = d3.geoPath().projection(projection);

  const tooltip = d3.select("#tooltip");

  // Example SEVI scores for Indian states
  // !TODO: Import real data
  const seviData = {
    Delhi: 0.72,
    Karnataka: 0.58,
    Kerala: 0.99,
    Maharashtra: 0.65,
    "Tamil Nadu": 0.49,
    "Uttar Pradesh": 0.79,
    "West Bengal": 0.68,
  };

  // Load India GeoJSON and return the parsed object. Using async/await makes
  // the control flow clearer but keeps the same Promise-based return value.
  try {
    const india = await d3.json(
      "https://raw.githubusercontent.com/Geohacker/india/master/state/india_state.geojson"
    );

    svg
      .selectAll(".state")
      .data(india.features)
      .join("path")
      .attr("class", "state")
      .attr("d", path)
      .on("mousemove", (event, d) => {
        const stateName = d.properties.NAME_1; // Correct property
        const score = seviData[stateName];
        tooltip
          .style("left", event.pageX + 15 + "px")
          .style("top", event.pageY - 20 + "px")
          .style("opacity", 1)
          .html(
            `<strong>${stateName}</strong><br>` +
              `SEVI Score: ${score !== undefined ? score.toFixed(2) : "N/A"}`
          );
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    return india;
  } catch (err) {
    console.error("Error loading GeoJSON:", err);
    throw err;
  }
}
