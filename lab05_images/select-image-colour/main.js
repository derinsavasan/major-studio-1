d3.json('./data.json')
  .then(json => {
    // execute the display images function
    displayImages(json);
  });

// function to create all DOM elements
function displayImages(json) {
  // select a <div> with an id of "app"; this is where all images will be added
  let app = d3.select('#app');

  // sort the JSON data; date descending
  let data = json.sort((a, b) => (b.date > a.date) ? 1 : -1);
  // date ascending
  // let data = json.sort((a, b) => (a.date > b.date) ? 1 : -1);

  // define "cards" for each item
  let card = app.selectAll('div.card')
    .data(data)
    .join('div')
    .attr('class', 'card');

  // create a div with a class of "image" and populate it with an <img/> tag that contains the filepath
  card.append('div')
    .attr('class', 'image')
    .append('img')
    .attr('src', d => {
      // all images are in the "images" folder which needs to be added to the filename
      return './images/' + d.filename;
    })
    .on('click', function(event, d) {
      // Extract vibrant color and change background when image is clicked
      changeBackgroundColor(d);
    });

  // create a paragraph that will hold the object date
  card.append('p')
    .attr('class', 'object-date')
    .text(d => d.date);

  // create a heading tag that will be the object title
  card.append('h2')
    .attr('class', 'title')
    .text(d => d.title);
}

// Function to change background color based on image's most vibrant color
function changeBackgroundColor(imageData) {
  const imagePath = './images/' + imageData.filename;
  
  // Clear previous swatches
  const paletteContainer = document.getElementById("palette_container");
  paletteContainer.innerHTML = "";
  
  // Extract vibrant color and set as background
  Vibrant.from(imagePath).getPalette(function(err, palette) {
    if (err) {
      console.error('Error extracting colors:', err);
      return;
    }
    
    // Display all color swatches like in 02_vibrant-colors
    for (let swatch in palette) {
      if (palette[swatch]) {
        console.log(swatch, palette[swatch].getHex());
        
        const div = document.createElement("div");
        div.className = 'swatch';
        div.style.backgroundColor = palette[swatch].getHex();
        paletteContainer.appendChild(div);
      }
    }
    
    // Try to get the most vibrant color for background, fallback to other colors if not available
    let vibrantColor = null;
    if (palette.Vibrant) {
      vibrantColor = palette.Vibrant.getHex();
    } else if (palette.DarkVibrant) {
      vibrantColor = palette.DarkVibrant.getHex();
    } else if (palette.LightVibrant) {
      vibrantColor = palette.LightVibrant.getHex();
    } else if (palette.Muted) {
      vibrantColor = palette.Muted.getHex();
    }
    
    if (vibrantColor) {
      // Set the background color
      document.body.style.backgroundColor = vibrantColor;
      console.log('Applied vibrant color:', vibrantColor);
    }
  });
}
