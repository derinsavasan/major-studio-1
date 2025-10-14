# Face to Face: American Portraits 1770-1872

An interactive D3.js visualization exploring American portrait data from the Smithsonian National Portrait Gallery.

## Features
- **Flip Clock Wall** — Opening animation with portraits displayed as flipping tiles
- **Timeline Scatterplot** — Chronological visualization of portraits by year
- **Categorical Breakdown** — View portraits grouped by Size, Artist, Sitter, or Gender
- **Responsive Design** — Adapts seamlessly to different screen sizes

## Files
- `index.html` — Page structure
- `styles.css` — Minimal styling
- `script.js` — D3 visualization code
- `data/portraits_v1.csv` — Portrait dataset from Smithsonian

## Run
1. Open the folder in VS Code
2. Use Live Server extension or run `python3 -m http.server 8000`
3. Visit http://localhost:8000
4. Experience the flip clock intro, then explore the timeline and breakdowns

## Controls
- **DEV_MODE** — Set to `true` in `script.js` to skip intro and go straight to timeline
- **Explore Button** — Starts the transition from flip clock wall to timeline
- **See Breakdown** — Opens categorical analysis dropdown
- **Category Dropdown** — Select Size, Artist, Sitter, or Gender to reorganize the timeline

## Customize
- Add category explanations in the `categories` array (search for "TODO: Add text")
- Adjust responsive margins in `categoryMargin` and main `margin` objects
- Modify animation timings in transition functions
