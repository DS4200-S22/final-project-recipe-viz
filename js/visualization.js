
// Console logging data
d3.csv("data/recipe_tot.csv").then(function(data) {
    for (let i = 0; i < 10; i++) {
        console.log(data[i]);
  }
});


const margin = {
    top: 80,
    right: 80,
    bottom: 20,
    left: 20
  };
const width = 400 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

const svg1 = d3.select("#vis-container").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

const g = svg1.append("g")
  .attr("transform",
    "translate(" + margin.left + "," + margin.top + ")");

const x = d3.scaleLinear().range([0, width]).domain([0, 10]);
const y = d3.scaleLinear().range([height, 0]).domain([0, 10]);

// Add the X Axis
g.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add the Y Axis
g.append("g")
  .call(d3.axisLeft(y));

const random = d3.randomNormal(0, 1.2),
  data = d3.range(100).map(function() {
    return [random() + 5, random() + 5];
  });

g.selectAll(".point")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", function(d) {
    return x(d[0]);
  })
  .attr("cy", function(d) {
    return y(d[1]);
  })
  .attr("r", 7)
  .style("fill", "steelblue")
  .style("stroke", "lightgray");

// top histogram
const gTop = svg1.append("g")
  .attr("transform",
    "translate(" + margin.left + "," + 0 + ")");

const xBins = d3.histogram()
  .domain(x.domain())
  .thresholds(x.ticks(10))
  .value(function(d) {
    return d[0];
  })(data);

const xy = d3.scaleLinear()
  .domain([0, d3.max(xBins, function(d) {
    return d.length;
  })])
  .range([margin.top, 0]);

const xBar = gTop.selectAll(".bar")
  .data(xBins)
  .enter().append("g")
  .attr("class", "bar")
  .attr("transform", function(d) {
    return "translate(" + x(d.x0) + "," + xy(d.length) + ")";
  });

let bWidth = x(xBins[0].x1) - x(xBins[0].x0) - 1;
xBar.append("rect")
  .attr("x", 1)
  .attr("width", bWidth)
  .attr("height", function(d) {
    return margin.top - xy(d.length);
  })
  .style("fill", "steelblue");

xBar.append("text")
  .attr("dy", ".75em")
  .attr("y", 2)
  .attr("x", bWidth / 2)
  .attr("text-anchor", "middle")
  .text(function(d) {
    return d.length < 4 ? "" : d.length;
  })
  .style("fill", "white")
  .style("font", "9px sans-serif");
  
// right histogram
const gRight = svg1.append("g")
  .attr("transform",
    "translate(" + (margin.left + width) + "," + margin.top + ")");

const yBins = d3.histogram()
  .domain(y.domain())
  .thresholds(y.ticks(10))
  .value(function(d) {
    return d[1];
  })(data);

const yx = d3.scaleLinear()
  .domain([0, d3.max(yBins, function(d) {
    return d.length;
  })])
  .range([0, margin.right]);

const yBar = gRight.selectAll(".bar")
  .data(yBins)
  .enter().append("g")
  .attr("class", "bar")
  .attr("transform", function(d) {
    return "translate(" + 0 + "," + y(d.x1) + ")";
  });

bWidth = y(yBins[0].x0) - y(yBins[0].x1) - 1;
yBar.append("rect")
  .attr("y", 1)
  .attr("width", function(d){
    return yx(d.length);
  })
  .attr("height", bWidth)
  .style("fill", "steelblue");

yBar.append("text")
  .attr("dx", "-.75em")
  .attr("y", bWidth / 2 + 1)
  .attr("x", function(d){
    return yx(d.length);
  })
  .attr("text-anchor", "middle")
  .text(function(d) {
    return d.length < 4 ? "" : d.length;
  })
  .style("fill", "white")
  .style("font", "9px sans-serif");
