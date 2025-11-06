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

  // Ensure the tooltip element is a child of the map wrapper so that
  // overflow: hidden on the wrapper can clip it when necessary.
  let tooltipNode = document.querySelector("#tooltip");
  if (!tooltipNode) {
    tooltipNode = document.createElement("div");
    tooltipNode.id = "tooltip";
    tooltipNode.className = "tooltip";
    document.querySelector("body").appendChild(tooltipNode);
  }

  // Move tooltip into wrapper if it's not already contained. This makes
  // positioning relative to the wrapper easier and allows CSS clipping.
  if (tooltipNode.parentElement !== wrapper) {
    wrapper.appendChild(tooltipNode);
  }

  const tooltip = d3.select(tooltipNode);

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

  try {
    // GeoJSON data from: https://github.com/udit-001/india-maps-data/blob/main/geojson/india.geojson
    const india = await d3.json(
      "https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/india.geojson"
    );

    svg
      .selectAll(".state")
      .data(india.features)
      .join("path")
      .attr("class", "state")
      .attr("d", path)
      .on("mousemove", (event, d) => {
        const stateName = d.properties.st_nm; // Correct property
        const score = seviData[stateName];

        // Compute coordinates and available space relative to the wrapper's top-left.
        const wrapperRect = wrapper.getBoundingClientRect();
        const tooltipRect = tooltipNode.getBoundingClientRect();
        const cursorX = event.clientX - wrapperRect.left; // local x
        const cursorY = event.clientY - wrapperRect.top; // local y

        // Space available on each side
        const space = {
          right: wrapperRect.width - cursorX,
          left: cursorX,
          top: cursorY,
          bottom: wrapperRect.height - cursorY,
        };

        // Choose the side with the most space. Prefer right > left > top > bottom
        const preferred = Object.entries(space).sort(
          (a, b) => b[1] - a[1]
        )[0][0];

        // Default offsets
        let x = 0;
        let y = 0;
        const gap = 8; // gap from cursor/edge

        if (preferred === "right") {
          x = cursorX + gap;
          // vertically center tooltip on cursor if possible
          y = cursorY - tooltipRect.height / 2;
        } else if (preferred === "left") {
          x = cursorX - tooltipRect.width - gap;
          y = cursorY - tooltipRect.height / 2;
        } else if (preferred === "bottom") {
          x = cursorX - tooltipRect.width / 2;
          y = cursorY + gap;
        } else {
          // top
          x = cursorX - tooltipRect.width / 2;
          y = cursorY - tooltipRect.height - gap;
        }

        const pad = 6;
        const maxX = wrapperRect.width - tooltipRect.width - pad;
        const maxY = wrapperRect.height - tooltipRect.height - pad;
        if (x < pad) x = pad;
        if (x > maxX) x = Math.max(pad, maxX);
        if (y < pad) y = pad;
        if (y > maxY) y = Math.max(pad, maxY);

        tooltip
          .style("left", x + "px")
          .style("top", y + "px")
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
