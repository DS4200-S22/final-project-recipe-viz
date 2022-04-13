// setting parameters
const margin = {
    top: 80,
    right: 80,
    bottom: 20,
    left: 20
  };

const width = 900 - margin.left - margin.right;
const height = 900 - margin.top - margin.bottom;

const ingredientsObj = {}

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
d3.csv("data/recipe_tot.csv").then(function(data) {

    // WORDCLOUD
    let clickedIngredients = [];
    let myWords = wordCloud(data);

      // append the svg object to the body of the page
    const svg2 = d3.select("#word-cloud").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    const mouseoverWords = function(d, i) {
      d3.select(this).style("cursor", "pointer"); 
      if(d3.select(this).style('fill') != 'rgb(252, 132, 3)') {
        d3.select(this).style('fill', 'orange');
      }
    }

    const mouseoutWords = function(d, i) {
      if(d3.select(this).style('fill') != 'rgb(252, 132, 3)') {
        d3.select(this).style('fill', '#69b3a2');
      }
    }

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    const layout = d3.layout.cloud()
    .size([width, height])
    .words(myWords.map(function(d) { return {text: d.word, size:d.size}; }))
    .padding(5)        //space between words
    .rotate(function() { return ~~(Math.random() * 2) * 90; })
    .fontSize(function(d) { return 2.5*Math.sqrt(d.size); })      // font size of words
    .on("end", draw);
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
      myWords = svg2
        .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) { 
              return d.size + "px"; 
            })
            .style("fill", "#69b3a2")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; })
            .on("click", function(d, i) {
              if(d3.select(this).style('fill') == 'rgb(252, 132, 3)') {
                d3.select(this).style('fill', '#69b3a2');
                clickedIngredients.splice(clickedIngredients.indexOf(i.text), 1);
                d3.selectAll('circle').style("r", (d) => {
                  if(clickedIngredients.some((ingredient) => d.ingredients.includes(ingredient)) || clickedIngredients.length == 0) {
                    return "5px";
                  } else {
                    return "0px";
                  }
                })
              } else {
                clickedIngredients.push(i.text)
                d3.select(this).style('fill', '#fc8403');
                d3.selectAll('circle').style("r", (d) => {
                  if(clickedIngredients.some((ingredient) => d.ingredients.includes(ingredient)) || clickedIngredients.length == 0) {
                    return "5px";
                  } else {
                    return "0px";
                  }
                })
              }
            })
            .on("mouseover", mouseoverWords)
            .on("mouseout", mouseoutWords)
    }


    // SCATTERPLOT
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
    // Add points
    dot = svg.selectAll("circle")
                        .data(data)
                        .enter()
                          .append("circle")
                          .attr("id", "circleClass")
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
    })

    // When the button is changed, run the updateChart function
    d3.select("#dropY").on("change", function(event, d) {

        // recover the option that has been chosen
        let selectedOption = d3.select(this).property("value")

        // run the updateChart function with this selected option
        updateY(selectedOption)

    })
});


function wordCloud(data) {
  for (let i = 0; i < data.length; i++) {
    const ingredientsString = data[i]['ingredients']
    const cleanedIngredients = ingredientsString.substring(1, ingredientsString.length - 1).split(', ').map((item) => item.substring(1, item.length - 1))
    
    cleanedIngredients.forEach((ingredient) => {
      if(Object.keys(ingredientsObj).includes(ingredient)) {
        ingredientsObj[ingredient] = ingredientsObj[ingredient] + 1;
      } else {
        ingredientsObj[ingredient] = 1;
      }
    })
  }

  Object.keys(ingredientsObj).forEach((ingredient) => {
    if(ingredientsObj[ingredient] < 10) {
      delete ingredientsObj[ingredient];
    }
  })

  delete ingredientsObj['salt'];
  delete ingredientsObj['water'];
  delete ingredientsObj['butter'];
  delete ingredientsObj['olive oil'];
  delete ingredientsObj['pepper'];

  ingredientsObj['garlic cloves'] = ingredientsObj['garlic cloves'] + ingredientsObj['garlic']
  delete ingredientsObj['garlic']

  ingredientsObj['egg'] = ingredientsObj['egg'] + ingredientsObj['eggs']
  delete ingredientsObj['eggs']


  let myWords = []
  Object.keys(ingredientsObj).forEach((ingredient) => {
    const wordsObject = {word: ingredient, size: ingredientsObj[ingredient]};
    myWords.push(wordsObject);
  })

  myWords.sort((a, b) => a.size < b.size);

  return myWords;
}
