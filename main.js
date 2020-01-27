

const WIDTH = 800;
const HEIGHT = 640;

const MARGIN = { left: 20, top: 10, right: 20, bottom: 100 };
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
const REMOVED_DATA = [STUDENT_COUNT_COLUMN_NAME, YEAR_COLUMN_NAME];

let widgets = [];

var tooltip = d3.select("#visual")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")


const getPossibleValues = (d, k) => {
  return Array.from(
    new Set(d.map(e => e[k]))
  );
}

function genColorScale(possibleValues, d3ColorScheme, range) {
  let ordinalVarScale = d3.scaleBand().domain(possibleValues).range(range);
  let colorScale = d3.scaleSequential().domain([0,100]).interpolator(d3ColorScheme);

  const func = value => {
    return colorScale(ordinalVarScale(value));
  }

  return func;
}

const yearIsMain = () => {
  return d3.select("#x-sub-var").property("value") == "Per Year";
}


const getDoubleGroupedData = (data, xvar, xgroup) => {
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


function setup(data) {
	
	d3.select("#x-var")
		.selectAll("option")
		.data(Object.keys(data[0]).filter(e => !REMOVED_DATA.includes(e)))
		.enter()
		.append("option")
		.attr("value", d => d)
		.text(d => getNicerText(d));
	
	d3.selectAll("#x-var")
		.on("change", function(d) {
			widgets.forEach(w => w.updateCategory(d3.select(this).property("value")));
		});
	
	let g = new GroupedBarChart("barchart", data, {
		left: 50,
		right: 200,
		bottom: 200,
		top: 20
	});
	
	pieGraph = new PieChart("piechartsvg", data, {
		left: 10,
		right: 10,
		bottom: 10,
		top: 10
	});
	
	let lineGraph = new LineGraph(data, YEAR_COLUMN_NAME, STUDENT_COUNT_COLUMN_NAME, 
		{
			left: 50,
			right: 300,
			top: 50,
			bottom: 40
		}
	);
	
	
	widgets = [g, pieGraph, lineGraph];
	
	
}

function cleanupData(data) {
  return data.map(d => {
    d["StudentCount"] = +d["StudentCount"];
    d[YEAR_COLUMN_NAME] = +d[YEAR_COLUMN_NAME];
    return d;
  });
}

