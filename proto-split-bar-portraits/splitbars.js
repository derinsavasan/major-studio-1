// Code structured inspired by https://d3-graph-gallery.com/graph/barplot_horizontal.html
// Advanced and applied to context using GPT-5

const DATA = "data/portraits_small.csv";

const CHART_W = 920, CHART_H = 380;
const M = {top: 20, right: 30, bottom: 40, left: 120};

const svg = d3.select("#chart").append("svg").attr("viewBox", `0 0 ${CHART_W} ${CHART_H}`);
const g = svg.append("g").attr("transform", `translate(${M.left},${M.top})`);
const innerW = CHART_W - M.left - M.right;
const innerH = CHART_H - M.top - M.bottom;

const x = d3.scaleLinear().range([0, innerW]);
const y = d3.scaleBand().range([0, innerH]).padding(0.25);
const xAxis = g.append("g").attr("transform", `translate(0, ${innerH})`).attr("class","axis");
const yAxis = g.append("g").attr("class","axis");

const modeSel = document.getElementById("mode");
const note = document.getElementById("note");

d3.csv(DATA, d3.autoType).then(rows => {
  // Categories and colors
  const COLOR = {
    gender: new Map([["Female", "#c90076"], ["Male", "#2986cc"], ["Family Portrait", "#cccccc"]]),
    size: new Map([["Miniature", "#b7cbc3ff"], ["Regular", "#5F8575"]])
  };

  // Normalizers
  function normGender(g) {
  const s = String(g || "").toLowerCase();
    if (s === "female") return "Female";
    if (s === "male") return "Male";
    return "Family Portrait";   // everything else goes here (e.g., "female, male")
  }
  function normSize(s) {
    return (String(s || "") === "Miniature") ? "Miniature" : "Regular";
  }

  function getData(mode) {
    if (mode === "size") {
      const groups = d3.rollups(rows, v => v.length, d => normSize(d.size));
      return groups.map(([k, v]) => ({key: k, count: v})).sort((a,b) => d3.descending(a.count, b.count));
    }
    // default: gender
    const groups = d3.rollups(rows, v => v.length, d => normGender(d.gender));
    // keep consistent order: Male, Female, Family Portrait
    const order = new Map([["Male",0],["Female",1],["Family Portrait",2]]);
    return groups.map(([k, v]) => ({key: k, count: v})).sort((a,b) => d3.ascending(order.get(a.key) ?? 99, order.get(b.key) ?? 99));
  }

  function update(mode="gender") {
    const data = getData(mode);
    x.domain([0, d3.max(data, d => d.count) || 1]).nice();
    y.domain(data.map(d => d.key));

    // axes
    xAxis.transition().duration(450).call(d3.axisBottom(x).ticks(6).tickFormat(d3.format("d")));
    yAxis.transition().duration(450).call(d3.axisLeft(y));

    // bars
    const bars = g.selectAll("rect.bar")
      .data(data, d => d.key);

    bars.join(
      enter => enter.append("rect")
        .attr("class","bar")
        .attr("x", 0)
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("width", 0)
        .attr("fill", d => (COLOR[mode].get(d.key) || "#999"))
        .call(enter => enter.transition().duration(500).attr("width", d => x(d.count))),
      update => update
        .transition().duration(500)
        .attr("y", d => y(d.key))
        .attr("height", y.bandwidth())
        .attr("width", d => x(d.count))
        .attr("fill", d => (COLOR[mode].get(d.key) || "#999")),
      exit => exit.transition().duration(300).attr("width", 0).remove()
    );

    // labels
    const labels = g.selectAll("text.label")
      .data(data, d => d.key);

    labels.join(
      enter => enter.append("text").attr("class","label")
        .attr("x", d => x(d.count) + 6)
        .attr("y", d => y(d.key) + y.bandwidth()/2)
        .attr("opacity", 0)
        .text(d => d.count)
        .transition().duration(500).attr("opacity", 1),
      update => update
        .transition().duration(500)
        .attr("x", d => x(d.count) + 6)
        .attr("y", d => y(d.key) + y.bandwidth()/2)
        .tween("text", function(d) {
          const i = d3.interpolateNumber(+this.textContent || 0, d.count);
          return t => this.textContent = Math.round(i(t));
        }),
      exit => exit.transition().duration(300).attr("opacity", 0).remove()
    );

    // footnote
    const total = d3.sum(data, d => d.count);
    note.textContent = mode === "gender"
      ? `Total portraits: ${total}. Categories: Male, Female, Family Portrait (contains multiple people).`
      : `Total portraits: ${total}. Size computed from objectType (contains “miniature” → Miniature; otherwise Regular).`;
  }

  modeSel.addEventListener("change", e => update(e.target.value));
  update("gender");
});
