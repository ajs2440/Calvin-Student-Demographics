let svg;

const WIDTH = 800;
const HEIGHT = 640;

const MARGIN = { left: 100, top: 10, right: 20, bottom: 100 };
const nWIDTH = WIDTH - MARGIN.left - MARGIN.right;
const nHEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const BORDER_COLOR = "gray";
const BORDER_SIZE = 4;
const SHOW_TIME = 1000;
const TRANSITION_DURATION = 1000;

const LEGEND_COLOR_SYMBOL_HEIGHT = 10;
const YEAR_COLUMN_NAME = "Academic Year";
const STUDENT_COUNT_COLUMN_NAME = "StudentCount";
const REMOVED_DATA = ["StudentCount", "Academic Year"];

let nicerText = {
  "Academic Year": "Year",
  "InState": "In State",
  "InternationalStatus": "International Status",
  "Ethnicity": "Race",
  "ChurchAffiliation": "Church",
  "ClassLevel": "Class Level",
  "Gender": "Gender",
  "StudentCount": "Student Count"
}

let data = null;

const dataPromise = d3.csv('data/simple_2007_2019.csv')
  .then(cleanupData)
  .then((d) => {
    data = d;
    return waitTime(d, SHOW_TIME)
  })
  .then(setup)
  .catch(function(error){
      console.log(error);
  });

async function waitTime(d, waitTime) {
  await (new Promise(r => setTimeout(r, waitTime)));
  return d;
}

dataPromise.then((d) => {
  d3.select("#spinner").classed("hide", true);
});

function cleanupData(data) {
  return data.map(d => {
    d["StudentCount"] = +d["StudentCount"];
    d[YEAR_COLUMN_NAME] = +d[YEAR_COLUMN_NAME];
    return d;
  });
}

function setup(data) {
  //create svg and center it
  svg = d3.select("#visual").append("svg")
    .attr("width", `${WIDTH}px`)
    .attr("height", `${HEIGHT}px`);
    //.classed("horizontalCentered", true);
  
  //create border
  svg.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", WIDTH)
    .attr("height", HEIGHT)
    .attr("fill", "none")
    .attr("stroke", BORDER_COLOR)
    .attr("stroke-width", BORDER_SIZE);
  
  d3.select("#x-var")
    .selectAll("option")
    .data(Object.keys(data[0]).filter(e => !REMOVED_DATA.includes(e)))
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => nicerText[d]);
  
  let xvar = d3.select("#x-var").property("value");

  let flattenedData = flattenData(data, xvar);

  xYearScale = d3.scaleBand()
    .domain(flattenedData.map(e => e.year))
    .range([MARGIN.left, nWIDTH])
    .paddingInner(.3);


  xVarScale = d3.scaleBand()
    .domain(flattenedData.map(e => e[e.varType]))
    .range([0, xYearScale.bandwidth()])
    .paddingInner(.1);

  let range = d3.extent(flattenedData.map(e => e.studentCount));

  yScale = d3.scaleLinear()
    .domain([range[0], range[1]])
    .range([nHEIGHT, MARGIN.bottom]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${nHEIGHT+4})`)
    .call(d3.axisBottom(xYearScale))

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", `translate(${MARGIN.left-4}, 0)`)
    .call(d3.axisLeft(yScale));
  
  d3.selectAll(".data_parameter")
    .on("change", () => update(data));

  

  update(data);
}

function updateEvent() {
  

  if (data != null) {
    update(data, xvar, year);
  }
  
}

var yScale;
let xVarScale;
let xYearScale;
let colorScale;

function genColorScale(possibleValues, d3ColorScheme, range) {
  let ordinalVarScale = d3.scaleOrdinal().domain(possibleValues).range(possibleValues.map((v, i, n) => {
    return i/n.length*(Math.abs(range[1]-range[0])) + range[0];
  }));

  let colorScale = d3.scaleSequential().domain([0,100]).interpolator(d3ColorScheme);

  const func = value => {
    return colorScale(ordinalVarScale(value));
  }

  return func;
}

const getPossibleValues = (d, k) => {
  return Array.from(
    new Set(d.map(e => e[k]))
  );
}

const flattenData = (data, xvar) => {
  let pValues = getPossibleValues(data, xvar);
  let rollup = d3.rollup(data, v => d3.sum(v, d => d[STUDENT_COUNT_COLUMN_NAME]), d => d[YEAR_COLUMN_NAME], d => d[xvar]);
  let flat = [];
  rollup.forEach((map, currentYear) => {

    let givenValues = Array.from(map.keys());

    pValues.forEach(pValue => {
      let row = {
        year: currentYear,
        studentCount: givenValues.includes(pValue) ?  map.get(pValue) : 0,
        varType: xvar,
      }
      row[xvar] = pValue;
      flat.push(row);
    })
    
  })
  return flat;
}

function update(data) {

  let xvar = d3.select("#x-var").property("value");

  let flattenedData = flattenData(data, xvar);

  //update x axis
  xYearScale.domain(flattenedData.map(e => e.year))
  svg.select(".x.axis")
    .call(d3.axisBottom(xYearScale))


  xVarScale.domain(flattenedData.map(e => e[e.varType]))
  .range([0, xYearScale.bandwidth()])

  //update y axis
  let range = d3.extent(flattenedData.map(e => e.studentCount));
  yScale.domain([0, range[1]])  
  svg.select(".y.axis").transition().duration(TRANSITION_DURATION)
    .call(d3.axisLeft(yScale));

  
  //ordinal to color
  colorScale = genColorScale(getPossibleValues(data, xvar), d3.interpolateRainbow, [20, 100]);
  
  console.log(flattenedData);

  var tooltip = d3.select("#visual")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")

  // fade out other bars when mouse hovers over this bar
  var mouseover = function(d) {
    // what subgroup are we hovering?
    // var subgroupName = d3.select(this.parentNode).datum().key; // This was the tricky part
    // var subgroupValue = d.data[subgroupName];
    // Reduce opacity of all rect to 0.2
    d3.selectAll(".bar").style("opacity", 0.3)
    // Highlight all rects of this subgroup with opacity 0.8. It is possible to select them since they have a specific class = their name.
    d3.select(this)
      .style("opacity", 1)
    tooltip.html("some info").style("opacity", 1)
  }

  // set opacity back to normal when mouse is not over any bar
  var mouseleave = function(d) {
    d3.selectAll(".bar")
      .style("opacity", 1)
      tooltip.style("opacity", 0)
  }

  //https://stackoverflow.com/questions/45211408/making-a-grouped-bar-chart-using-d3-js
  svg
    .selectAll("rect.bar")
    .data(flattenedData)
    .join(
      enter => enter
        .append("rect")
          .on("mouseover", mouseover)
          .on("mouseleave", mouseleave)
          .attr("class", "bar")
          .attr("x", d => xVarScale(d[d.varType])+xYearScale(d.year))
          .attr("y", d => yScale(d.studentCount))
          .attr("width", xVarScale.bandwidth())
          .attr("height", d=> nHEIGHT-yScale(d.studentCount))
          .style("fill", d => colorScale(d[d.varType])),
      update =>
        update.transition()
        .duration(TRANSITION_DURATION)
        .attr("x", d => xVarScale(d[d.varType])+xYearScale(d.year))
        .attr("y", d => yScale(d.studentCount))
        .attr("width", xVarScale.bandwidth())
        .attr("height", d=> nHEIGHT-yScale(d.studentCount))
        .style("fill", d => colorScale(d[d.varType])),
      exit => 
        exit.transition()
        .duration(0)
        .remove()
  )

  let types = getPossibleValues(data, xvar);
  console.log(types);

  
  let legendScale = d3.scaleBand()
    .domain(types)
    .range([MARGIN.top, MARGIN.top + LEGEND_COLOR_SYMBOL_HEIGHT*types.length])
    .paddingInner(1);    

  svg.selectAll("rect.legend").data(types)
      .join(
        enter => enter.append("rect")
          .attr("class", "legend")
          .attr("x", 10)
          .attr("y", d => (legendScale(d)))
          .attr("width", LEGEND_COLOR_SYMBOL_HEIGHT)
          .attr("height", LEGEND_COLOR_SYMBOL_HEIGHT)
          .attr("fill", d => colorScale(d)),
        update => update
          .attr("x", 10)
          .attr("y", d => (legendScale(d)))
          .attr("width", LEGEND_COLOR_SYMBOL_HEIGHT)
          .attr("height", LEGEND_COLOR_SYMBOL_HEIGHT)
          .attr("fill", d => colorScale(d)),
        exit => exit.remove()
      )

  svg.selectAll("text.legend").data(types)
  .join(
    enter => enter.append("text")
      .attr("class", "legend")
      .attr("x", 3*LEGEND_COLOR_SYMBOL_HEIGHT)
      .attr("y", d => (legendScale(d)+LEGEND_COLOR_SYMBOL_HEIGHT))
      .attr("font-family", "sans-serif")
      .attr("font-size", `${LEGEND_COLOR_SYMBOL_HEIGHT-1}px`)
      .text(d => d),
    update => update
      .attr("x", 3*LEGEND_COLOR_SYMBOL_HEIGHT)
      .attr("y", d => (legendScale(d)+LEGEND_COLOR_SYMBOL_HEIGHT))
      .attr("font-family", "sans-serif")
      .attr("font-size", `${LEGEND_COLOR_SYMBOL_HEIGHT-1}px`)
      .text(d => d),
    exit => exit.remove()
  )


  console.log("marker3");

}