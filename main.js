let svg;

const WIDTH = 800;
const HEIGHT = 640;

const MARGIN = { left: 100, top: 10, right: 20, bottom: 100 };
const nWIDTH = WIDTH - MARGIN.left - MARGIN.right;
const nHEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const BORDER_COLOR = "gray";
const BORDER_SIZE = 4;
const SHOW_TIME = 1000;
const TRANSITION_DURATION = 100;
const HOVER_TRANSITION_DURATION = 400;


const LEGEND_COLOR_SYMBOL_HEIGHT = 10;
const YEAR_COLUMN_NAME = "Academic Year";
const STUDENT_COUNT_COLUMN_NAME = "StudentCount";
const REMOVED_DATA = ["StudentCount"];

let transition_count_hack = 0;

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

var tooltip = d3.select("#visual")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")


function fade(opacity, selectedBar) {
  d3.selectAll(".bar")
    .filter(function (d, i) { return selectedBar !== d 
      && selectedBar.studentCount !== d.studentCount
     })
    .transition()
    .duration(HOVER_TRANSITION_DURATION)
    .style("opacity", opacity);
};

// fade out other bars when mouse hovers over this bar
var mouseover = function (d) {
  // transition_count_hack += 1;
  // d3.selectAll(".bar")
  //   .filter(function(d, i) { return  })
  //   .transition(`${transition_count_hack}`)
  //   .duration(HOVER_TRANSITION_DURATION)
  //   .style("opacity", 0.3)
    
  // transition_count_hack += 1;
  // d3.select(this)
  //   .transition(`${transition_count_hack}`)
  //   .duration(HOVER_TRANSITION_DURATION)
  //   .style("opacity", 1)

  tooltip
    .html(d.mainvarname + ": " + d.mainvar + ", " +
      d.subvarname + ": " + d.subvar + ", " +
      " Count = " + d.studentCount + " students.").style("opacity", 1)
}

// set opacity back to normal when mouse is not over any bar
var mouseleave = function (d) {
  // transition_count_hack += 1;
  // d3.selectAll(".bar")
  //   .transition(`${transition_count_hack}`)
  //   .duration(HOVER_TRANSITION_DURATION)
  //   .style("opacity", 1)

  tooltip
    .style("opacity", 0)
}

function getNicerText(d) {
  return nicerText[d] != undefined ? nicerText[d] : d;
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
  svg = d3.select("#visual").select("svg#barchart")
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
    .text(d => getNicerText(d));

  d3.select("#x-sub-var")
    .selectAll("option")
    .data(["Per Year", "Year Per"])
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => getNicerText(d));
  
  
  let xvar = d3.select("#x-var").property("value");
  let xmainvar = d3.select("#x-sub-var").property("value")

  let flattenedData = xmainvar == "Per Year" ? flattenData(data, xvar, YEAR_COLUMN_NAME) : flattenData(data, YEAR_COLUMN_NAME, xvar);

  xGroupScale = d3.scaleBand()
    .domain(flattenedData.map(e => e.mainvar))
    .range([MARGIN.left, nWIDTH])
    .paddingInner(.3);


  xVarScale = d3.scaleBand()
    .domain(flattenedData.map(e => e[e.subvarname]))
    .range([0, xGroupScale.bandwidth()])
    .paddingInner(.1);

  let range = d3.extent(flattenedData.map(e => e.studentCount));

  yScale = d3.scaleLinear()
    .domain([range[0], range[1]])
    .range([nHEIGHT, MARGIN.bottom]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${nHEIGHT+4})`)
    .call(d3.axisBottom(xGroupScale))

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
let xGroupScale;
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

const yearIsMain = () => {
  return d3.select("#x-sub-var").property("value") == "Per Year";
}

const getMainVar = () => {
  let xvar = d3.select("#x-var").property("value");
  return yearIsMain() ? YEAR_COLUMN_NAME : xvar;
}

const getSubVar = () => {
  let xvar = d3.select("#x-var").property("value");
  return yearIsMain() ? xvar : YEAR_COLUMN_NAME;
}

const flattenData = (data, xvar, xgroup) => {
  let pValues = getPossibleValues(data, xvar);
  let rollup = d3.rollup(data, v => d3.sum(v, d => d[STUDENT_COUNT_COLUMN_NAME]), d => d[xgroup], d => d[xvar]);
  
  let flat = [];
  rollup.forEach((map, currentGroup) => {

    let givenValues = Array.from(map.keys());

    pValues.forEach(pValue => {
      let row = {
        mainvar:  currentGroup,
        subvar: pValue,
        studentCount: givenValues.includes(pValue) ?  map.get(pValue) : 0,
        subvarname: xvar,
        mainvarname: xgroup,
      }
      flat.push(row);
    })
    
  })
  return flat;
}

const getFlattenedData = (data) => {
  let xvar = d3.select("#x-var").property("value");
  let xmainvar = d3.select("#x-sub-var").property("value")
  return xmainvar == "Per Year" ? flattenData(data, xvar, YEAR_COLUMN_NAME) : flattenData(data, YEAR_COLUMN_NAME, xvar);
}

const getPossibleCurrentValues = (data) => {
  console.log(getSubVar(data));
  return getPossibleValues(data, getSubVar(data));
}

function update(data) {

  let flattenedData = getFlattenedData(data);
  let types = getPossibleCurrentValues(data);

  //update x axis
  xGroupScale.domain(flattenedData.map(e => e.mainvar))
  svg.select(".x.axis")
    .call(d3.axisBottom(xGroupScale))

  xVarScale.domain(flattenedData.map(e => e.subvar))
  .range([0, xGroupScale.bandwidth()])

  //update y axis
  let range = d3.extent(flattenedData.map(e => e.studentCount));
  
  //for line chart, set max to total student count per year that is max
  let maxStudentCountYear = flattenData(data, YEAR_COLUMN_NAME, YEAR_COLUMN_NAME);

  yScale.domain([0, range[1]])  
  svg.select(".y.axis").transition("ytrans").duration(TRANSITION_DURATION)
    .call(d3.axisLeft(yScale));

  
  //ordinal to color
  colorScale = genColorScale(types, d3.interpolateViridis, [0, 100]);
  

  //https://stackoverflow.com/questions/45211408/making-a-grouped-bar-chart-using-d3-js
  svg
  .selectAll("rect.bar")
  .data(flattenedData)
  .join(
    enter => enter
      .append("rect")
          .on("mouseover", function(d) { 
            fade(.4, d);
            // mouseover();
          })
          .on("mouseleave", function(d) { 
            fade(1, d);
            // mouseleave();
          })
          .attr("class", "bar")
          .attr("x", d => ((d.subvarname == getMainVar()) ? xGroupScale(d.mainvar) : xGroupScale(d.mainvar)+xVarScale(d.subvar)))
          .attr("y", d => yScale(d.studentCount))
          .attr("width", d => ((d.subvarname == getMainVar()) ? xGroupScale.bandwidth() : xVarScale.bandwidth()))
          .attr("height", d=> nHEIGHT-yScale(d.studentCount))
          .style("fill", d => colorScale(d.subvar)),
      update =>
        update.transition("bartrans")
        .duration(TRANSITION_DURATION)
        .attr("x", d => ((d.subvarname == getMainVar()) ? xGroupScale(d.mainvar) : xGroupScale(d.mainvar)+xVarScale(d.subvar)))
        .attr("y", d => yScale(d.studentCount))
        .attr("width", d => ((d.subvarname == getMainVar()) ? xGroupScale.bandwidth() : xVarScale.bandwidth()))
        .attr("height", d=> nHEIGHT-yScale(d.studentCount))
        .style("fill", d => colorScale(d.subvar)),
      exit => 
        exit.transition("bartrans")
        .duration(0)
        .remove()
  )
  
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

}