// DEV MODE: Set to true to skip intro and go straight to timeline
const DEV_MODE = false;

// Simple working flip clock wall
console.log("=== Starting Simple Version ===");

let W, H, cols, rows, cellWidth, cellHeight, svg;

// Utility function to create a styled button
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Promise-based animation sequence utility
function sequenceAnimations(animations) {
  return animations.reduce((promise, animation) => {
    return promise.then(() => animation());
  }, Promise.resolve());
}

// Utility function for wrapping text to fit within maxWidth
function wrapText(text, maxWidth, charWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const estimatedWidth = testLine.length * charWidth;
    
    if (estimatedWidth <= maxWidth && currentLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function createButton(group, text, x, y, width, height, onClick) {
  const buttonGroup = group.append("g")
    .attr("class", "button")
    .attr("transform", `translate(${x}, ${y})`)
    .style("cursor", "pointer")
    .style("opacity", 0);

  buttonGroup.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "#f0f0f0")
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("rx", 18);

  buttonGroup.append("text")
    .attr("x", width / 2)
    .attr("y", 23)
    .attr("text-anchor", "middle")
    .attr("fill", "#2a2a2a")
    .attr("font-family", "system-ui, -apple-system, sans-serif")
    .attr("font-size", "15px")
    .attr("font-weight", "500")
    .text(text);

  // Hover effects
  buttonGroup
    .on("mouseenter", function() {
      d3.select(this).select("rect")
        .transition()
        .duration(200)
        .attr("fill", "rgba(255, 255, 255, 1)");
    })
    .on("mouseleave", function() {
      d3.select(this).select("rect")
        .transition()
        .duration(200)
        .attr("fill", "rgba(255, 255, 255, 0.9)");
    })
    .on("click", onClick);

  return buttonGroup;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Promise-based animation sequence utility
function sequenceAnimations(animations) {
  return animations.reduce((promise, animation) => {
    return promise.then(() => animation());
  }, Promise.resolve());
}

// Utility function for wrapping text to fit within maxWidth
function wrapText(text, maxWidth, charWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const estimatedWidth = testLine.length * charWidth;
    
    if (estimatedWidth <= maxWidth && currentLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
}

function calculateDimensions() {
  W = window.innerWidth;
  H = window.innerHeight;
  
  // Calculate seamless grid
  cols = Math.floor(W / 150);
  rows = Math.floor(H / 200);
  cellWidth = Math.floor(W / cols);
  cellHeight = Math.floor(H / rows);
  
  console.log("Grid:", cols, "x", rows, "Cell size:", cellWidth, "x", cellHeight);
}

function createSVG() {
  // Clear existing
  d3.select("#chart").selectAll("*").remove();
  
  // Create SVG
  svg = d3.select("#chart")
    .append("svg")
    .attr("width", W)
    .attr("height", H)
    .style("background", "#0a0a0a"); // Dark background
}

function drawGrid() {
  // Create seamless grid (no borders)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      svg.append("rect")
        .attr("x", x)
        .attr("y", y)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", "#0a0a0a"); // Consistent dark background
    }
  }
}

// Initialize - skip if in dev mode
if (!DEV_MODE) {
  calculateDimensions();
  createSVG();
  drawGrid();
}

// Load portraits function
function loadPortraits() {
  d3.csv("data/portraits_v1.csv").then(data => {
    console.log("Portraits loaded:", data.length);
    
    // Parse and filter portraits
    const portraits = data.map(d => ({
      title: d.title,
      artist: d.artist,
      thumb: d.thumbnail || ""
    })).filter(d => d.thumb);
    
    console.log("Valid portraits:", portraits.length);
    
    // Shuffle portraits
    const shuffled = d3.shuffle(portraits);
    
    // Add portraits to grid
    let index = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        if (index < shuffled.length) {
          const portrait = shuffled[index];
          
          // Create clipping path
          const clipId = `clip-${index}`;
          svg.select("defs").empty() || svg.append("defs");
          svg.select("defs").append("clipPath")
            .attr("id", clipId)
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", cellWidth)
            .attr("height", cellHeight);
          
          // Add portrait image - completely seamless
          svg.append("image")
            .attr("class", "portrait")
            .attr("x", x)
            .attr("y", y)
            .attr("width", cellWidth)
            .attr("height", cellHeight)
            .attr("href", portrait.thumb)
            .attr("clip-path", `url(#${clipId})`)
            .attr("preserveAspectRatio", "xMidYMid slice")
            .style("opacity", 0)
            .transition()
            .delay(index * 20)
            .duration(500)
            .style("opacity", 1);
        }
        
        index++;
      }
    }
    
    // Start random flipping after load
    setTimeout(() => {
      // Calculate flip interval based on grid size to maintain consistent frequency
      const totalCells = rows * cols;
      const baseInterval = 400; // Base interval for a reference grid
      const adjustedInterval = Math.max(200, baseInterval * (64 / totalCells)); // Normalize to 8x8 grid
      
      console.log("Flip interval:", adjustedInterval, "ms for", totalCells, "cells");
      
      // Store interval ID globally so we can clear it later
      window.flipInterval = setInterval(() => {
        const images = svg.selectAll("image.portrait");
        const randomImage = images.nodes()[Math.floor(Math.random() * images.size())];
        const randomPortrait = shuffled[Math.floor(Math.random() * shuffled.length)];
        
        if (randomImage && randomPortrait) {
          d3.select(randomImage)
            .transition()
            .duration(250)
            .attr("transform", "scaleY(0)")
            .on("end", () => {
              d3.select(randomImage).attr("href", randomPortrait.thumb);
              d3.select(randomImage)
                .transition()
                .duration(250)
                .attr("transform", "scaleY(1)");
            });
        }
      }, adjustedInterval); // Adjusted interval based on grid size
    }, 2000);
    
  }).catch(error => {
    console.error("Error loading portraits:", error);
  });
}

// Load portraits initially (skip in dev mode)
if (!DEV_MODE) {
  loadPortraits();
  
  // Add resize handler
  window.addEventListener('resize', () => {
    calculateDimensions();
    createSVG();
    drawGrid();
    loadPortraits(); // Reload portraits on resize
  });
} else {
  // In dev mode, skip flip clocks and go straight to timeline
  calculateDimensions();
  createSVG();
  console.log("DEV MODE: Going straight to timeline...");
  setTimeout(() => {
    transitionToTimeline();
  }, 100);
}

// Create explore overlay
function createExploreOverlay() {
  const overlay = svg.append("g")
    .attr("class", "explore-overlay")
    .style("cursor", "pointer")
    .style("opacity", 0); // Start invisible for smooth fade-in
  
  // Central explore box with modern glass-like design
  const boxWidth = 520;
  const boxHeight = 220;
  const boxX = (W - boxWidth) / 2;
  const boxY = (H - boxHeight) / 2;
  
  const exploreBox = overlay.append("g")
    .attr("class", "explore-box")
    .attr("transform", `translate(${boxX}, ${boxY})`);
  
  // Modern glass-like background with backdrop blur effect
  exploreBox.append("rect")
    .attr("width", boxWidth)
    .attr("height", boxHeight)
    .attr("fill", "rgba(255, 255, 255, 0.85)")
    .attr("stroke", "rgba(255, 255, 255, 0.3)")
    .attr("stroke-width", 0.5)
    .attr("rx", 16)
    .style("backdrop-filter", "blur(20px)")
    .style("filter", "drop-shadow(0 8px 32px rgba(0,0,0,0.12))");
  
  // Title - larger and more prominent
  exploreBox.append("text")
    .attr("x", boxWidth / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("fill", "#2a2a2a")
    .attr("font-family", "system-ui, -apple-system, sans-serif")
    .attr("font-size", "26px")
    .attr("font-weight", "600")
    .attr("letter-spacing", "0.3px")
    .text("Face to Face");
  
  // Main description text - larger and more readable
  const textLines = [
    "Get up close and personal with the faces of the American Revolution.",
    "Powered by data from the Smithsonian National Portrait Gallery.",
    "Click below to start exploring."
  ];
  
  exploreBox.selectAll(".explore-text")
    .data(textLines)
    .enter()
    .append("text")
    .attr("class", "explore-text")
    .attr("x", boxWidth / 2)
    .attr("y", (d, i) => 85 + (i * 21))
    .attr("text-anchor", "middle")
    .attr("fill", "#555")
    .attr("font-family", "system-ui, -apple-system, sans-serif")
    .attr("font-size", "15px")
    .attr("font-weight", "400")
    .attr("line-height", "1.4")
    .text(d => d);
  
  // Larger, more prominent button
  const buttonGroup = createButton(exploreBox, "Explore", boxWidth/2 - 70, 155, 140, 36, function() {
    startExploreExperience();
  });
  
  // Style the Explore button with dark background and white text
  buttonGroup.select("rect")
    .attr("fill", "#2a2a2a")
    .attr("stroke", "none");
  buttonGroup.select("text")
    .attr("fill", "white");
  
  // Remove hover effect for the dark Explore button
  buttonGroup
    .on("mouseenter", null)
    .on("mouseleave", null);
  
  // Smooth fade-in animation to match the elegance of portrait loading
  overlay
    .transition()
    .duration(1200) // Smooth 1.2 second fade-in
    .ease(d3.easeQuadOut)
    .style("opacity", 1);
  
  // Fade in button with overlay
  buttonGroup
    .transition()
    .duration(1200)
    .ease(d3.easeQuadOut)
    .style("opacity", 1);
}

async function startExploreExperience() {
  
  // Stop all ongoing flip animations and intervals
  svg.selectAll("*").interrupt(); // Stop any ongoing D3 transitions
  
  // Clear any remaining intervals (the random flipping)
  if (window.flipInterval) {
    clearInterval(window.flipInterval);
    window.flipInterval = null;
  }
  
  // Clear any existing timeouts from previous explore attempts
  if (window.exploreTimeouts) {
    window.exploreTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  }
  window.exploreTimeouts = [];
  
  // Remove overlay
  svg.select(".explore-overlay")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .on("end", () => {
      svg.select(".explore-overlay").remove();
    });
  
  // Get all images and shuffle them for random order
  const images = svg.selectAll("image.portrait").nodes();
  const shuffledImages = d3.shuffle([...images]);
  
  console.log("Flipping", shuffledImages.length, "images to black in random order");
  
  // Flip images to black one by one in random order using promises
  const flipPromises = shuffledImages.map((imageNode, i) => {
    return delay(i * 80).then(() => {
      // Check if we're still in explore mode (not transitioned yet)
      if (!window.transitionedToTimeline) {
        const image = d3.select(imageNode);
        const x = +image.attr("x");
        const y = +image.attr("y");
        const width = +image.attr("width");
        const height = +image.attr("height");
        
        // Create the black rectangle first (hidden)
        const blackRect = svg.append("rect")
          .attr("x", x)
          .attr("y", y)
          .attr("width", width)
          .attr("height", height)
          .attr("fill", "#0a0a0a") // Use consistent dark background color
          .attr("transform", `translate(${width/2}, ${height/2}) scaleY(0) translate(${-width/2}, ${-height/2})`)
          .style("transform-origin", "center");
        
        // Flip animation: image scales down to 0, then black rect scales up
        image
          .transition()
          .duration(200)
          .attr("transform", `translate(${width/2}, ${height/2}) scaleY(0) translate(${-width/2}, ${-height/2})`)
          .style("transform-origin", "center")
          .on("end", () => {
            // Only continue if we haven't transitioned yet
            if (!window.transitionedToTimeline) {
              // Remove the image completely
              image.remove();
              
              // Flip the black rectangle into view
              blackRect
                .transition()
                .duration(200)
                .attr("transform", `translate(${width/2}, ${height/2}) scaleY(1) translate(${-width/2}, ${-height/2})`);
            }
          });
      }
    });
  });
  
  // Wait for all flips to complete, then transition to timeline
  await Promise.all(flipPromises);
  await delay(800); // Moderate pause after flips
  transitionToTimeline();
}

function transitionToTimeline() {
  
  // Mark that we've transitioned to prevent further flip animations
  window.transitionedToTimeline = true;
  
  // Clear all remaining timeouts
  if (window.exploreTimeouts) {
    window.exploreTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    window.exploreTimeouts = [];
  }
  
  // Stop any remaining animations
  svg.selectAll("*").interrupt();
  
  // Clear all black rectangles
  svg.selectAll("rect").remove();
  
  // Set up timeline dimensions with responsive margins that scale with window size
  const margin = {
    top: Math.max(150, H * 0.15),    // 15% of height, minimum 150px
    right: Math.max(120, W * 0.08),   // 8% of width, minimum 120px
    bottom: Math.max(150, H * 0.15),  // 15% of height, minimum 150px
    left: Math.max(120, W * 0.08)     // 8% of width, minimum 120px
  };
  const timelineWidth = W - margin.left - margin.right;
  const timelineHeight = H - margin.top - margin.bottom;
  
  // Make timeline dimensions globally accessible for categorical transition
  const lineSpacing = Math.max(18, Math.min(21, timelineWidth / 40));
  const maxTextWidth = timelineWidth * 0.8;
  const charWidth = Math.min(16, timelineWidth / 50) * 0.6;
  window.timelineConfig = { margin, timelineWidth, timelineHeight, lineSpacing, maxTextWidth, charWidth };
  
  // Create timeline container
  const timelineGroup = svg.append("g")
    .attr("class", "timeline-view")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .style("opacity", 0);
  
  // Load portrait data for timeline
  d3.csv("data/portraits_v1.csv").then(data => {
    const parseYear = (d) => {
      // Enhanced parsing to handle various date formats
      const dateStr = d.date || "";
      
      // First try to find a 4-digit year (handles most cases including "ca. 1805", ranges, etc.)
      let m = /\b(1[6-9]\d{2}|20\d{2})\b/.exec(dateStr);
      if (m) return +m[1];
      
      // Handle decade patterns like "1790s", "1770s"
      m = /\b(1[6-9]\d)0s\b/.exec(dateStr);
      if (m) return parseInt(m[1] + "5"); // Use middle of decade (e.g., 179 -> 1795)
      
      // Handle "early/late" patterns
      if (/early 19th century/.test(dateStr)) return 1805; // Early 1800s
      if (/late 18th century/.test(dateStr)) return 1785;  // Late 1700s
      if (/early 1790s/.test(dateStr)) return 1792;        // Early 1790s
      
      return null;
    };
    
    const timelineData = data.map(d => ({
      title: d.title,
      artist: d.artist,
      sitter: d.sitter,
      size: d.size, // Include size for categorical grouping
      gender: d["sitter gender"], // Include gender for categorical grouping
      year: parseYear(d),
      thumb: d.thumbnail || ""
    })).filter(d => d.year && d.year >= 1770 && d.year <= 1872);
    
    console.log("=== TIMELINE FILTERING ===");
    console.log("Timeline data (1770-1872 with extractable year):", timelineData.length, "portraits");
    
    // Get actual date range from the data to eliminate dead space
    const years = timelineData.map(d => d.year);
    const minYear = d3.min(years);
    const maxYear = d3.max(years);
    
    console.log("Actual date range:", minYear, "to", maxYear);
    
    // Create scales using actual data range
    const xScale = d3.scaleLinear()
      .domain([minYear, maxYear])
      .range([0, timelineWidth]);
    
    // Group by year and stack
    const groupedByYear = d3.group(timelineData, d => d.year);
    const stackedData = [];
    
    groupedByYear.forEach((portraits, year) => {
      portraits.forEach((portrait, index) => {
        stackedData.push({
          ...portrait,
          stackIndex: index,
          totalInYear: portraits.length
        });
      });
    });
    
    const maxStack = d3.max(stackedData, d => d.totalInYear);
    const dotRadius = 4; // Reduced from 7 to 4 for proper spacing
    
    // RESPONSIVE SPACING: Scale dot spacing with window height for consistent density at any size
    const fixedDotSpacing = Math.max(10, Math.min(20, H * 0.012)); // 1.2% of height, between 10-20px
    
    // Store fixed spacing globally for categorical view to use
    window.fixedDotSpacing = fixedDotSpacing;
    
    // Instead of a scale, use fixed pixel spacing for consistent density
    // X-axis is at timelineHeight + 10, dots stack upward from there
    // stackIndex is already adjusted (+1) when called
    const xAxisOffset = Math.max(20, H * 0.025); // Responsive offset: 2.5% of height, minimum 20px
    const getYPosition = (stackIndex) => {
      // Stack upward: subtract from x-axis position
      return (timelineHeight + 10) - xAxisOffset - ((stackIndex - 1) * fixedDotSpacing);
    };
    
    // Add title - positioned dynamically based on margin size
    const titleText = timelineGroup.append("text")
      .attr("class", "timeline-title")
      .attr("x", timelineWidth / 2)
      .attr("y", -margin.top * 0.45) // Position at 45% up into the top margin (more centered)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-family", "system-ui, -apple-system, sans-serif")
      .attr("font-size", "26px") // Changed from responsive to match "Face to Face" exactly
      .attr("font-weight", "700") // Bold for better prominence
      .attr("letter-spacing", "0.5px")
      .style("opacity", 0) // Start invisible
      .text("The Making of an American Face");

    // Add explanatory text - positioned within the scatterplot area, starts invisible
    const explanationText = [
      "Each dot marks a portrait made during or just after the Revolution. Loose dates were pinned down to maintain chronological consistency.",
      "Together, these points chart fluctuations in portrait production of a young nation trying to find its face."
    ].join(" ");

    // Wrap text to fit within reasonable width (80% of timeline width)
    const maxTextWidth = window.timelineConfig.maxTextWidth;
    const wrappedLines = wrapText(explanationText, maxTextWidth, window.timelineConfig.charWidth);

    const explanationTexts = wrappedLines.map((line, i) => {
      return timelineGroup.append("text")
        .attr("class", "timeline-explanation")
        .attr("x", timelineWidth / 2)
        .attr("y", -margin.top * 0.25 + (i * window.timelineConfig.lineSpacing)) // Position at 25% up into the top margin (more centered)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-family", "system-ui, -apple-system, sans-serif")
        .attr("font-size", Math.max(12, Math.min(16, timelineWidth / 35)) + "px") // Better responsive range
        .attr("font-weight", "300")
        .style("opacity", 0) // Start invisible
        .text(line);
    });
    
    // Add x-axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format("d"))
      .ticks(10);
    
    timelineGroup.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${timelineHeight + 10})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "white")
      .attr("font-family", "system-ui, -apple-system, sans-serif")
      .attr("font-size", "14px") // Increased from default ~10px
      .attr("font-weight", "400"); // Slightly bolder for better readability
    
    timelineGroup.selectAll(".x-axis path, .x-axis line")
      .attr("stroke", "white")
      .attr("stroke-width", 1);
    
    // Add dots
    const dots = timelineGroup.selectAll(".portrait-dot")
      .data(stackedData)
      .enter()
      .append("circle")
      .attr("class", "portrait-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => getYPosition(d.stackIndex + 1))
      .attr("r", dotRadius)
      .attr("fill", "white")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5)
      .style("opacity", 0)
      .style("cursor", "pointer");
    
    // Add hover effects
    dots
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", dotRadius * 1.4) // Adjusted hover size relative to new radius
          .attr("fill", "#f0f0f0"); // Light gray on hover
        
        // Show tooltip
        const tooltip = timelineGroup.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.year)}, ${getYPosition(d.stackIndex + 1) - 15})`);
        
        const tooltipBg = tooltip.append("rect")
          .attr("x", -75)
          .attr("y", -30)
          .attr("width", 150)
          .attr("height", 25)
          .attr("fill", "rgba(0, 0, 0, 0.9)")
          .attr("rx", 4);
        
        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -12)
          .attr("fill", "white")
          .attr("font-family", "system-ui, -apple-system, sans-serif")
          .attr("font-size", "13px")
          .text(`${d.year} • ${d.sitter || d.title}`);
      })
      .on("mouseleave", function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", dotRadius)
          .attr("fill", "white"); // White fill to match overall theme
        
        timelineGroup.select(".tooltip").remove();
      });
    
    // Animate timeline in with a quicker, more seamless transition
    timelineGroup
      .transition()
      .delay(200) // Reduced from 500ms to 200ms for shorter black screen
      .duration(1000) // More moderate fade in
      .style("opacity", 1);
    
    // Animate dots in with more staggered timing
    dots
      .transition()
      .delay((d, i) => 800 + (i * 12)) // Start sooner, moderate stagger
      .duration(500) // Back to original duration
      .style("opacity", 1);
    
    // Smooth fade-in for title and text after dots start appearing
    titleText
      .transition()
      .delay(1200) // Start after dots have begun appearing
      .duration(800)
      .ease(d3.easeQuadOut)
      .style("opacity", 1);
    
    explanationTexts.forEach((text, i) => {
      text
        .transition()
        .delay(1400 + (i * 200)) // Staggered appearance for each line
        .duration(800)
        .ease(d3.easeQuadOut)
        .style("opacity", 0.9);
    });
    
  }).catch(error => {
    console.error("Error loading timeline data:", error);
  });
  
  // Add the highlight-1795 step after timeline loads
  setTimeout(() => {
    setTimeout(() => {
      highlightKeyDate1795Step();
    }, 1200); // Quicker delay for better responsiveness
  }, 3000); // Wait for timeline animation to complete
// Highlight 1795 and its dots, dim others, and add 'Explore Key Dates' button
function highlightKeyDate1795Step() {
  const timelineGroup = svg.select(".timeline-view");
  if (timelineGroup.empty()) return;

  // Find all dots and x-axis labels
  const dots = timelineGroup.selectAll(".portrait-dot");
  const xAxisTicks = timelineGroup.selectAll(".x-axis .tick text");


  // On initial load, do NOT highlight 1795. All dots and labels are normal.

  // Add the 'Explore Key Dates' button below the explanation
  // Find the last explanation text to position the button
  const explanationNodes = timelineGroup.selectAll(".timeline-explanation").nodes();
  let lastY = 0;
  if (explanationNodes.length > 0) {
    const last = d3.select(explanationNodes[explanationNodes.length - 1]);
    lastY = +last.attr("y") || 0;
  }
  // Resize button to fit 'Spike of 1795' naturally
  const buttonPadding = 36; // 18px left/right padding
  const buttonText = "Spike of 1795";
  const approxCharWidth = 9.5; // px, for system-ui 15px font
  const buttonWidth = Math.round(buttonText.length * approxCharWidth + buttonPadding);
  const buttonHeight = 36;
  const timelineWidth = window.timelineConfig.timelineWidth;
  const buttonX = (timelineWidth - buttonWidth) / 2;
  const buttonY = lastY + 32;

  // Remove any existing key dates button first
  timelineGroup.select(".keydates-button").remove();

  const buttonGroup = createButton(timelineGroup, buttonText, buttonX, buttonY, buttonWidth, buttonHeight, function() {
    // Hide the timeline title and all explanatory texts (including 1795 explanation)
    timelineGroup.selectAll(".timeline-title, .timeline-explanation").transition().duration(400).style("opacity", 0).on("end", function() { d3.select(this).remove(); });

      // On click, animate 1795 dots/label to orange, others dimmed
      dots.each(function(d) {
        const is1795 = d.year === 1795;
        d3.select(this)
          .transition()
          .duration(700)
          .ease(d3.easeQuadOut)
          .attr("fill", is1795 ? "#b8956a" : "#ffffff")
          .attr("stroke", is1795 ? "#b8956a" : "#ccc")
          .style("opacity", is1795 ? 1 : 0.18);
      });

      // Add Washington portrait during spike sequence
      const portraitSize = 120;
      const portraitX = window.timelineConfig.timelineWidth - portraitSize - 20;
      const portraitY = 20;
      
      const washingtonPortrait = timelineGroup.append("g")
        .attr("class", "washington-portrait")
        .attr("transform", `translate(${portraitX}, ${portraitY})`)
        .style("opacity", 0);

      // Add circular clipping path for the portrait
      const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
      defs.append("clipPath")
        .attr("id", "washington-clip")
        .append("circle")
        .attr("cx", portraitSize / 2)
        .attr("cy", portraitSize / 2)
        .attr("r", portraitSize / 2);

      // Add portrait background circle
      washingtonPortrait.append("circle")
        .attr("cx", portraitSize / 2)
        .attr("cy", portraitSize / 2)
        .attr("r", portraitSize / 2)
        .attr("fill", "#b8956a")
        .attr("stroke", "#b8956a")
        .attr("stroke-width", 2);

      // Add portrait image
      washingtonPortrait.append("image")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", portraitSize)
        .attr("height", portraitSize)
        .attr("clip-path", "url(#washington-clip)")
        .attr("href", "https://ids.si.edu/ids/deliveryService?id=NPG-NPG_2001_13_ext");

      // Animate portrait in
      washingtonPortrait
        .transition()
        .delay(200)
        .duration(800)
        .ease(d3.easeQuadOut)
        .style("opacity", 1);
      xAxisTicks.each(function() {
        const text = d3.select(this).text();
        if (text === "1795") {
          d3.select(this)
            .transition()
            .duration(700)
            .ease(d3.easeQuadOut)
            .attr("fill", "#b8956a");
        } else {
          d3.select(this)
            .transition()
            .duration(700)
            .ease(d3.easeQuadOut)
            .attr("fill", "#ffffff");
        }
      });

      // After highlight, update hover behavior so 1795 dots do not change color or border
      dots.on("mouseenter", function(event, d) {
        const is1795 = d.year === 1795;
        if (is1795) {
          // Do nothing: keep fill and stroke as muted orange
          return;
        }
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 4 * 1.4)
          .attr("fill", "#f0f0f0");

        // Show tooltip
        const timelineGroup = svg.select(".timeline-view");
        const xScale = d3.scaleLinear()
          .domain(d3.extent(window.categoricalData ? window.categoricalData.map(dd => dd.data.year) : [1770,1872]))
          .range([0, window.timelineConfig.timelineWidth]);
        const getYPosition = (stackIndex) => {
          const timelineHeight = window.timelineConfig.timelineHeight;
          const xAxisOffset = Math.max(20, window.innerHeight * 0.025);
          const fixedDotSpacing = window.fixedDotSpacing || 15;
          return (timelineHeight + 10) - xAxisOffset - ((stackIndex - 1) * fixedDotSpacing);
        };
        const tooltip = timelineGroup.append("g")
          .attr("class", "tooltip")
          .attr("transform", `translate(${xScale(d.year)}, ${getYPosition(d.stackIndex + 1) - 15})`);
        tooltip.append("rect")
          .attr("x", -75)
          .attr("y", -30)
          .attr("width", 150)
          .attr("height", 25)
          .attr("fill", "rgba(0, 0, 0, 0.9)")
          .attr("rx", 4);
        tooltip.append("text")
          .attr("text-anchor", "middle")
          .attr("y", -12)
          .attr("fill", "white")
          .attr("font-family", "system-ui, -apple-system, sans-serif")
          .attr("font-size", "13px")
          .text(`${d.year} • ${d.sitter || d.title}`);
      })
      .on("mouseleave", function(event, d) {
        const is1795 = d.year === 1795;
        if (is1795) {
          // Do nothing: keep fill and stroke as muted orange
          return;
        }
        d3.select(this)
          .transition()
          .duration(150)
          .attr("r", 4)
          .attr("fill", "white");
        svg.select(".timeline-view").select(".tooltip").remove();
      });

      // Add the 1795 explanatory text in the same style as other explanatory texts
      // Remove any previous 1795 explanation if present
      timelineGroup.selectAll(".explanation-1795").remove();


      // Position the Stuart (1795) explanatory text in the same place as the initial explanatory text
      const margin = window.timelineConfig.margin;
      const timelineWidth = window.timelineConfig.timelineWidth;
      const lineSpacing = window.timelineConfig.lineSpacing;
      const startY = -margin.top * 0.25; // Same as initial explanation

      const explanation1795 = "1795 was the year America sat for its portrait. Painter Gilbert Stuart shows up in Philadelphia and suddenly every Revolutionary hero wants their face on a canvas. His George Washington portrait becomes the reference image, getting practically Xeroxed across the new republic.";

      // Wrap text to fit within reasonable width (80% of timeline width)
      const maxTextWidth = window.timelineConfig.maxTextWidth;
      const wrappedLines = wrapText(explanation1795, maxTextWidth, window.timelineConfig.charWidth);

      timelineGroup.selectAll(".explanation-1795")
        .data(wrappedLines)
        .enter()
        .append("text")
        .attr("class", "timeline-explanation explanation-1795")
        .attr("x", timelineWidth / 2)
        .attr("y", (d, i) => startY + (i * lineSpacing))
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-family", "system-ui, -apple-system, sans-serif")
        .attr("font-size", Math.max(12, Math.min(16, timelineWidth / 35)) + "px")
        .attr("font-weight", "300")
        .style("opacity", 0)
        .text(d => d)
        .transition()
        .delay((d, i) => 400 + (i * 200))
        .duration(800)
        .ease(d3.easeQuadOut)
        .style("opacity", 0.9);

      // Fade out button after highlight and after text appears, then show breakdown
      // Add more lag after text fade-in before showing See Breakdown button
      const extraLag = 400; // additional lag in ms
      d3.select(this)
        .transition()
        .duration(500)
        .style("opacity", 0)
        .on("end", () => {
          d3.select(this).remove();
          setTimeout(() => {
            createSeeBreakdownButton();
          }, 800); // 400ms original + 400ms extra lag
        });
    });

  buttonGroup.attr("class", "button keydates-button");

  // Fade in button
  buttonGroup
    .transition()
    .duration(1200)
    .ease(d3.easeQuadOut)
    .style("opacity", 1);
}
}

// Add overlay after portraits load (skip in dev mode)
if (!DEV_MODE) {
  setTimeout(() => {
    createExploreOverlay();
  }, 1000); // Show overlay after portraits have loaded
} else {
  // In dev mode, skip the explore overlay - timeline will load directly
  console.log("DEV MODE: Skipping flip clock experience...");
}

// Parse year from date string
const parseYear = (d) => {
  const dateStr = d.date || "";
  let m = /\b(1[6-9]\d{2}|20\d{2})\b/.exec(dateStr);
  if (m) return +m[1];
  m = /\b(1[6-9]\d)0s\b/.exec(dateStr);
  if (m) return parseInt(m[1] + "5");
  if (/early 19th century/.test(dateStr)) return 1805;
  if (/late 18th century/.test(dateStr)) return 1785;
  if (/early 1790s/.test(dateStr)) return 1792;
  return null;
};

// Create "See Breakdown" button - same style as Explore button
function createSeeBreakdownButton() {
  const timelineGroup = svg.select(".timeline-view");
  if (timelineGroup.empty()) return;
  
  // Calculate position below the explanatory text (which is now positioned higher)
  const buttonWidth = 140;
  const buttonHeight = 36;
  const buttonX = (window.timelineConfig.timelineWidth - buttonWidth) / 2;
  
  // Position based on where the explanatory text ends (positioned dynamically)
  const margin = window.timelineConfig.margin;
  const explanationStartY = -margin.top * 0.25; // Matches the dynamic position
  const lineSpacing = window.timelineConfig.lineSpacing;
  
  // Count lines in the explanatory text to determine where it ends
  const explanationText = [
    "Each dot marks a portrait made during or just after the Revolution. Loose dates were pinned down to maintain chronological consistency.",
    "Together, these points chart fluctuations in portrait production of a young nation trying to find its face."
  ].join(" ");
  
  const maxTextWidth = window.timelineConfig.maxTextWidth;
  const lines = wrapText(explanationText, maxTextWidth, window.timelineConfig.charWidth);
  
  // Position button with spacing below text (closer to text)
  const textEndY = explanationStartY + (lines.length * lineSpacing);
  const spacing = 6; // Further reduced spacing to bring button even closer to text
  const buttonY = textEndY + spacing;
  
  // Remove any existing breakdown button first
  timelineGroup.select(".breakdown-button").remove();
  
  const buttonGroup = createButton(timelineGroup, "See Breakdown", buttonX, buttonY, buttonWidth, buttonHeight, function() {
    startSeeBreakdownExperience();
  })
    .attr("class", "breakdown-button");
  
  // Smooth fade-in animation - same timing as Explore button
  buttonGroup
    .transition()
    .duration(1200)
    .ease(d3.easeQuadOut)
    .style("opacity", 1);
}

// Start the breakdown visualization experience
async function startSeeBreakdownExperience() {
  
  const timelineGroup = svg.select(".timeline-view");
  
  // Hide the breakdown button
  timelineGroup.select(".breakdown-button")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .on("end", () => {
      timelineGroup.select(".breakdown-button").remove();
    });

  // Remove Washington portrait if it exists
  timelineGroup.select(".washington-portrait")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this).remove();
    });

  // Reset all dots and x-axis labels to normal (white fill, white label, normal opacity and stroke)
  timelineGroup.selectAll(".portrait-dot")
    .transition()
    .duration(500)
    .attr("fill", "#ffffff")
    .attr("stroke", "#ccc")
    .style("opacity", 1);
  timelineGroup.selectAll(".x-axis .tick text")
    .transition()
    .duration(500)
    .attr("fill", "#ffffff");

  // Fade out and remove the title
  timelineGroup.select(".timeline-title")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this).remove();
    });

  // Fade out and remove the explanatory text
  timelineGroup.selectAll(".timeline-explanation")
    .transition()
    .duration(500)
    .style("opacity", 0)
    .on("end", function() {
      d3.select(this).remove();
    });

  // Start the categorical transition after a delay
  await delay(300);
  transitionToCategoricalBreakdown();
}

// Transition to categorical breakdown visualization  
async function transitionToCategoricalBreakdown() {
  
  const timelineGroup = svg.select(".timeline-view");
  if (timelineGroup.empty()) {
    console.error("Timeline group not found!");
    return;
  }
  
  if (!window.timelineConfig) {
    console.error("Timeline config not found!");
    return;
  }
  
  const { margin, timelineWidth, timelineHeight } = window.timelineConfig;
  
  // Animation parameters - move timeline up moderately to make space below
  const moveUpDistance = 60; // Moderate move to keep scatterplot visible
  const transitionDuration = 800;
  
  // 1. Move timeline and x-axis upward smoothly
  timelineGroup
    .transition()
    .duration(transitionDuration)
    .ease(d3.easeQuadOut)
    .attr("transform", `translate(${margin.left}, ${margin.top - moveUpDistance})`);
  
  // 2. Create dropdown menu positioned where See Breakdown button was
  await delay(transitionDuration / 2);
  createCategoryDropdown(timelineGroup, timelineWidth, timelineHeight, moveUpDistance);
  
  // 3. Store current data for categorical grouping
  const dots = timelineGroup.selectAll(".portrait-dot");
  const dotsData = [];
  
  dots.each(function(d) {
    dotsData.push({
      element: this,
      data: d,
      year: d.year,
      originalCx: d3.select(this).attr("cx"),
      originalCy: d3.select(this).attr("cy"),
      currentCx: d3.select(this).attr("cx"),
      currentCy: d3.select(this).attr("cy")
    });
  });
  
  // Store for later use
  window.categoricalData = dotsData;
}

// Create category selection dropdown - centered to match explanatory text
function createCategoryDropdown(timelineGroup, timelineWidth, timelineHeight, moveUpDistance) {
  // Calculate responsive margins once for the entire function
  const categoryMargin = {
    top: Math.max(250, window.innerHeight * 0.2),
    right: Math.max(200, window.innerWidth * 0.12),
    bottom: Math.max(250, window.innerHeight * 0.2),
    left: Math.max(200, window.innerWidth * 0.12)
  };
  const categoryViewHeight = window.innerHeight - categoryMargin.top - categoryMargin.bottom;
  
  // Position elements
  const textStartY = categoryViewHeight * 0.05; // Explanatory text at top
  const lineSpacing = window.timelineConfig.lineSpacing;
  
  // Helper function to calculate dropdown Y position based on text lines
  const calculateDropdownY = (numLines = 1) => {
    const textHeight = textStartY + (numLines * lineSpacing);
    const spacing = 4; // Further reduced spacing for closer positioning
    return textHeight + spacing;
  };
  
  // Create dropdown container - centered to match explanatory text
  const dropdownWidth = 200;
  const dropdownX = (timelineWidth - dropdownWidth) / 2; // Center horizontally
  const dropdownGroup = timelineGroup.append("g")
    .attr("class", "category-dropdown")
    .attr("transform", `translate(${dropdownX}, ${calculateDropdownY(1)})`) // Initial position for 1-line text
    .style("opacity", 0);
  
  // Store the helper function for later use
  window.calculateDropdownY = calculateDropdownY;
  window.dropdownGroupRef = dropdownGroup;
  window.dropdownX = dropdownX;
  
  // Category options with explanatory text
  const categories = [
    { 
      key: "size", 
      label: "Size", 
      getValue: (d) => d.size || "Unknown",
      explanation: "In early America, size was status. Miniatures lived in pockets and lockets, meant to be held, not seen. Full-size portraits hung in parlors and state rooms, built for public memory."
    },
    { 
      key: "artist", 
      label: "Artist", 
      getValue: (d) => d.artist && d.artist.trim() ? "Known" : "Unknown",
      explanation: "As Jay-Z put it, “I'm not a businessman, I'm a business, man.” The known artists stamped themselves into history, preserving their face and signature. The unknown ones didn't get as lucky."
    },
    { 
      key: "sitter", 
      label: "Sitter", 
      getValue: (d) => d.sitter && d.sitter.trim() ? "Named" : "Unnamed",
      explanation: "Some names were recorded because they mattered. When the sitter is unnamed, it says just as much: someone paid for the portrait, but not enough value was placed on the person's name to preserve it."
    },
    { 
      key: "gender", 
      label: "Sitter's Gender", 
      getValue: (d) => {
        const gender = (d.gender || "").toLowerCase().trim();
        if (gender === "male") return "Male";
        if (gender === "female") return "Female";
        return null; // Filter out unknown genders
      },
      explanation: "The ratio skews male. That tells you less about population and more about who portrait culture considered worth recording. Unless you were the wife of a man who mattered, of course."
    }
  ];
  
  // Create dropdown background - inverted colors matching See Breakdown button
  const dropdownBg = dropdownGroup.append("rect")
    .attr("width", 200)
    .attr("height", 36)
    .attr("fill", "rgba(255, 255, 255, 0.9)")
    .attr("stroke", "none")
    .attr("rx", 18);
  
  // Create dropdown text - inverted colors
  const dropdownText = dropdownGroup.append("text")
    .attr("x", 100)
    .attr("y", 23)
    .attr("text-anchor", "middle")
    .attr("fill", "#2a2a2a")
    .attr("font-family", "system-ui, -apple-system, sans-serif")
    .attr("font-size", "15px")
    .attr("font-weight", "500")
    .style("cursor", "pointer")
    .text("Choose Category ↓");
  
  // Create dropdown options (initially hidden) - centered to match dropdown button
  const optionsGroup = timelineGroup.append("g")
    .attr("class", "dropdown-options")
    .attr("transform", `translate(${dropdownX}, ${calculateDropdownY(1) + 42})`) // Position below button
    .style("opacity", 0)
    .style("display", "none");
  
  // Store reference for repositioning
  window.optionsGroupRef = optionsGroup;
  
  // Add a background container for all options with rounded corners
  const optionsBackground = optionsGroup.append("rect")
    .attr("width", 200)
    .attr("height", categories.length * 40)
    .attr("fill", "rgba(255, 255, 255, 0.95)")
    .attr("stroke", "none")
    .attr("rx", 18);
  
  categories.forEach((category, i) => {
    const optionGroup = optionsGroup.append("g")
      .attr("class", "dropdown-option")
      .attr("transform", `translate(0, ${i * 40})`)
      .style("cursor", "pointer");
    
    // Individual option highlight (invisible by default, shows on hover)
    optionGroup.append("rect")
      .attr("width", 200)
      .attr("height", 40)
      .attr("fill", "transparent")
      .attr("rx", i === 0 ? 18 : (i === categories.length - 1 ? 18 : 0));
    
    optionGroup.append("text")
      .attr("x", 100)
      .attr("y", 25)
      .attr("text-anchor", "middle")
      .attr("fill", "#2a2a2a")
      .attr("font-family", "system-ui, -apple-system, sans-serif")
      .attr("font-size", "14px")
      .attr("font-weight", "400")
      .text(category.label);
    
    // Click handler for category selection
    optionGroup.on("click", function(event) {
      event.stopPropagation(); // Prevent dropdown toggle from firing
      selectCategory(category, dropdownText, optionsGroup);
    });
    
    // Hover effects
    optionGroup
      .on("mouseenter", function() {
        d3.select(this).select("rect").attr("fill", "rgba(230, 230, 230, 0.8)");
      })
      .on("mouseleave", function() {
        d3.select(this).select("rect").attr("fill", "transparent");
      });
  });
  
  // Add hover effect to dropdown button
  dropdownGroup
    .on("mouseenter", function() {
      d3.select(this).select("rect")
        .transition()
        .duration(200)
        .attr("fill", "rgba(255, 255, 255, 1)");
    })
    .on("mouseleave", function() {
      d3.select(this).select("rect")
        .transition()
        .duration(200)
        .attr("fill", "rgba(255, 255, 255, 0.9)");
    });
  
  // Dropdown toggle functionality
  dropdownGroup.style("cursor", "pointer")
    .on("click", function() {
      const isVisible = optionsGroup.style("display") !== "none";
      
      if (isVisible) {
        // Hide options
        optionsGroup
          .transition()
          .duration(200)
          .style("opacity", 0)
          .on("end", () => optionsGroup.style("display", "none"));
        
        // Update text - if it contains ↑, replace with ↓
        const currentText = dropdownText.text();
        dropdownText.text(currentText.replace(" ↑", " ↓"));
      } else {
        // Show options
        optionsGroup.style("display", "block")
        .style("opacity", 0)
        .transition()
        .duration(200)
        .style("opacity", 1);
        
        // Update text - if it contains ↓, replace with ↑
        const currentText = dropdownText.text();
        dropdownText.text(currentText.replace(" ↓", " ↑"));
      }
    });
  
  // Add initial explanatory text at the top (using variables calculated at function start)
  const initialExplanation = "Flip the dropdown. The data will realign.";
  
  const initialExplanationText = timelineGroup.append("text")
    .attr("class", "category-explanation")
    .attr("x", timelineWidth / 2)
    .attr("y", textStartY)
    .attr("text-anchor", "middle")
    .attr("fill", "white")
    .attr("font-family", "system-ui, -apple-system, sans-serif")
    .attr("font-size", Math.max(12, Math.min(16, timelineWidth / 35)) + "px")
    .attr("font-weight", "300")
    .style("opacity", 0)
    .text(initialExplanation);
  
  // Fade in the initial explanation
  initialExplanationText
    .transition()
    .delay(200)
    .duration(800)
    .ease(d3.easeQuadOut)
    .style("opacity", 0.9);
  
  // Fade in dropdown
  dropdownGroup
    .transition()
    .duration(600)
    .ease(d3.easeQuadOut)
    .style("opacity", 1);
}

// Handle category selection and update visualization
function selectCategory(category, dropdownText, optionsGroup) {
  
  // Update dropdown text to show selected category with down arrow (closed state)
  dropdownText.text(category.label + " ↓");
  
  // Hide options dropdown immediately
  optionsGroup.style("display", "none").style("opacity", 0);
  
  // If "None" is selected, reset to timeline view
  if (category.isReset) {
    resetToTimelineView();
  } else {
    // Animate dots into categorical groups
    animateToCategories(category);
  }
}

// Reset dots back to original timeline positions
function resetToTimelineView() {
  const timelineGroup = svg.select(".timeline-view");
  const { timelineWidth, timelineHeight } = window.timelineConfig;
  
  // Show the explanatory text again
  timelineGroup.selectAll(".timeline-explanation")
    .transition()
    .duration(600)
    .style("opacity", 1);
  
  // Remove all category labels and explanation
  timelineGroup.selectAll(".category-label").remove();
  timelineGroup.selectAll(".category-axis-label").remove();
  timelineGroup.selectAll(".category-count-label").remove();
  timelineGroup.selectAll(".category-explanation").remove();
  
  // Move x-axis back to original position
  timelineGroup.select(".x-axis")
    .transition()
    .duration(800)
    .attr("transform", `translate(0, ${timelineHeight + 10})`);
  
  // Reset year labels
  timelineGroup.selectAll(".x-axis .tick text")
    .transition()
    .duration(800)
    .attr("y", 9);
  
  // Move dots back to original timeline positions
  const xScale = d3.scaleLinear()
    .domain(d3.extent(window.categoricalData, d => d.data.year))
    .range([0, timelineWidth]);
  
  window.categoricalData.forEach((dotInfo, index) => {
    const xPosition = xScale(dotInfo.data.year);
    const originalY = timelineHeight * 0.5;
    
    d3.select(dotInfo.element)
      .transition()
      .duration(800)
      .delay(index * 5)
      .ease(d3.easeQuadOut)
      .attr("cx", xPosition)
      .attr("cy", originalY);
  });
}

// Animate dots to categorical positions while keeping original appearance
function animateToCategories(category) {
  const timelineGroup = svg.select(".timeline-view");
  const { timelineWidth, timelineHeight } = window.timelineConfig;
  const margin = window.timelineConfig.margin;
  
  // Remove any existing category explanation
  timelineGroup.selectAll(".category-explanation").remove();
  
  // Calculate responsive margins once (reused throughout function)
  const categoryMargin = {
    top: Math.max(250, window.innerHeight * 0.2),
    right: Math.max(200, window.innerWidth * 0.12),
    bottom: Math.max(250, window.innerHeight * 0.2),
    left: Math.max(200, window.innerWidth * 0.12)
  };
  const categoryViewHeight = window.innerHeight - categoryMargin.top - categoryMargin.bottom;
  
  // Add category-specific explanatory text if available
  if (category.explanation) {
    const maxTextWidth = timelineWidth * 0.7;
    const wrappedLines = wrapText(category.explanation, maxTextWidth, window.timelineConfig.charWidth);
    const textStartY = categoryViewHeight * 0.05; // Position at top (5% down)
    const lineSpacing = window.timelineConfig.lineSpacing;

    const categoryExplanationTexts = wrappedLines.map((line, i) => {
      return timelineGroup.append("text")
        .attr("class", "category-explanation")
        .attr("x", timelineWidth / 2)
        .attr("y", textStartY + (i * lineSpacing))
        .attr("text-anchor", "middle")
  .attr("fill", "#b8956a")
        .attr("font-family", "system-ui, -apple-system, sans-serif")
        .attr("font-size", Math.max(12, Math.min(16, timelineWidth / 35)) + "px")
        .attr("font-weight", "300")
        .style("opacity", 0)
        .text(line);
    });
    
    categoryExplanationTexts.forEach((text, i) => {
      text
        .transition()
        .delay(400 + (i * 200))
        .duration(800)
        .ease(d3.easeQuadOut)
        .style("opacity", 0.9);
    });
    
    // Reposition dropdown based on number of text lines
    if (window.calculateDropdownY && window.dropdownGroupRef) {
      const newDropdownY = window.calculateDropdownY(wrappedLines.length);
      window.dropdownGroupRef
        .transition()
        .duration(400)
        .attr("transform", `translate(${window.dropdownX}, ${newDropdownY})`);
      
      // Also reposition the options group
      if (window.optionsGroupRef) {
        window.optionsGroupRef
          .transition()
          .duration(400)
          .attr("transform", `translate(${window.dropdownX}, ${newDropdownY + 42})`);
      }
    }
  }
  
  // Hide the original explanatory text to avoid overlap
  timelineGroup.selectAll(".timeline-explanation")
    .transition()
    .duration(400)
    .style("opacity", 0);
  
  // Group data by category and year for proper stacking
  const groupedData = {};
  window.categoricalData.forEach(dotInfo => {
    const categoryValue = category.getValue(dotInfo.data);
    const year = dotInfo.data.year;
    
    // Skip if categoryValue is null (filtered out)
    if (categoryValue === null) return;
    
    if (!groupedData[categoryValue]) {
      groupedData[categoryValue] = {};
    }
    if (!groupedData[categoryValue][year]) {
      groupedData[categoryValue][year] = [];
    }
    groupedData[categoryValue][year].push(dotInfo);
  });
  
  const categoryKeys = Object.keys(groupedData);
  
  // Get original dot properties to maintain consistency with initial scatterplot
  const originalDotRadius = parseFloat(timelineGroup.select(".portrait-dot").attr("r")) || 4;
  
  // FIXED STABLE X-AXIS POSITION - positioned lower (60% down) to give more space above
  const newXAxisY = categoryMargin.top + (categoryViewHeight * 0.6);
  
  // Use more vertical space for categories - 80% instead of 70% for more spread
  const totalSpreadHeight = categoryViewHeight * 0.8; // Increased from 70% for less density
  const categorySpacing = totalSpreadHeight / categoryKeys.length; // Divide equally among categories
  
  // Remove existing labels
  timelineGroup.selectAll(".category-label").remove();
  timelineGroup.selectAll(".category-axis-label").remove();
  timelineGroup.selectAll(".category-count-label").remove();
  timelineGroup.selectAll(".category-grid-line").remove();
  
  // Keep the x-axis at centered position for the categorical line
  timelineGroup.select(".x-axis")
    .transition()
    .duration(800)
    .attr("transform", `translate(0, ${newXAxisY})`);
  
  // Calculate maximum stack height below axis to position year labels safely
  let maxStackBelowAxis = 0;
  categoryKeys.forEach(categoryValue => {
    const offset = (categoryKeys.indexOf(categoryValue) - (categoryKeys.length - 1) / 2) * categorySpacing;
    const categoryY = newXAxisY + offset;
    const isAboveAxis = categoryY < newXAxisY;
    
    if (!isAboveAxis) {
      // This category is below the axis, check its max stack height
      const categoryData = groupedData[categoryValue];
      Object.keys(categoryData).forEach(year => {
        maxStackBelowAxis = Math.max(maxStackBelowAxis, categoryData[year].length);
      });
    }
  });
  
  // Position year labels well below the lowest possible dot
  const xAxisOffset = 25; // Same as dot offset
  const fixedSpacing = window.fixedDotSpacing || 15;
  const maxDotExtension = xAxisOffset + (maxStackBelowAxis * fixedSpacing);
  const yearLabelOffset = maxDotExtension + 30; // Extra 30px buffer below lowest dot
  
  timelineGroup.selectAll(".x-axis .tick text")
    .transition()
    .duration(800)
    .attr("y", yearLabelOffset);
  
  // Hide the default tick lines completely - we just want the main axis line
  timelineGroup.selectAll(".x-axis .tick line")
    .transition()
    .duration(800)
    .style("opacity", 0);
  
  // Calculate category positions - spread evenly above and below x-axis with fixed spacing
  categoryKeys.forEach((categoryValue, categoryIndex) => {
    // Position categories radiating from x-axis: index 0 above, index 1 below
    // For 2 categories: one at -categorySpacing/2, one at +categorySpacing/2 from axis
    const offset = (categoryIndex - (categoryKeys.length - 1) / 2) * categorySpacing;
    const categoryY = newXAxisY + offset;
    const isAboveAxis = categoryY < newXAxisY;
    const categoryData = groupedData[categoryValue];
    
    // Add category label - radiating from x-axis origin point with spacing
    const labelText = categoryValue; // No arrows
    
    // Add spacing between labels - offset from x-axis so they don't touch
    // Very generous spacing because labels are rotated and text extends
    const labelSpacing = 120; // Very generous space between the two labels
    const labelOffset = isAboveAxis ? -labelSpacing : labelSpacing;
    const labelX = -15; // Position on left side
    
    timelineGroup.append("text")
      .attr("class", "category-axis-label")
      .attr("x", labelX)
      .attr("y", newXAxisY + labelOffset) // Offset from x-axis for spacing
      .attr("text-anchor", isAboveAxis ? "end" : "start") // Text extends in direction of data
  .attr("fill", "#b8956a")
      .attr("font-family", "system-ui, -apple-system, sans-serif")
      .attr("font-size", Math.max(12, Math.min(16, timelineWidth / 35)) + "px")
      .attr("font-weight", "400")
      .attr("transform", `rotate(-90, ${labelX}, ${newXAxisY + labelOffset})`)
      .style("opacity", 0)
      .text(labelText)
      .transition()
      .duration(500)
      .delay(300)
      .style("opacity", 1);
    
    // Use the same fixed dot spacing as pre-categorized view for identical density
    const fixedSpacing = window.fixedDotSpacing || 10;
    
    // Process each year within this category
    Object.keys(categoryData).forEach(year => {
      const yearDots = categoryData[year];
      const xScale = d3.scaleLinear()
        .domain(d3.extent(window.categoricalData, d => d.data.year))
        .range([0, timelineWidth]);
      
      const xPosition = xScale(+year);
      
      // Stack dots with FIXED SPACING - same density as pre-categorized view
      yearDots.forEach((dotInfo, stackIndex) => {
        let newY;
        const xAxisOffset = 25; // Extra space between x-axis and first dot (matching pre-categorized)
        const offset = xAxisOffset + (stackIndex * fixedSpacing);
        
        if (isAboveAxis) {
          // Stack upward from x-axis with extra offset
          newY = newXAxisY - offset;
        } else {
          // Stack downward from x-axis with extra offset
          newY = newXAxisY + offset;
        }
        
        // Animate dot to new position - keep original appearance
        d3.select(dotInfo.element)
          .transition()
          .duration(800)
          .delay(stackIndex * 15 + categoryIndex * 100)
          .ease(d3.easeQuadOut)
          .attr("cx", xPosition)
          .attr("cy", newY)
          .attr("r", originalDotRadius)
          .attr("fill", "#ffffff")
          .attr("fill-opacity", 1)
          .attr("stroke", "none");
      });
    });
  });
  
}
