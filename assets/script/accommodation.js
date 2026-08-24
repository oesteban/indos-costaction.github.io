/**
 * Accommodation page — Leaflet map + searchable/filterable card list of
 * affordable areas near the venue, well connected via Metro lines 6/7.
 *
 * Expects a global `window.ACCOMMODATION_DATA` array (injected by the page)
 * with one venue entry ({id, type: "venue", name, lat, lon}) and area
 * entries ({id, type: "area", name, metro_lines, nearest_station, lat, lon,
 *   stops_to_venue, price_band, notes, booking_url, airbnb_url}).
 */
(function () {
  "use strict";

  var allEntries = window.ACCOMMODATION_DATA || [];
  var venue = allEntries.filter(function (e) { return e.type === "venue"; })[0];
  var areas = allEntries.filter(function (e) { return e.type === "area"; });
  if (!areas.length) return;

  /* ── Collect unique values for filter dropdowns ────────────────────── */

  var lineCount = {};
  var bandSet = {};

  areas.forEach(function (area) {
    area.metro_lines.forEach(function (line) {
      lineCount[line] = (lineCount[line] || 0) + 1;
    });
    bandSet[area.price_band] = true;
  });

  var lines = Object.keys(lineCount).sort();
  var bands = Object.keys(bandSet).sort();

  /* ── Populate dropdowns ────────────────────────────────────────────── */

  var selLine = document.getElementById("accommodation-filter-line");
  var selBand = document.getElementById("accommodation-filter-band");

  lines.forEach(function (line) {
    var opt = document.createElement("option");
    opt.value = line;
    opt.textContent = "Line " + line + " (" + lineCount[line] + ")";
    selLine.appendChild(opt);
  });

  bands.forEach(function (band) {
    var opt = document.createElement("option");
    opt.value = band;
    opt.textContent = band;
    selBand.appendChild(opt);
  });

  /* ── Init Leaflet map, centered on the venue ──────────────────────── */

  var center = venue ? [venue.lat, venue.lon] : [40.4412, -3.6862];
  var map = L.map("accommodation-map", { scrollWheelZoom: false }).setView(center, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  /* ── Custom marker icons ──────────────────────────────────────────── */

  function makeIcon(color, size) {
    return L.divIcon({
      className: "",
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2 - 2],
      html:
        '<svg width="' + size + '" height="' + size + '"><circle cx="' + size / 2 +
        '" cy="' + size / 2 + '" r="' + (size / 2 - 1) + '" fill="' + color +
        '" stroke="#fff" stroke-width="2"/></svg>',
    });
  }

  var defaultIcon = makeIcon("#60BFAF", 16);
  var highlightIcon = makeIcon("#5D288F", 16);
  var venueIcon = makeIcon("#E07A2E", 22);

  if (venue) {
    L.marker([venue.lat, venue.lon], { icon: venueIcon })
      .bindPopup('<div class="accommodation-popup"><h4>' + venue.name + "</h4><p>Training School venue</p></div>")
      .addTo(map);
  }

  /* ── Create area markers ──────────────────────────────────────────── */

  var markers = {}; /* id → L.marker */

  areas.forEach(function (area) {
    var popupHtml =
      '<div class="accommodation-popup">' +
      "<h4>" + area.name + "</h4>" +
      "<p>Line" + (area.metro_lines.length > 1 ? "s " : " ") + area.metro_lines.join(" & ") +
      " · " + area.nearest_station + "</p>" +
      "<p>" + area.stops_to_venue + "</p>" +
      "<p>Price band: <strong>" + area.price_band + "</strong></p>" +
      "</div>";

    var marker = L.marker([area.lat, area.lon], { icon: defaultIcon })
      .bindPopup(popupHtml)
      .addTo(map);

    marker.on("click", function () {
      highlightCard(area.id);
    });

    markers[area.id] = marker;
  });

  /* ── Build card list ───────────────────────────────────────────────── */

  var gridEl = document.getElementById("accommodation-grid");
  var cards = {}; /* id → DOM element */

  areas.forEach(function (area) {
    var card = document.createElement("div");
    card.className = "accommodation-card";
    card.setAttribute("data-id", area.id);
    card.setAttribute("data-lines", area.metro_lines.join("|"));
    card.setAttribute("data-band", area.price_band);
    card.setAttribute(
      "data-search",
      [area.name, area.nearest_station, area.notes].join(" ").toLowerCase()
    );

    var linesHtml = area.metro_lines
      .map(function (l) {
        return '<span class="accommodation-tag">Line ' + l + "</span>";
      })
      .join("");

    card.innerHTML =
      "<h4>" + area.name + "</h4>" +
      '<p class="accommodation-card__meta">' + area.stops_to_venue + "</p>" +
      '<p class="accommodation-card__notes">' + area.notes + "</p>" +
      '<p class="accommodation-card__band">Price band: <strong>' + area.price_band + "</strong></p>" +
      '<div class="accommodation-card__links">' +
      '<a href="' + area.booking_url + '" target="_blank" rel="noopener">Booking.com</a>' +
      '<a href="' + area.airbnb_url + '" target="_blank" rel="noopener">Airbnb</a>' +
      "</div>" +
      '<div class="accommodation-card__tags">' + linesHtml + "</div>";

    card.addEventListener("click", function (evt) {
      if (evt.target.tagName === "A") return; /* let link clicks through */
      map.setView([area.lat, area.lon], 15);
      markers[area.id].openPopup();
      highlightCard(area.id);
    });

    gridEl.appendChild(card);
    cards[area.id] = card;
  });

  /* ── Highlight / sync ──────────────────────────────────────────────── */

  var highlighted = null;

  function highlightCard(id) {
    if (highlighted && cards[highlighted]) {
      cards[highlighted].classList.remove("highlight");
      markers[highlighted].setIcon(defaultIcon);
    }
    highlighted = id;
    if (cards[id]) {
      cards[id].classList.add("highlight");
      cards[id].scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
    markers[id].setIcon(highlightIcon);
  }

  /* ── Filtering logic ───────────────────────────────────────────────── */

  var countEl = document.getElementById("accommodation-count");

  function applyFilters() {
    var query = document.getElementById("accommodation-search").value.toLowerCase();
    var line = selLine.value;
    var band = selBand.value;
    var visible = 0;

    areas.forEach(function (area) {
      var card = cards[area.id];
      var matchSearch =
        !query || card.getAttribute("data-search").indexOf(query) !== -1;
      var matchLine =
        !line || card.getAttribute("data-lines").split("|").indexOf(line) !== -1;
      var matchBand = !band || area.price_band === band;

      if (matchSearch && matchLine && matchBand) {
        card.classList.remove("hidden");
        markers[area.id].addTo(map);
        visible++;
      } else {
        card.classList.add("hidden");
        map.removeLayer(markers[area.id]);
      }
    });

    countEl.textContent = visible + " of " + areas.length + " areas";
  }

  document.getElementById("accommodation-search").addEventListener("input", applyFilters);
  selLine.addEventListener("change", applyFilters);
  selBand.addEventListener("change", applyFilters);

  /* ── Fit map to visible markers (plus the venue) ──────────────────── */

  document.getElementById("accommodation-fit").addEventListener("click", function () {
    var layers = Object.keys(markers)
      .filter(function (id) { return map.hasLayer(markers[id]); })
      .map(function (id) { return markers[id]; });
    if (venue) layers.push(L.marker([venue.lat, venue.lon]));
    var group = L.featureGroup(layers);
    if (group.getLayers().length) {
      map.fitBounds(group.getBounds().pad(0.15));
    }
  });

  /* ── Initial count ─────────────────────────────────────────────────── */

  countEl.textContent = areas.length + " of " + areas.length + " areas";
})();
