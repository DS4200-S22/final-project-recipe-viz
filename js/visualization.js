// setting parameters
const margin = {
    top: 80,
    right: 80,
    bottom: 20,
    left: 20
  };

const width = 700 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

const svg = d3.select("#vis-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);

let dot
let title

// Scales are global
let x, y

// Keys are global
let xKey1, yKey1

// Filtering Axes
d3.csv("data/recipe_tot.csv").then(function(data) {

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
    console.log(maxY);

    // Add Y axis
    y = d3.scaleLinear()
      .domain([0, maxY])
      .range([height - margin.bottom, margin.top]);

    let yAxis = svg.append("g")
                      .attr("transform", `translate(${margin.left}, 0)`) 
                      .call(d3.axisLeft(y));

    // add the options to the button
    let dropdownY = d3.select("#axisY")
      .append('select')
      .attr('id', 'dropY')

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

    // add the options to the button
    dropdownY // Add a button
      .selectAll('myOptions') // Next 4 lines add 6 options = 6 colors
        .data(recipeAttr)
      .enter()
        .append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button

    
    // add the options to the button
    // let dropdownX = d3.select("#visbuttonX")
    let dropdownX = d3.select("#axisX")
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

    const selectedTextX = d3.select('#axisX option:checked').text();
    const selectedTextY = d3.select('#axisY option:checked').text();

    title = svg.append("text")
      .attr("id", "title-text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "16px")
      .text(`${selectedTextY} vs. ${selectedTextX}`)

    function updateTitleX(newAxisTitle) {

      const selectedTextY = d3.select('#axisY option:checked').text();
      
      d3.select('#title-text').remove()
  
      title = svg.append("text")
        .attr("id", "title-text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px")
        .text(`${selectedTextY} vs. ${newAxisTitle}`)
    }

    function updateTitleY(newAxisTitle) {

      const selectedTextX = d3.select('#axisX option:checked').text();

      d3.select('#title-text').remove()
  
      title = svg.append("text")
        .attr("id", "title-text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px")
        .text(`${newAxisTitle} vs. ${selectedTextX}`)
    }

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
      console.log(maxY);
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

        updateTitleX(selectedOption)
    })

    // When the button is changed, run the updateChart function
    d3.select("#dropY").on("change", function(event, d) {

        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")

        // run the updateChart function with this selected option
        updateY(selectedOption)

        updateTitleY(selectedOption)

    })
});