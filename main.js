d3.csv('data/simple_2007_2019.csv')
.then(function(d) {
    console.log(d);
    setup(d);
})
.catch(function(error){
    console.log("Error thrown.");
    console.log(error);
});

function cleaupData(d) {
    for (k of Object.keys(d)) {
        //todo: convert numbers in strings to numbers
    }
}

function setup(d) {
    setupSelector(d);
}

function setupSelector(da) {
    
    let options = [];
    Object.keys(da[0]).forEach((key, value) => {
        options.push(key);
    });
    
    d3.select('select#x-selector')
        .on('change', () => update())
        .selectAll('option')
        .data(options)
        .enter()
        .append('option')
        .attr('value', d => d)
        .text(d => d);
}

var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var mysvg = d3.select("#advait")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleBand()
    .range([0, width])
    .domain(da.map(function (d) { return d.ClassLevel; }))
    .padding(0.2);
svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

var y = d3.scaleLinear()
    .domain([0, 13000])
    .range([height, 0]);
svg.append("g")
    .call(d3.axisLeft(y));

svg.selectAll("mybar")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", function (d) { return x(d.ClassLevel); })
    .attr("y", function (d) { return y(d.StudentCount); })
    .attr("width", x.bandwidth())
    .attr("height", function (d) { return height - y(d.Value); })
    .attr("fill", "#69b3a2")
    

d3.select('#slider')
  
