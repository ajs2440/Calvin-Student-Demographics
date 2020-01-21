<<<<<<< HEAD
const dataPromise = d3.csv('data/simple_2007_2019.csv')
.then(function(d) {
    console.log(d);
    setup(d);
=======
const data = d3.csv('data/simple_2007_2019.csv')
.then(function(data) {
    console.log(data);
>>>>>>> parent of 7628199... created x-axis selector
})
.catch(function(error){
    console.log(error);
});

<<<<<<< HEAD
function cleaupData(d) {
    
}

function setup(d) {
    setupSelector(d);
}

//global variables for each person's svg
let xvar, year;

function update() {
    xvar = d3.select('select#x-selector').property('value');
    year = +d3.select('input#slider').property('value');
}

function setupSelector(da) {
    
    let options = [];
    console.log(da);

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


d3.select('#slider')
  .on('change', () => update())
  .append('svg')
  .attr('width', 500)
  .attr('height', 300)
  .append('g')
  .attr('transform', 'translate(30,30)')
  .call(slider)

=======
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
>>>>>>> parent of 7628199... created x-axis selector
