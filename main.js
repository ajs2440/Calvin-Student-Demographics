const data = d3.csv('data/simple_2007_2019.csv')
.then(function(data) {
    console.log(data);
})
.catch(function(error){
    console.log("Error thrown.");
    console.log(error);
});

var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#advait")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


var slider = d3.select("#tom")
.sliderHorizontal()