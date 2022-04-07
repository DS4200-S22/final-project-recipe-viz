// setting parameters
const margin = {
    top: 80,
    right: 80,
    bottom: 20,
    left: 20
  };
const width = 400 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Filtering Axes
d3.csv("data/recipe_tot.csv").then(function(data) {
    const recipeAttr = ['minutes','n_steps','n_ingredients','calories (kCal)','total fat (g)',
                      'sugar (g)','sodium (mg)','protein (g)','saturated fat (g)','carbohydrates (g)'];


    // add the options to the button
    let dropdownY = d3.select("#visbutton")
      .append('select')
      .attr('id', 'dropY');

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

      // Create new data with the selection?
      const dataFilterX = data.map(function(d){return {valueX:d[selectedGroup]} })

      // Give these new data to update dot
      dot
        .data(dataFilterX)
        .transition()
        .duration(1000)
          .attr("cx", d => x(+d.valueX))
    }

    // A function that update the chart
    function updateY(selectedGroup) {

      // Create new data with the selection?
      const dataFilterY = data.map(function(d){return {valueY:d[selectedGroup]} })

      // Give these new data to update dot
      dot
        .data(dataFilterY)
        .transition()
        .duration(1000)
          .attr("cy", d => y(+d.valueY))
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
});

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
