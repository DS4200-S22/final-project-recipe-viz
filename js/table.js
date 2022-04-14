d3.csv("../data/recipe_tot2.csv").then((data) => {

    // Table
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

    addData(data, "minutes");
    sortTable("minutes")
});

function clearTable(){
    d3.selectAll("#table_of_items tbody tr").remove();
};
