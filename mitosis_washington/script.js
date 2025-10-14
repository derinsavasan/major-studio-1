// Circles-to-the-Max (minimal clone) for a single image.
// No libraries. Canvas only.
//
// Inspired by: https://hacks.mozilla.org/2013/01/koalas-to-the-max-a-case-study/
// Vanilla JS reimplementation of the hierarchical quadtree approach.

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false });
let displayW = 0, displayH = 0;

// We'll keep an offscreen canvas at the image's native size for precise color sampling.
const off = document.createElement('canvas');
const offCtx = off.getContext('2d');

const img = new Image();
img.src = 'wash.jpg';
img.onload = () => {
  // Set offscreen to image size, draw it.
  off.width = img.naturalWidth;
  off.height = img.naturalHeight;
  offCtx.drawImage(img, 0, 0, off.width, off.height);

  // Build the hierarchical tree structure
  buildTree();
  resize();
  draw();
};

window.addEventListener('resize', () => {
  resize();
  draw();
});

window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'r') {
    resetTree();
    draw();
  }
});

// Hierarchical tree structure - pre-computed quadtree from finest to coarsest
let layers = []; // array of layers, each layer is a 2D array of circles
let visibleCircles = []; // currently visible circles
let dim = 256; // dimension of finest layer
const MIN_SIZE = 4; // px in image space
let maxSize = 0;
const HOVER_RADIUS = 60;
let lastSplitTime = 0;
const SPLIT_DELAY = 100; // throttle to make animation visible
const GROWTH_DURATION = 300;
let animationFrame = null;
let prevMousePos = null;

function buildTree() {
  layers = [];
  
  // Adjust dim to fit image as a square
  const imgSize = Math.min(off.width, off.height);
  dim = 256;
  
  // Build finest layer (leaf nodes) - sample color from each region
  let size = MIN_SIZE;
  let currentDim = dim;
  let finestLayer = [];
  
  for (let yi = 0; yi < currentDim; yi++) {
    finestLayer[yi] = [];
    for (let xi = 0; xi < currentDim; xi++) {
      const x = xi * size;
      const y = yi * size;
      finestLayer[yi][xi] = {
        x, y, size,
        color: avgColor(x, y, size),
        children: null,
        parent: null,
        splitable: false,
        visible: false,
        progress: 1,
        birthTime: 0
      };
    }
  }
  layers.push(finestLayer);
  
  // Build successive layers by grouping 2x2, averaging colors
  let prevLayer = finestLayer;
  size = MIN_SIZE;
  
  while (currentDim > 1 && size * 2 <= imgSize) {
    currentDim = Math.floor(currentDim / 2);
    size *= 2;
    let layer = [];
    
    for (let yi = 0; yi < currentDim; yi++) {
      layer[yi] = [];
      for (let xi = 0; xi < currentDim; xi++) {
        const c1 = prevLayer[2 * yi]?.[2 * xi];
        const c2 = prevLayer[2 * yi]?.[2 * xi + 1];
        const c3 = prevLayer[2 * yi + 1]?.[2 * xi];
        const c4 = prevLayer[2 * yi + 1]?.[2 * xi + 1];
        
        if (!c1 || !c2 || !c3 || !c4) continue;
        
        const x = xi * size;
        const y = yi * size;
        const circle = {
          x, y, size,
          color: avgColorFromCircles([c1, c2, c3, c4]),
          children: [c1, c2, c3, c4],
          parent: null,
          splitable: true,
          visible: false,
          progress: 1,
          birthTime: 0
        };
        
        c1.parent = c2.parent = c3.parent = c4.parent = circle;
        layer[yi][xi] = circle;
      }
    }
    layers.push(layer);
    prevLayer = layer;
    maxSize = size;
  }
  
  // Start with the root circle visible
  if (layers.length > 0) {
    const rootLayer = layers[layers.length - 1];
    const root = rootLayer[0][0];
    root.visible = true;
    visibleCircles = [root];
  }
}

function resetTree() {
  visibleCircles = [];
  if (layers.length > 0) {
    const rootLayer = layers[layers.length - 1];
    const root = rootLayer[0][0];
    root.visible = true;
    root.progress = 1;
    visibleCircles = [root];
  }
  // Reset all circles
  for (const layer of layers) {
    for (const row of layer) {
      for (const xi in row) {
        const circle = row[xi];
        if (circle !== visibleCircles[0]) {
          circle.visible = false;
          circle.progress = 1;
        }
      }
    }
  }
}

function avgColorFromCircles(circles) {
  let r = 0, g = 0, b = 0;
  for (const c of circles) {
    const match = c.color.match(/\d+/g);
    r += parseInt(match[0]);
    g += parseInt(match[1]);
    b += parseInt(match[2]);
  }
  r = Math.round(r / circles.length);
  g = Math.round(g / circles.length);
  b = Math.round(b / circles.length);
  return `rgb(${r},${g},${b})`;
}

function resize() {
  // Fit the image into the window while preserving aspect
  const ratio = off.width / off.height;
  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const winRatio = winW / winH;

  if (ratio > winRatio) {
    displayW = winW;
    displayH = Math.floor(winW / ratio);
  } else {
    displayH = winH;
    displayW = Math.floor(winH * ratio);
  }
  
  // Handle device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(displayW * dpr));
  canvas.height = Math.max(1, Math.floor(displayH * dpr));
  canvas.style.width = displayW + 'px';
  canvas.style.height = displayH + 'px';

  // Use setTransform instead of scale to avoid cumulative transforms
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Map from display space to image space
function toImageSpace(px, py) {
  const scaleX = off.width / displayW;
  const scaleY = off.height / displayH;
  return [px * scaleX, py * scaleY];
}

function distance(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.hypot(dx, dy);
}

canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('touchmove', (e) => {
  if (e.touches && e.touches.length) {
    const t = e.touches[0];
    onMouseMove({ clientX: t.clientX, clientY: t.clientY, preventDefault: ()=>{} });
  }
}, { passive: true });

function onMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  const mousePos = [e.clientX - rect.left, e.clientY - rect.top];
  
  if (prevMousePos) {
    findAndSplit(prevMousePos, mousePos);
  }
  prevMousePos = mousePos;
}

function findAndSplit(startPoint, endPoint) {
  const now = Date.now();
  if (now - lastSplitTime < SPLIT_DELAY) return;
  
  // Break the interval into segments for better hit detection
  const breaks = breakInterval(startPoint, endPoint, 4);
  
  for (let i = 0; i < breaks.length - 1; i++) {
    const ep = breaks[i + 1];
    const circle = findSplitableCircleAt(ep);
    
    if (circle && circle.splitable && circle.visible) {
      splitCircle(circle);
      lastSplitTime = now;
      return; // Only split one at a time
    }
  }
}

function breakInterval(start, end, segments) {
  const points = [start];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    points.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t
    ]);
  }
  points.push(end);
  return points;
}

function findSplitableCircleAt(pos) {
  // Convert display space to image space
  const [imgX, imgY] = toImageSpace(pos[0], pos[1]);
  
  // Find the circle at this position
  for (const circle of visibleCircles) {
    const cx = circle.x + circle.size / 2;
    const cy = circle.y + circle.size / 2;
    const r = circle.size / 2;
    
    const dist = Math.hypot(imgX - cx, imgY - cy);
    if (dist <= r && circle.splitable) {
      return circle;
    }
  }
  return null;
}

function splitCircle(circle) {
  if (!circle.children) return;
  
  // Remove parent from visible list
  const index = visibleCircles.indexOf(circle);
  if (index > -1) {
    visibleCircles.splice(index, 1);
  }
  circle.visible = false;
  
  // Add children with animation from parent center to final positions
  const now = Date.now();
  for (const child of circle.children) {
    child.visible = true;
    child.birthTime = now;
    child.progress = 0;
    child.parent = circle;
    visibleCircles.push(child);
  }
  
  // Start animation loop if not already running
  if (!animationFrame) {
    animate();
  }
}

function animate() {
  const now = Date.now();
  let needsAnimation = false;
  
  // Update progress for all growing circles
  for (const circle of visibleCircles) {
    if (circle.progress < 1) {
      const elapsed = now - circle.birthTime;
      circle.progress = Math.min(1, elapsed / GROWTH_DURATION);
      needsAnimation = true;
    }
  }
  
  draw();
  
  if (needsAnimation) {
    animationFrame = requestAnimationFrame(animate);
  } else {
    animationFrame = null;
  }
}

function avgColor(x, y, size) {
  // Sample region; to keep it fast, sample with a stride if size is large.
  const stride = size > 16 ? 2 : 1;
  const w = Math.max(1, Math.floor(size));
  const h = w;
  // Clamp to image bounds
  const sx = Math.max(0, Math.min(off.width - w, Math.floor(x)));
  const sy = Math.max(0, Math.min(off.height - h, Math.floor(y)));

  const imgData = offCtx.getImageData(sx, sy, w, h).data;
  let r = 0, g = 0, b = 0, count = 0;
  for (let j = 0; j < h; j += stride) {
    for (let i = 0; i < w; i += stride) {
      const idx = ((j * w) + i) * 4;
      r += imgData[idx];
      g += imgData[idx + 1];
      b += imgData[idx + 2];
      count++;
    }
  }
  r = Math.round(r / count);
  g = Math.round(g / count);
  b = Math.round(b / count);
  return `rgb(${r},${g},${b})`;
}

function draw() {
  // Clear in CSS pixels (canvas transform maps CSS pixels to device pixels)
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, displayW, displayH);

  // Compute scale from image (image-space) to display CSS pixels
  const imgSize = Math.min(off.width, off.height);
  const scale = displayW / imgSize; // CSS pixels per image pixel

  // Draw each visible circle
  for (const circle of visibleCircles) {
    // Ease-out cubic for smooth growth
    const easeProgress = 1 - Math.pow(1 - circle.progress, 3);

    // Interpolate from parent position/size to final state
    let cx, cy, r;
    if (circle.progress < 1 && circle.parent) {
      const parentCx = (circle.parent.x + circle.parent.size / 2) * scale;
      const parentCy = (circle.parent.y + circle.parent.size / 2) * scale;
      const parentR = (circle.parent.size / 2) * scale;

      const targetCx = (circle.x + circle.size / 2) * scale;
      const targetCy = (circle.y + circle.size / 2) * scale;
      const targetR = (circle.size / 2) * scale;

      cx = parentCx + (targetCx - parentCx) * easeProgress;
      cy = parentCy + (targetCy - parentCy) * easeProgress;
      r = parentR + (targetR - parentR) * easeProgress;
    } else {
      cx = (circle.x + circle.size / 2) * scale;
      cy = (circle.y + circle.size / 2) * scale;
      r = (circle.size / 2) * scale;
    }

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();
  }
}
