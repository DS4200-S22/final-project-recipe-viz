const margin = {
  top: 80,
  right: 80,
  bottom: 20,
  left: 20
};
const width = 400 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

var svg = d3.select("#vis-container").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)