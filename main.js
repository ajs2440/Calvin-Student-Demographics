let svg;

const WIDTH = 800;
const HEIGHT = 640;

const MARGIN = { left: 100, top: 10, right: 20, bottom: 100 };
const nWIDTH = WIDTH - MARGIN.left - MARGIN.right;
const nHEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;

const BORDER_COLOR = "gray";
const BORDER_SIZE = 4;
const SHOW_TIME = 500;
const TRANSITION_DURATION = 1000;

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
  
  

    d3.selectAll(".data_parameter")
      .on("change", () => update(data));

    console.log(data);
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
let ordinalVarScale;
let colorScale;


function genColorScale(possibleValues, d3ColorScheme) {
  let ordinalVarScale = d3.scaleOrdinal().domain(possibleValues).range(possibleValues.map((v, i, n) => {
    return i/n.length*100;
  }));
  return d3.scaleSequential().domain([0,100]).interpolator(d3ColorScheme);
}

const getPossibleValues = (d, k) => {
  return Array.from(
    new Set(d.map(e => e[k]))
  );
}

function update(data) {

  console.log(getPossibleValues(data, "Academic Year"));
  console.log(data);

  let xvar = d3.select("#x-var").property("value");

  let formattedData = d3.rollup(data, v => d3.sum(v, d => d[STUDENT_COUNT_COLUMN_NAME]), d => d[YEAR_COLUMN_NAME], d => d[xvar]);
  
  //not necessary but makes extraction easier by converting it to an array
  let normalData = Array.from(formattedData.keys())
    .map(e => 
      (
        {
          year: e,
          yearMap: formattedData.get(e)//nested data
        }
      )
    );
  
  let flattenedData = [];

  normalData.forEach(yearData => {

    //get nested data
    let yearSpecificData = yearData.yearMap;
    
    //loop through nested data and push flattened data to array
    Array.from(yearSpecificData.keys()).forEach(d => {
      
      flattenedData.push({
        year: yearData.year,
        varname: nicerText[xvar],
        studentcount: yearSpecificData.get(d),
        varvalue: d
      })

    });    

  });
  console.log(normalData[0])

  xYearScale = d3.scaleBand()
    .domain(flattenedData.map(e => e.year))
    .range([MARGIN.left, nWIDTH])
    .paddingInner(.3);

  console.log(d3.extent(flattenedData.map(e => e.year)));

  xVarScale = d3.scaleBand()
    .domain(Array.from(normalData[0].yearMap.keys()))
    .range([0, xYearScale.bandwidth()])
    .paddingInner(.1);

  
    console.log("Marker 111");

  console.log(normalData[0].year);

  

  svg.append("g")
    .attr("")

  let range = d3.extent(flattenedData.map(e => e.studentcount));

  yScale = d3.scaleLinear()
    .domain([range[0]-10, range[1]+10])
    .range([nHEIGHT, MARGIN.bottom]);

  let types = Array.from(normalData[0].yearMap.keys());
  console.log(types);
  console.log(types.map((v, i, n) => {
    console.log(v);
    console.log(i);
    console.log(n);
    
    return i/n.length*100;
  }))

  console.log(Array.from(normalData[0].yearMap.keys()));


  svg.append("g")
    .attr("transform", `translate(0, ${nHEIGHT})`)
    .call(d3.axisBottom(xYearScale))

  svg.append("g")
    .attr("transform", `translate(0, ${nHEIGHT+20})`)
    .call(d3.axisLeft(yScale));


  //ordinal to color
  colorScale = genColorScale(types, d3.interpolateRainbow);
  
  //https://stackoverflow.com/questions/45211408/making-a-grouped-bar-chart-using-d3-js
  svg.selectAll("rect.bar").data(flattenedData).join(
    enter => enter
      .append("rect")
      .classed("bar", true)
      .transition() 
      .duration(TRANSITION_DURATION)
        .attr("x", d => xVarScale(d.varvalue)+xYearScale(d.year))
        .attr("y", d => yScale(d.studentcount))
        .attr("width", xVarScale.bandwidth())
        .attr("height", d=> nHEIGHT-yScale(d.studentcount))
        .style("fill", d => colorScale(ordinalVarScale(d.varvalue)))
       ,
    update =>
      update.transition()
      .duration(TRANSITION_DURATION)
      .attr("x", d => xVarScale(d.varvalue)+xYearScale(d.year))
      .attr("y", d => yScale(d.studentcount))
      .attr("width", xVarScale.bandwidth())
      .attr("height", d=> nHEIGHT-yScale(d.studentcount))
      .style("fill", d => colorScale(ordinalVarScale(d.varvalue))),
    exit => 
      exit.transition()
      .duration(0)
      .remove()
  )
  console.log("marker3");

}


