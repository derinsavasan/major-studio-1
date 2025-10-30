# Face Value

**American Revolution Portraits: Who Actually Made It Into the Frame?**

By Derin Savasan

Face Value looks at portraits from the American Revolution and asks a basic question: who actually made it into the frame? I scraped data from the National Portrait Gallery and built a set of interactives (filters, memory game) that let you see the gaps for yourself. Men everywhere. Women barely visible. A handful of artists shaping what the "founders" even look like. It's history told through portraits, but the absences say more than the faces. This isn't about patriotism. It's about who gets remembered, and who gets edited out.

## Screenshots

![Flip Clock Wall Introduction](images/Screenshot%202025-10-30%20at%202.17.27%20PM.png)
*Opening animation with portraits displayed as flipping tiles*

![Timeline Scatterplot](images/Screenshot%202025-10-30%20at%202.17.54%20PM.png)
*Chronological visualization of portrait production (1770-1815)*

![1795 Spike Analysis](images/Screenshot%202025-10-30%20at%202.18.06%20PM.png)
*The year America sat for its portrait—Gilbert Stuart's influence*

![Category Dropdown](images/Screenshot%202025-10-30%20at%202.18.16%20PM.png)
*Interactive filters for exploring the data*

![Gender Breakdown](images/Screenshot%202025-10-30%20at%202.18.40%20PM.png)
*The gender divide in Revolutionary portraiture*

![Artist Breakdown](images/Screenshot%202025-10-30%20at%202.18.57%20PM.png)
*Known vs. unknown artists—who gets remembered?*

## Features
- **Flip Clock Wall** — Opening animation with portraits displayed as flipping tiles that reveal the collection
- **Timeline Scatterplot** — Chronological visualization showing when portraits were created (1770-1872)
- **Categorical Breakdown** — Filter and reorganize portraits by Size, Artist, Sitter, or Gender to expose patterns
- **Memory Game** — Interactive challenge to test recognition of historical figures
- **Responsive Design** — Seamlessly adapts to different screen sizes

## Project Structure
- `index.html` — Main page structure
- `styles.css` — Visual styling
- `script.js` — D3.js visualization and interaction logic
- `data/portraits_v1.csv` — Portrait dataset scraped from the Smithsonian National Portrait 

