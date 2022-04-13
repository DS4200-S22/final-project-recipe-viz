// setting parameters
const margin = {
    top: 80,
    right: 80,
    bottom: 20,
    left: 20
  };

const width = 600 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

const svg = d3.select("#vis-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);

let dot

// Scales are global
let x, y

// Keys are global
let xKey1, yKey1

// Filtering Axes
d3.csv("data/recipe_tot2.csv").then(function(data) {
    const recipeAttr = ['minutes','n_steps','n_ingredients','calories (kCal)','total fat (g)',
                      'sugar (g)','sodium (mg)','protein (g)','saturated fat (g)','carbohydrates (g)'];


    xKey1 = 'minutes'
    yKey1 = 'minutes'

    let maxX = d3.max(data, (d) => { return parseInt(d[xKey1]); });

    // Add X axis
    x = d3.scaleLinear()
      .domain([0, maxX])
      .range([margin.left, width-margin.right]);

    let xAxis = svg.append("g")
                      .attr("transform", `translate(0, ${height - margin.bottom})`)
                      .call(d3.axisBottom(x));

    // Find max y 
    let maxY = d3.max(data, (d) => { return parseInt(d[yKey1]); });

    // Add Y axis
    y = d3.scaleLinear()
      .domain([0, maxY])
      .range([height - margin.bottom, margin.top]);

    let yAxis = svg.append("g")
                      .attr("transform", `translate(${margin.left}, 0)`) 
                      .call(d3.axisLeft(y));

    // add the options to the button
    let dropdownY = d3.select("#visbutton")
      .append('select')
      .attr('id', 'dropY');

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    const tooltip = d3.select("#vis-container")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")



    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    const mouseover = function(event, d) {
      tooltip
        .style("opacity", 1)
    }

    const mousemove = function(event, d) {
      tooltip
        .html(`Name: ${d['name']}<br>ID: ${d['id']}`)
        .style("left", (event.x)/2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (event.y)/2 + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const mouseleave = function(event,d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }

    const mouseclick = function(event, d) {
      recipeUrl = "https://www.food.com/recipe/-" + d.id
      window.open(recipeUrl)
    }

    // Add points
    dot = svg.selectAll("circle")
                        .data(data)
                        .enter()
                          .append("circle")
                          .attr("id", (d) => d.id)
                          .attr("cx", (d) => x(d[xKey1]))
                          .attr("cy", (d) => y(d[yKey1]))
                          .attr("r", 5)
                          .style("opacity", 0.5)
                        .on("mouseover", mouseover )
                        .on("mousemove", mousemove )
                        .on("mouseleave", mouseleave )
                        .on('click', mouseclick )

    // add the options to the button
    dropdownY // Add a button
      .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
        .data(recipeAttr)
      .enter()
        .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    
    // add the options to the button
    let dropdownX = d3.select("#visbutton")
      .append('select')
      .attr('id', 'dropX');

    // add the options to the button
    dropdownX // Add a button
      .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
        .data(recipeAttr)
      .enter()
        .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // A function that update the chart
    function updateX(selectedGroup) {

      // Update X axis
      maxX = d3.max(data, (d) => { return parseInt(d[selectedGroup]); });
      x.domain([0,maxX])
      xAxis.transition().duration(1000).call(d3.axisBottom(x))

      // Give these new data to update dot
      dot
        .data(data)
        .transition()
        .duration(1000)
          .attr("cx", d => x(+d[selectedGroup]))

    }

    // A function that update the chart
    function updateY(selectedGroup) {

      // Update Y axis
      maxY = d3.max(data, (d) => { return parseInt(d[selectedGroup]); });
      y.domain([0,maxY])
      yAxis.transition().duration(1000).call(d3.axisLeft(y))

      // Give these new data to update dot
      dot
        .data(data)
        .transition()
        .duration(1000)
          .attr("cy", d => y(+d[selectedGroup]))
    };

    // When the button is changed, run the updateChart function
    d3.select("#dropX").on("change", function(event, d) {

        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")

        // run the updateChart function with this selected option
        updateX(selectedOption)
    })

    // When the button is changed, run the updateChart function
    d3.select("#dropY").on("change", function(event, d) {

        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")

        // run the updateChart function with this selected option
        updateY(selectedOption)

    })

    // top histogram
    const gTop = svg.append("g")
      .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
        // "translate(0,0)");

    const xBins = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(10))
      .value(function(d) {
        return d[xKey1];
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
    const gRight = svg.append("g")
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