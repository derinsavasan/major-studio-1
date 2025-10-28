// Load and render initial game on page load
d3.csv("portraits_v1.csv").then(data => {
  renderGame(data);
  // Initialize stats
  d3.select('#pairs').text(0);
  d3.select('#moves').text(0);
  d3.select('#loading').style('display', 'none');
  // Ensure all cards start face-down
  d3.selectAll('.card').classed('flipped', false).attr('data-matched', 'false');
});

function renderGame(data) {
  // Shuffle the data and take 20 unique
  const shuffled = d3.shuffle(data.slice());
  const unique = shuffled.slice(0, 20);
  // Duplicate for pairs
  const pairs = unique.concat(unique);
  // Shuffle again
  d3.shuffle(pairs);
  
  const app = d3.select("#app");
  app.selectAll(".card").remove(); // Clear previous
  
  const cards = app.selectAll(".card")
    .data(pairs)
    .enter()
    .append("div")
    .attr("class", "card")
    .attr("data-name", d => d.title)
    .attr("data-matched", "false")
    .on("click", flipCard);
  
  cards.append("div")
    .attr("class", "back");
  
  cards.append("div")
    .attr("class", "front")
    .style("background-image", d => `url(${d.thumbnail})`);
}

d3.select('#start').on('click', function() {
  // Reset stats
  pairsFound = 0;
  moves = 0;
  flipped = [];
  matched = new Set();
  d3.select('#pairs').text(0);
  d3.select('#moves').text(0);
  d3.select('#message').style('display', 'none');

  // Reset cards
  d3.selectAll('.card').classed('flipped', false).classed('matched', false).attr('data-matched', 'false');

  d3.csv("portraits_v1.csv").then(data => {
    renderGame(data);
  });
});