
// Console logging data
d3.csv("data/recipe_tot.csv").then(function(data) {
    for (let i = 0; i < 10; i++) {
        console.log(data[i]);
  }
});

const margin = {
    top: 60,
    right: 20,
    bottom: 40,
    left: 40
};
const width = 900 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg1 = d3.select("#vis-container").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)

d3.csv("data/recipe_tot.csv").then((recipeData) => {

  //minutes, n_steps, calories (kCal), protein (g), protein to calorie ratio
  let xKey = "minutes"
  let yKey = "calories (kCal)"

  let maxX1 = d3.max(recipeData, (d) => { return d[xKey]; });
  let maxY1 = d3.max(recipeData, (d) => { return d[yKey]; });
  let x, y;

  const g = svg1.append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  x = d3.scaleLinear().range([margin.left, width - margin.right]).domain([0, maxX1]);
  y = d3.scaleLinear().range([height - margin.bottom, margin.top]).domain([0, maxY1]);

  // Add the X Axis
  g.append("g")
    // .attr("transform", "translate(0," + height + ")")
    // .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .call((g) => g.append("text")
      .attr("x", width - margin.right)
      .attr("y", margin.bottom - 4)
      .attr("fill", "black")
      .attr("text-anchor", "end")
      .text(xKey)
    );;

  // Add the Y Axis
  g.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(y))
    // .attr("font-size", '20px')
    .call((g) => g.append("text")
      .attr("x", 0)
      .attr("y", margin.top)
      .attr("fill", "black")
      .attr("text-anchor", "end")
      .text(yKey)
    );

  const random = d3.randomNormal(0, 1.2),
    data = d3.range(100).map(function() {
      return [random() + 5, random() + 5];
    });

  // scatterplot
  g.selectAll("circle")
    .data(recipeData)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
      return x(d[xKey]);
    })
    .attr("cy", function(d) {
      return y(d[yKey]);
    })
    .attr("r", 5)
    .style("fill", "steelblue")
    .style("stroke", "lightblue");

  // top histogram
  const gTop = svg1.append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");
      // "translate(0,0)");

  const xBins = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(10))
    .value(function(d) {
      return d[xKey];
    })(recipeData);

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
    .attr("dy", "-0.25em")
    .attr("y", 2)
    .attr("x", bWidth / 2)
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.length < 4 ? "" : d.length;
    })
    .style("fill", "black")
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
});
