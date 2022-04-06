d3.csv("data/recipe_tot.csv").then(function(data) {

  const margin = {
    top: 80,
    right: 80,
    bottom: 20,
    left: 20
  };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;
  const ingredientsObj = {}
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

  const myWords = []
  Object.keys(ingredientsObj).forEach((ingredient) => {
    const wordsObject = {word: ingredient, size: ingredientsObj[ingredient]};
    myWords.push(wordsObject);
  })

  myWords.sort((a, b) => a.size < b.size);


    // append the svg object to the body of the page
  const svg2 = d3.select("#word-cloud").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

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
    svg2
      .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
          .data(words)
        .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("fill", "#69b3a2")
          .attr("text-anchor", "middle")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
  }
});
