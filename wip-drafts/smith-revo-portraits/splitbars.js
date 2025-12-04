// Code structured inspired by https://d3-graph-gallery.com/graph/barplot_horizontal.html
// Enhanced and applied to context by GPT 5-mini on Copilot

const DATA = "data/portraits_small.csv";

// Comfortable size, comfortable margins
const CHART_W = 1100, CHART_H = 520;

// Reduce left gutter so mosaics have more horizontal space
const M = { top: 0, right: 30, bottom: 40, left: 80 };

// Images wouldn't load on browser, so debugged thus using GPT 5-mini on Copilot

// Create svg and declare xlink namespace for broader image href support
const svg = d3
  .select("#chart")
  .append("svg")
  .attr("viewBox", `0 0 ${CHART_W} ${CHART_H}`)

  // Declare both the default SVG namespace and xlink for broad compatibility
  .attr("xmlns", "http://www.w3.org/2000/svg")
  .attr("xmlns:xlink", "http://www.w3.org/1999/xlink");
const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
const innerW = CHART_W - M.left - M.right;
const innerH = CHART_H - M.top - M.bottom;

const x = d3.scaleLinear().range([0, innerW]);
const y = d3.scaleBand().range([0, innerH]).padding(0.25);

// Axes grouped separately so we can style x vs y labels independently
const xAxis = g.append("g").attr("transform", `translate(0, ${innerH})`).attr("class", "axis x-axis");
const yAxis = g.append("g").attr("class", "axis y-axis");

// Consistent gap (px) between the end of a filled bar and its numeric label
const LABEL_GAP = 8;

const modeSel = document.getElementById("mode");
const note = document.getElementById("note");
const detailsPanel = document.getElementById("details-panel");
const detailsContent = document.getElementById("details-content");
const detailsClose = document.getElementById("details-close");

// Helpers for data normalisation and grouping since the CSV is a mess
// Categories renamed in layperson terms for clarity

// Normalize gender strings
function normGender(g) {
  const s = String(g || "").trim().toLowerCase();
  if (!s) return "Unknown";

  // Detect multi-person / family entries using common indicators
  const multiIndicators = ["family", " and ", ",", "&", "group", "children", "multiple", "members"];
  for (const ind of multiIndicators) {
    if (s.includes(ind)) return "Family Portrait";
  }
  if (s.startsWith("m")) return "Male";
  if (s.startsWith("f")) return "Female";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Size: detect “Miniature” from objectType
function normSize(objectType) {
  const s = String(objectType || "").toLowerCase();
  return s.includes("miniature") ? "Miniature" : "Regular";
}

// Artist: classify as Anonymous (blank or Unidentified) or Credited
function normArtist(artist) {
  const s = String(artist || "").trim();
  if (!s) return "Unnamed artist";
  const low = s.toLowerCase();
  if (low === "unidentified" || low === "unknown") return "Unnamed artist";
  return "Named artist";
}

// Sitter: classify as Anonymous (unidentified or blank) or Credited
function normSitter(sitter) {
  const s = String(sitter || "").trim();
  if (!s) return "Unnamed sitter";
  const low = s.toLowerCase();
  if (low === "unidentified" || low === "unknown") return "Unnamed sitter";
  return "Named sitter";
}

// Group rows by mode and keep items (for mosaics)
function groupData(rows, mode) {
  let keyFn;
  if (mode === "gender") keyFn = (d) => normGender(d.gender);
  else if (mode === "size") keyFn = (d) => normSize(d.objectType);
  else if (mode === "artist") keyFn = (d) => normArtist(d.artist);
  else if (mode === "sitter") keyFn = (d) => normSitter(d.sitter);
  else keyFn = (d) => normGender(d.gender);
  const groups = d3.groups(rows, keyFn);
  return groups
    .map(([key, items]) => ({ key, count: items.length, items }))
    .sort((a, b) => d3.descending(a.count, b.count));
}

// Find the largest square tile that packs N images into a w×h box, with gap
// Trial and error, inspired by https://flowingdata.com/tiled-bar-chart-demo/

function fitTiles(w, h, N, gap) {
  if (N <= 0) return { s: 0, cols: 0, rows: 0 };
  let lo = 1, hi = Math.floor(Math.min(w, h));
  let best = { s: 1, cols: 1, rows: N };     // Always valid
  while (lo <= hi) {
    const s = Math.floor((lo + hi) / 2);
    const cols = Math.max(1, Math.floor(w / (s + gap)));
    const rows = Math.ceil(N / cols);
    const fits = rows * (s + gap) <= h;
    if (cols > 0 && fits) {
      best = { s, cols, rows };
      lo = s + 1;     // Try bigger tiles
    } else {
      hi = s - 1;     // Too big, try smaller
    }
  }
  return best;
}

// Fixing broken images and thumbnails
async function preloadAndRender() {
  const allRows = await d3.csv(DATA, d3.autoType);

  // Build map of unique thumbnails to test
  const thumbSet = new Map();
  for (const r of allRows) {
    if (r && r.thumbnail && String(r.thumbnail).length) {
      thumbSet.set(r.thumbnail, r.thumbnail);
    }
  }

  // Create placeholder data-url SVG
  function placeholderDataUrl(size = 48) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      `<rect width="100%" height="100%" fill="#112" />` +
      `<text x="50%" y="50%" fill="#9fb" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(12, Math.floor(size/2.5))}" dominant-baseline="middle" text-anchor="middle">?</text>` +
      `</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  // Return resolved URL or placeholder
  function probeUrl(url) {
    return new Promise((resolve) => {
      try {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => {
          console.warn('Preflight: thumbnail failed to load:', url);
          resolve(placeholderDataUrl(48));
        };
        // Try to load; avoid cache-busting unless necessary
        img.crossOrigin = 'anonymous';
        img.src = url;

        // If browser doesn't fire onerror/onload quickly, set a timeout
        setTimeout(() => {
          if (!img.complete) {
            console.warn('Preflight: thumbnail timed out:', url);
            resolve(placeholderDataUrl(48));
          }
        }, 4000);
      } catch (e) {
        console.warn('Preflight: exception probing thumbnail:', url, e && e.message);
        resolve(placeholderDataUrl(48));
      }
    });
  }

  // Run probes in parallel (but limit concurrency lightly)
  const thumbs = Array.from(thumbSet.keys());
  const results = {};
  const CONC = 12;
  for (let i = 0; i < thumbs.length; i += CONC) {
    const batch = thumbs.slice(i, i + CONC).map((u) => probeUrl(u).then((r) => (results[u] = r)));
    await Promise.all(batch);
  }

  // Rewrite failing thumbnail urls in the data
  for (const r of allRows) {
    if (r && r.thumbnail && String(r.thumbnail).length) {
      if (results[r.thumbnail] && results[r.thumbnail].startsWith('data:image')) {
        r.thumbnail = results[r.thumbnail];
      }
    }
  }

  // Keep only rows with a usable thumbnail
  const rows = allRows.filter((r) => r && r.thumbnail && String(r.thumbnail).length);

  // Rendering
  function update(mode) {
    const data = groupData(rows, mode);

    // Scales and axes
    y.domain(data.map((d) => d.key));
    x.domain([0, d3.max(data, (d) => d.count) || 1]);

    xAxis.transition().duration(300).call(d3.axisBottom(x).ticks(6));

    // Build a quick lookup for counts by category
    const countsMap = new Map(data.map((d) => [d.key, d.count]));
    const yAxisGen = d3.axisLeft(y);
    yAxis.transition().duration(300).call(yAxisGen).on('end', () => {
      yAxis.selectAll('.tick').each(function (d) {
        const tick = d3.select(this);
        const key = d; //     Category key here
        const c = countsMap.get(key) || '';

        // Clear existing text and append tspans built from data
        tick.select('text').text(null);
        tick
          .select('text')
          .append('tspan')
          .attr('class', 'tick-label')
          .text(key);
        tick
          .select('text')
          .append('tspan')
          .attr('class', 'tick-count')
          .text(c ? ` (${c})` : '');
      });
    });

    // JOIN a <g.row> per category
    const rowsSel = g.selectAll(".row").data(data, (d) => d.key);

    const rowsEnter = rowsSel
      .enter()
      .append("g")
      .attr("class", "row")
      .attr("transform", (d) => `translate(0, ${y(d.key)})`);

    // ClipPath (rounded rect) per row
    rowsEnter.append("clipPath").attr("class", "bar-clip");

    // Mosaic group to hold images (clipped)
    rowsEnter.append("g").attr("class", "mosaic");

    // Thin outline so rounded edges look clean
    rowsEnter
      .append("rect")
      .attr("class", "bar-outline")
      .attr("height", y.bandwidth())
      .attr("rx", 8)
      .attr("ry", 8)
      .attr("fill", "none")
      .attr("stroke", "#ddd");

  // NOTE: Show numeric values in the y-axis tick labels
  // (e.g., "Category (129)") instead of as separate text nodes at the
  // end of each bar. This keeps labels aligned with the category title.

    const rowG = rowsEnter.merge(rowsSel);

    // Position rows
    rowG.transition().duration(400).attr("transform", (d) => `translate(0, ${y(d.key)})`);

    // Per-row layout
    rowG.each(function (d) {
      const gRow = d3.select(this);
      const w = x(d.count);
      const h = y.bandwidth();
      const safeKey = d.key.replace(/\W+/g, "_");
      const clipId = `clip-${safeKey}`;

      // Update clip rect
      gRow
        .select(".bar-clip")
        .attr("id", clipId)
        .selectAll("rect")
        .data([d])
        .join("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", w)
  .attr("height", h)
        .attr("rx", 8)
        .attr("ry", 8);

  // Link mosaic to clip and ensure mosaic group is aligned to the same left origin
  const mosaic = gRow.select(".mosaic").attr("clip-path", `url(#${clipId})`).attr("transform", `translate(0,0)`);

      // Fit ALL thumbnails inside the bar
      const items = d.items.filter((r) => r.thumbnail && String(r.thumbnail).length);
      const N = items.length;
      const GAP = 2;

  const { s: tile, cols } = fitTiles(w, h, N, GAP);

  // Compute how many rows/ctls the mosaic will use
  const rowsNeeded = Math.ceil(N / cols) || 0;
  
  // Width/height used by the tiles (no trailing gap after the last tile)
  const usedWidth = cols > 0 ? cols * (tile + GAP) - GAP : 0;
  const usedHeight = rowsNeeded > 0 ? rowsNeeded * (tile + GAP) - GAP : 0;

  // Center the mosaic inside the bar when there is spare space
  const xOffset = Math.max(0, Math.floor((w - usedWidth) / 2));
  const yOffset = Math.max(0, Math.floor((h - usedHeight) / 2));

  // Determine the filled width of the bar. If the mosaic extends past the
  // nominal x(d.count) width (e.g., many small tiles centered), ensure the
  // clip, outline and numeric label use the actual used width so the label
  // appears a consistent distance from the visible filled area.
  const filledWidth = Math.max(w, usedWidth);

  // Bind all N thumbnails
      const imgs = mosaic.selectAll("image").data(items, (r, i) => r.thumbnail + "_" + i);

      imgs
  .enter()
  .append("image")
  .attr("preserveAspectRatio", "xMidYMid slice")
  .attr("href", (r) => r.thumbnail)
  .attr("xlink:href", (r) => r.thumbnail)

  // Attach a real runtime error handler (fires when the image fails to load)
  .on("error", function (event, d) {

    // D is the datum here, event is the error event (again, in case we need it)
    try { this.classList.add('broken-image'); } catch (e) {}
    const category = d3.select(this.parentNode.parentNode).datum()?.key;
    console.warn('Thumbnail failed to load:', d && d.thumbnail, 'category:', category);
    try {
      const size = Math.max(24, Math.round(typeof tile === 'number' ? tile : 40));
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
        `<rect width="100%" height="100%" fill="#112" />` +
        `<text x="50%" y="50%" fill="#9fb" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(12, Math.floor(size/2.5))}" dominant-baseline="middle" text-anchor="middle">?</text>` +
        `</svg>`;
      const dataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
      this.setAttribute('href', dataUrl);
      this.setAttribute('xlink:href', dataUrl);
    } catch (e) {
      try { this.style.display = 'none'; } catch (e2) {}
    }
  })
  .attr("role", "button")
  .attr("tabindex", 0)
  .merge(imgs)
  .attr("width", tile)
  .attr("height", tile)
  .attr("x", (_r, i) => xOffset + (i % cols) * (tile + GAP))
  .attr("y", (_r, i) => yOffset + Math.floor(i / cols) * (tile + GAP));

      // Click to open given thumnail in the details panel
      // Decided to abandon hover preview due to difficulty on touch devices
      mosaic.on('pointermove', null).on('pointerleave', null);

      // Add click and keyboard handlers to each image (accessibility: Enter/Space)
          let lastSelected = null;
          mosaic.selectAll('image')
            .on('click', function (event, d) {
              try {
                if (lastSelected === this) {

                  // Toggle off
                  this.classList.remove('thumb-selected');
                  lastSelected = null;
                  hideDetails();
                  return;
                }
                if (lastSelected && lastSelected !== this) lastSelected.classList.remove('thumb-selected');
                this.classList.add('thumb-selected');
                lastSelected = this;
              } catch (e) {}
              showDetails(d);
            })
            .on('keydown', function (event, d) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                try {
                  if (lastSelected === this) {
                    this.classList.remove('thumb-selected');
                    lastSelected = null;
                    hideDetails();
                    return;
                  }
                  if (lastSelected && lastSelected !== this) lastSelected.classList.remove('thumb-selected');
                  this.classList.add('thumb-selected');
                  lastSelected = this;
                } catch (e) {}
                showDetails(d);
              }
            });

          // Clear selection when closing the panel
          const _origHide = hideDetails;
          window.clearThumbnailSelection = function() {
            try { if (lastSelected) lastSelected.classList.remove('thumb-selected'); lastSelected = null; } catch (e) {}
          };

      imgs.exit().remove();

    // Set bar outline explicitly at x=0 and width to the computed filledWidth
    gRow.select(".bar-outline").attr("x", 0).attr("width", filledWidth);
    });

    // EXIT
    rowsSel.exit().remove();

    // Footnote: produce a sentence like
    // "Of 255 portraits, 73% are men, 26% women, and 1% families. The 66 female sitters are striking, more than one might expect."
    const total = d3.sum(data, (d) => d.count) || 0;
    const breakdown = data
      .map((d) => ({ key: d.key, count: d.count, pct: Math.round((d.count / (total || 1)) * 100) }))
      .sort((a, b) => d3.descending(a.count, b.count));

    // Special case for gender: use the exact phrasing requested by the user
    if (mode === 'gender') {
      const female = breakdown.find((d) => /female/i.test(d.key)) || { count: 0 };
      const femaleCount = female.count || 0;
      note.textContent = `It\u2019s a boys\u2019 club, mostly. Except for ${femaleCount} women who somehow made it onto the wall.`;
      return;
    }

    // Explicit phrasing for other modes per user corrections
    if (mode === 'size') {
      note.textContent = `Eeny, meeny, miny, moe nearly half are miniatures on show.`.replace('\u0014', '…');
      return;
    }

    if (mode === 'artist') {
      note.textContent = `4 out of 5 artists signed their work; the others ghosted.`;
      return;
    }

    if (mode === 'sitter') {

      // Compute named vs unnamed sitter percentages
      const namedS = breakdown.find((d) => /named/i.test(d.key)) || { count: 0 };
      const unnamedS = breakdown.find((d) => /unnamed|unnamed sitter|unnamed sitter/i.test(d.key)) || null;
      const knownCount = namedS.count || 0;

      // Unnamed percent fallback is total-known complement
      const knownPct = Math.round((knownCount / (total || 1)) * 100);
      const unnamedPct = 100 - knownPct;
      note.textContent = `${knownPct}% introduced themselves, ${unnamedPct}% slipped out incognito.`;
      return;
    }

    // Close the nested update() function
  }

  modeSel.addEventListener("change", (e) => update(e.target.value));
  update("size");
}

// Start the preload + render process
preloadAndRender().catch((e) => console.error('Preload/render failed', e));

// Show details for a single record in the right-hand panel
function showDetails(item) {
  if (!item) return;
  const title = item.title ? String(item.title).trim() : "";
  const artist = item.artist ? String(item.artist).trim() : "";
  const sitter = item.sitter ? String(item.sitter).trim() : "";
  const date = item.date ? String(item.date).trim() : "";
  const place = item.place ? String(item.place).trim() : "";
  const thumb = item.thumbnail ? String(item.thumbnail).trim() : "";

  // Helper to normalize potential object or JSON-string fields into a plain string
  function normalizeField(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') {

      // Prefer obvious string properties if present
      if (val.title) return String(val.title);
      if (val.Date) return String(val.Date);
      try { return JSON.stringify(val); } catch (e) { return String(val); }
    }
    const s = String(val).trim();

    // If it looks like JSON, try to parse and extract a useful field
    // Avoids showing raw {"type":"Person","name":"John Doe"} strings
    if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
      try {
        const obj = JSON.parse(s);
        if (obj && typeof obj === 'object') {
          if (obj.title) return String(obj.title);
          if (obj.Date) return String(obj.Date);

          // Fall back to a simple join of primitive values
          return Object.values(obj).filter(v => v && (typeof v === 'string' || typeof v === 'number')).join(' ');
        }
      } catch (e) {
        
        // If not JSON, fall through
      }
    }
    return s;
  }

  // Build simple Key: Value lines for present fields, avoiding braces
  const visible = [];
  const nTitle = normalizeField(title);
  const nArtist = normalizeField(artist);
  const nSitter = normalizeField(sitter);
  const nDate = normalizeField(date);
  const nPlace = normalizeField(place);

  // Collapse repeated adjacent words like "unidentified unidentified" to "unidentified"
  function dedupeWords(s) {
    if (!s) return s;
    return s.replace(/\b(\w+)(?:\s+\1\b)+/gi, '$1');
  }
  const dnTitle = dedupeWords(nTitle);
  const dnArtist = dedupeWords(nArtist);
  const dnSitter = dedupeWords(nSitter);
  const dnDate = dedupeWords(nDate);
  const dnPlace = dedupeWords(nPlace);
  if (nArtist && !/^\s*(unidentified|unknown|unnamed)\s*$/i.test(nArtist)) visible.push(['Artist', nArtist]);
  if (dnSitter && !/^\s*(unidentified|unknown|unnamed)\s*$/i.test(dnSitter)) visible.push(['Sitter', dnSitter]);
  if (dnDate) visible.push(['Date', dnDate]);
  if (dnPlace) visible.push(['Place', dnPlace]);

  let html = '';
  if (thumb) html += `<img src="${thumb}" alt="${escapeHtml(nTitle || 'thumbnail')}" style="width:100%;height:auto;display:block;"/>`;
  if (nTitle) html += `<h3>${escapeHtml(nTitle)}</h3><br/>`;
  if (visible.length) {
    html += '<div class="details-list">';
    for (const [k, v] of visible) {

      // Include an explicit <br/> after each row for easier reading
      html += `<div class="details-row"><strong>${escapeHtml(k)}:</strong>&nbsp;${escapeHtml(v)}</div><br/>`;
    }
    html += '</div>';
  }
  detailsContent.innerHTML = html;
  detailsPanel.setAttribute('aria-hidden', 'false');
  detailsPanel.setAttribute('tabindex', '-1');
  detailsPanel.focus?.();
  try { detailsClose.style.display = 'block'; } catch (e) {}
}

function hideDetails() {
  detailsPanel.setAttribute("aria-hidden", "true");
  try { window.clearThumbnailSelection && window.clearThumbnailSelection(); } catch (e) {}
}

detailsClose.addEventListener("click", hideDetails);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideDetails();
});

// Tiny helper to avoid injection in simple strings
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Minimal live preview: set only the image src (no pinning or metadata)
function updateLivePreview(eventOrItem, maybeItem) {
  let item = maybeItem !== undefined ? maybeItem : eventOrItem;
  if (!item) return;
  const thumb = item.thumbnail || "";

  // Render only the image
  detailsContent.innerHTML = `<img src="${thumb}" alt="preview"/>`;
}
