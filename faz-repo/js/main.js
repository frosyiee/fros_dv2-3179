const CHARTS = [
  ["#chart-population", "js/01_map_population.json"],
  ["#chart-income", "js/02_income_expenditure.json"],
  ["#chart-inflation", "js/03_map_inflation.json"],
  ["#chart-cpi", "js/04_cpi_index_lines.json"],
  ["#chart-heatmap", "js/05_heatmap_cat.json"],
  ["#chart-bivar", "js/06_map_bivariate.json"],
  ["#chart-slope", "js/07_share_of_income.json"],
  ["#chart-ecom-map", "js/08_map_ecommerce.json"],
  ["#chart-ecom-age", "js/09_ecommerce_age.json"],
  ["#chart-ecom-scatter", "js/10_income_vs_online.json"],
  ["#chart-food-housing", "js/11_cpi_food_vs_housing.json"],
  ["#chart-cpi-long", "js/12_cpi_long_run.json"],
  ["#chart-water-trend", "js/14_water_trend.json"],
  ["#chart-water-person", "js/15_water_per_person.json"],
  ["#chart-net-people", "js/16_internet_people.json"],
  ["#chart-net-homes", "js/17_internet_households.json"],
  ["#chart-activities", "js/18_heatmap_activity.json"],
  ["#chart-act-age", "js/19_activity_by_age.json"],
  ["#chart-act-sex", "js/20_activity_by_sex.json"],
  ["#chart-devices", "js/21_devices_trend.json"],
  ["#chart-devices-area", "js/22_devices_urban_rural.json"],
  ["#chart-phone-sex", "js/23_phone_ownership_sex.json"]
];


const CONFIG = {
  background: "#f3f5ef",
  font: "DM Sans",
  view: { stroke: null },
  axis: { labelColor: "#4a5470", titleColor: "#1b2540", gridColor: "#dfe4d8", domainColor: "#aab2a4", tickColor: "#aab2a4" },
  legend: { labelColor: "#4a5470", titleColor: "#1b2540" },
};

const MAPS = new Set(["#chart-population", "#chart-inflation", "#chart-bivar", "#chart-ecom-map", "#chart-bivar-spend"]);


const AXIS_ZOOM = new Set(["#chart-income", "#chart-cpi", "#chart-ecom-scatter", "#chart-phone-sex", "#chart-water-trend", "#chart-cpi-long"]);

function addHint(selector, text) {
  const el = document.querySelector(selector);
  const hint = document.createElement("p");
  hint.className = "zoom-hint";
  hint.textContent = text;
  el.insertAdjacentElement("afterend", hint);
  el.classList.add("zoomable");
}

function enableMapZoom(selector, view) {
  const el = document.querySelector(selector);
  const MIN = 1, MAX = 14;

  el.addEventListener("wheel", (e) => {
    e.preventDefault();
    const svg = el.querySelector("svg");
    const box = svg.getBoundingClientRect();
    const [ox, oy] = view.origin();
    const px = e.clientX - box.left - ox; 
    const py = e.clientY - box.top - oy;
    const k = view.signal("mapZoom");
    const k2 = Math.min(MAX, Math.max(MIN, k * Math.exp(-e.deltaY * 0.002)));
    if (k2 === k) return;
    const w = view.signal("width"), h = view.signal("height");
    const tx = w / 2 + view.signal("mapPanX"), ty = h / 2 + view.signal("mapPanY");
    const r = k2 / k;
    view.signal("mapZoom", k2)
        .signal("mapPanX", px - (px - tx) * r - w / 2)
        .signal("mapPanY", py - (py - ty) * r - h / 2)
        .run();
  }, { passive: false });

  let drag = null;
  el.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, px: view.signal("mapPanX"), py: view.signal("mapPanY") };
    el.classList.add("is-panning");
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener("pointermove", (e) => {
    if (!drag) return;
    view.signal("mapPanX", drag.px + e.clientX - drag.x)
        .signal("mapPanY", drag.py + e.clientY - drag.y)
        .run();
  });
  const stop = () => { drag = null; el.classList.remove("is-panning"); };
  el.addEventListener("pointerup", stop);
  el.addEventListener("pointercancel", stop);

  /* reset zoom */
  el.addEventListener("dblclick", () => {
    view.signal("mapZoom", 1).signal("mapPanX", 0).signal("mapPanY", 0).run();
  });
}

CHARTS.forEach(([selector, specUrl]) => {
  vegaEmbed(selector, specUrl, { actions: false, config: CONFIG, renderer: "svg" })
    .then((result) => {
      if (MAPS.has(selector)) {
        enableMapZoom(selector, result.view);
        addHint(selector, "Scroll to zoom, drag to move, double-click to reset.");
      } else if (AXIS_ZOOM.has(selector)) {
        addHint(selector, "Scroll to zoom, drag to move, double-click to reset.");
      }
    })
    /* error handling */
    .catch((err) => {
      console.error(specUrl, err);
      document.querySelector(selector).textContent =
        "This chart could not load. Open the page through a web server, not directly from the file.";
    });
});
