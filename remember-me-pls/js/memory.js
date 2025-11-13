let flipped = [];
let matched = new Set();
let pairsFound = 0;
let moves = 0;

function flipCard() {
  const card = d3.select(this);
  if (flipped.length < 2 && !card.classed('matched') && !flipped.includes(this)) {
    card.classed('flipped', true);
    flipped.push(this);
    if (flipped.length === 2) {
      moves++;
      d3.select('#moves').text(moves);
      setTimeout(checkMatch, 1000);
    }
  }
}

function checkMatch() {
  const [card1, card2] = flipped;
  const name1 = card1.dataset.name;
  const name2 = card2.dataset.name;
  if (name1 === name2) {
    d3.select(card1).classed('matched', true).attr('data-matched', 'true');
    d3.select(card2).classed('matched', true).attr('data-matched', 'true');
    pairsFound++;
    d3.select('#pairs').text(pairsFound);
    if (pairsFound === 20) {
      d3.select('#message').text('Congratulations! You won!').style('display', 'block');
    }
  } else {
    d3.select(card1).classed('flipped', false);
    d3.select(card2).classed('flipped', false);
  }
  flipped = [];
}