// setting parameters
const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
  };

const width = 600 - margin.left - margin.right;
let height = 600 - margin.top - margin.bottom;

const ingredientsObj = {}

const svg = d3.select("#vis-container")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          `translate(${margin.left}, ${margin.top})`);

let dot
let title
let selectedRecipes

// Scales are global
let x, y

// Keys are global
let xKey1, yKey1

// Filtering Axes
d3.csv("data/recipe_tot2.csv").then(function(data) {

    // WORDCLOUD
    let clickedIngredients = [];
    let myWords = wordCloud(data);

    let height = 500 - margin.top - margin.bottom;

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
          .attr("id", "wordsClass")
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
                  if(clickedIngredients.every((ingredient) => d.ingredients.includes(ingredient)) || clickedIngredients.length == 0) {
                    return "5px";
                  } else {
                    return "0px";
                  }
                })
              } else {
                clickedIngredients.push(i.text)
                d3.select(this).style('fill', '#fc8403');
                d3.selectAll('circle').style("r", (d) => {
                  if(clickedIngredients.every((ingredient) => d.ingredients.includes(ingredient)) || clickedIngredients.length == 0) {
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

    height = 600 - margin.top - margin.bottom;


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
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("overflow-y", "scroll");


    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    const mouseover = function(event, d) {
      recipeUrl = "https://www.food.com/recipe/-" + d.id

        tooltip
        .html(`Name: <a href="recipeUrl">${d['name']}</a><br>ID: ${d['id']}<br>${xKey1}: ${d[xKey1]}<br>${yKey1}: ${d[yKey1]}`)
        .style("opacity", 1)
      
      d3.select(this).style("stroke", "#000000")
      d3.select(this).style("cursor", "pointer");
    }

    const mousemove = function(event, d) {
      tooltip
        .style("left", (event.pageX + 5) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (event.pageY + 10) + "px")
    }

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const mouseleave = function(event,d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
      d3.select(this).style("stroke", "none");
    }

    selectedRecipes = [];
    const mouseclick = function(event, d) {
      selectedRecipes.push(d)
      addData(selectedRecipes, xKey1);
    }

    const dotColors = {"breakfast": "#ff87ab", 
                      "lunch": "#52b788",
                      "dinner": "#1e6091"}

    //make color as re the possible domain
    const color = d3.scaleOrdinal()
            .domain(Object.keys(dotColors))
            .range(Object.values(dotColors));

    let legend = d3.select('#legend').append("svg")
                      .attr("width", 140)
                      .attr("height", 100)
                        .selectAll(".legend")
         .data(Object.keys(dotColors))
            .enter().append("g")
         .attr("class", "legend")
         .attr("transform", function(d, i) { return "translate(0," + (i+2) * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
         .attr("x", 140-18)
         .attr("width", 18)
         .attr("height", 18)
         .style("fill", function(d){return color(d)});

    // draw legend text
    legend.append("text")
         .attr("x", 140 - 24)
         .attr("y", 9)
         .attr("dy", ".35em")
         .style("text-anchor", "end")
         .text(function(d) { return d;});    

    brush1 = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start", clear)
    .on("brush", updatePlot)
    svg.call(brush1);

    // Add points
    dot = svg.selectAll("circle")
                        .data(data)
                        .enter()
                          .append("circle")
                          .attr("id", "circleClass")
                          .attr("cx", (d) => x(d[xKey1]))
                          .attr("cy", (d) => y(d[yKey1]))
                          .attr("r", 5)
                          .style("fill", (d => dotColors[d["meal"]]))
                          .style("opacity", 0.5)
                        .on("mouseover", mouseover )
                        .on("mousemove", mousemove )
                        .on("mouseout", mouseleave )
                        .on("click", mouseclick )
    function clear() {
      brush1.move(svg, null);
    }

    function updatePlot(brushEvent) {
      extent = brushEvent.selection;

      brushedCircles = []
      d3.selectAll('circle')._groups[0].forEach(circle => {
        if(isBrushed(extent, circle.cx.baseVal.value, circle.cy.baseVal.value) && circle.style.r!='0px') {
          brushedCircles.push(circle.__data__)
        }
      })

      const info = `<ol>${brushedCircles.map(getRecipeCard)}</ol>`;

      tooltip
        .html(info)
        .style("opacity", 1)
        .style("height", "200px")

    }

    function getRecipeCard (recipe) {
      recipeUrl = "https://www.food.com/recipe/-" + recipe.id

      return `<li>Name: <a href="${recipeUrl}" target="_blank">${recipe['name']}</a>
              <br>ID: ${recipe['id']}<br>${xKey1}: ${recipe[xKey1]}
              <br>${yKey1}: ${recipe[yKey1]}\n</li>`
    }

    function isBrushed(brush_coords, cx, cy) {
      if (brush_coords === null) return;
  
      var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
      return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
    }

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

    title = d3.select("#title-vis").append("text")
      .attr("id", "title-text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .text(`${selectedTextY} vs. ${selectedTextX}`)


    function updateTitleX(newAxisTitle) {

      const selectedTextY = d3.select('#axisY option:checked').text();
      
      d3.select('#title-text').remove()
  
      title = d3.select("#title-vis").append("text")
        .attr("id", "title-text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text(`${selectedTextY} vs. ${newAxisTitle}`)
    }

    function updateTitleY(newAxisTitle) {

      const selectedTextX = d3.select('#axisX option:checked').text();

      d3.select('#title-text').remove()
  
      title = d3.select("#title-vis").append("text")
        .attr("id", "title-text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text(`${newAxisTitle} vs. ${selectedTextX}`)
    }

    // A function that update the chart
    function updateX(selectedGroup) {

      xKey1 = selectedGroup

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

      yKey1 = selectedGroup
      
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


    // TABLE
    // the columns you'd like to display
    let columns = [
        "name", "minutes","calories (kCal)","total fat (g)",
        "sugar (g)","sodium (mg)","protein (g)","saturated fat (g)",
        "carbohydrates (g)","rating",
    ];

    data.forEach(function(d){
    for (let i = 0; i < columns.length; i++) {
        if (columns[i] === "name") { continue; } 
        d[columns[i]] = +d[columns[i]]; };
    });

    let table = d3.select("#recipe-table").append("table").attr("id", "table_of_items");
    thead = table.append("thead"),
    tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .text(function (column) {
          return column;
        })

    // create a row for each object in the data
    function addData(data, col) {
        rows = tbody.selectAll("tr")
                  .data(data)
                  .enter()
                  .append("tr")
                    .on("click", function(event, d) {
                          recipeUrl = "https://www.food.com/recipe/-" + d.id
                          window.open(recipeUrl)
                      });

        // create a cell in each row for each column
        cells = rows.selectAll("td")
                  .data(function (row) {
                    return columns.map(function (column) {
                      return { column: column, value: row[column] };
                    });
                  })
                  .enter()
                  .append("td")
                  .text(function (d) {
                    return d.value;
                  });
        sortTable(col)
    }

    function sortTable(col) {
        table.selectAll("tbody tr") 
            .sort(function(a, b) {
                    return d3.descending(a[col], b[col]);
            });
        }

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

function clearAll() {
  // console.log(d3.selectAll('text').style("fill"))
  d3.selectAll('text').style("fill", "#69b3a2")
  d3.selectAll('circle').style('r', '5px')
  clickedIngredients = []
}

function clearTable(){
    d3.selectAll("#table_of_items tbody tr").remove()
    for (let i = selectedRecipes.length; i>0; i--) {
      selectedRecipes.pop()
    };
};