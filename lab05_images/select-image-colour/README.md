# Select Image Color Gallery

A simple interactive image gallery where clicking on any image changes the gallery background to that image's most vibrant color.

## Features

- **Image Card Layout**: Displays artwork in a responsive grid layout using D3.js
- **Click Interaction**: Click any image to extract its most vibrant color
- **Dynamic Background**: The gallery background smoothly transitions to the selected image's vibrant color
- **Color Fallback**: Automatically falls back to other color types if vibrant color isn't available
- **Hover Effects**: Cards have subtle hover animations for better user experience
- **Keyboard Reset**: Press 'R' to reset the background to default

## How it works

1. The gallery loads art images from a JSON data file
2. Each image is displayed as a card with title and date information
3. When you click on an image, the Vibrant.js library extracts the most prominent color
4. The background smoothly transitions to a gradient based on that color
5. The color extraction prioritizes: Vibrant → Dark Vibrant → Light Vibrant → Muted colors

## Technologies Used

- **D3.js**: For data binding and DOM manipulation
- **Vibrant.js**: For color extraction from images
- **CSS3**: For styling and smooth transitions
- **Vanilla JavaScript**: For click handling and color application

## Files

- `index.html`: Main HTML structure with styling
- `main.js`: JavaScript functionality for image display and color extraction
- `data.json`: Metadata for the artwork images
- `images/`: Folder containing artwork images
- `libraries/vibrant.js`: Color extraction library

Click on any artwork to see its vibrant color come alive as the gallery background!
