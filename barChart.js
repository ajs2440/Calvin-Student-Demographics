

let transition_count_hack = 0;

class GroupedBarChart extends Grapher {

	fade(opacity, selectedBar) {
		d3.selectAll(".bar")
			.filter(function (d, i) { 
			  return selectedBar !== d
			 })
			.transition()
			.duration(HOVER_TRANSITION_DURATION)
			.style("opacity", opacity);
	};

	// show tooltip displaying bar info on a mouseover
	mouseOver(d) {
	  tooltip
		.html(d.mainvarname + ": " + d.mainvar + ", " +
		  d.subvarname + ": " + d.subvar + ", " +
		  " Count = " + d.studentCount + " students.")
		  .transition(HOVER_TRANSITION_DURATION)
		  .style("opacity", 1)
	}

	// hide tooltip on a mouseleave
	mouseLeave(d) {
	  tooltip
		.transition(HOVER_TRANSITION_DURATION)
		.style("opacity", 0)
	}


	getCurrentDoubleData(data) {
		let xvar = d3.select("#x-var").property("value");
		let xmainvar = d3.select("#x-sub-var").property("value")
		return xmainvar == "Per Year" ? this.getDoubleGroupedData(data, xvar, YEAR_COLUMN_NAME) : this.getDoubleGroupedData(data, YEAR_COLUMN_NAME, xvar);
	}

    getPossibleCurrentValues(data) {
		return getPossibleValues(data, this.getSubVar(data));
	}

	getMainVar() {
		let xvar = d3.select("#x-var").property("value");
		return yearIsMain() ? YEAR_COLUMN_NAME : xvar;
	}

	getSubVar() {
		let xvar = d3.select("#x-var").property("value");
		return yearIsMain() ? xvar : YEAR_COLUMN_NAME;
	}


	getDoubleGroupedData(data, xvar, xgroup) {
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
	
	constructor(svgID, data, margins) {
		super(svgID, data, margins);
		this.drawPadding = 10;
		this.setup();
	}
	
	setup() {
		//grouping
		d3.select("#x-sub-var")
			.on("change", d => this.update())
			.selectAll("option")
			.data(["Per Year", "Year Per"])
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => getNicerText(d));

		let flattenedData = this.getDoubleGroupedData(data, this.getMainVar(data), this.getSubVar(data));
	
		console.log("marker");
	
		this.xGroupScale = d3.scaleBand()
			.domain(flattenedData.map(e => e.mainvar))
			.range([this.drawRect.left, this.drawRect.right])
			.paddingInner(.1);
		

		this.xVarScale = d3.scaleBand()
			.domain(flattenedData.map(e => e.subvarname))
			.range([0, this.xGroupScale.bandwidth()])
			.paddingInner(.1);

		//todo
		let range = d3.extent(flattenedData.map(e => e.studentCount));

		this.yScale = d3.scaleLinear()
			.domain([range[0], range[1]])
			.range([this.drawRect.bottom, this.drawRect.top]);

		this.svg.append("g")
			.attr("class", "x axis")
			.attr("transform", `translate(0, ${this.drawRect.bottom+this.drawPadding})`)
			.call(d3.axisBottom(this.xGroupScale))

		this.svg.append("g")
			.attr("class", "y axis")
			.attr("transform", `translate(${this.drawRect.left-this.drawPadding}, 0)`)
			.call(d3.axisLeft(this.yScale));

		this.update();
	}
	
	update() {
		let flattenedData = this.getCurrentDoubleData(data);
		let types = this.getPossibleCurrentValues(data);
		
		console.log(flattenedData);
		
		//update x axis
		this.xGroupScale.domain(flattenedData.map(e => e.mainvar))
		this.svg.select(".x.axis")
			.call(d3.axisBottom(this.xGroupScale))

		//update sub x axis
		this.xVarScale.domain(flattenedData.map(e => e.subvar))
			.range([0, this.xGroupScale.bandwidth()])

		//update y axis
		let range = d3.extent(flattenedData.map(e => e.studentCount));

		//set y scale
		this.yScale.domain([0, range[1]])  
		this.svg.select(".y.axis").transition("ytrans").duration(TRANSITION_DURATION)
			.call(d3.axisLeft(this.yScale));


		//ordinal to color
		this.colorScale = genColorScale(types, d3.interpolateViridis, [0, 100]);

		//https://stackoverflow.com/questions/45211408/making-a-grouped-bar-chart-using-d3-js
		this.svg
			.selectAll("rect.bar")
			.data(flattenedData)
			.join(
				enter => enter
						.append("rect")
							.on("mouseover", (d) => {
								this.fade(.4, d);
								this.mouseOver(d);
							}
							)
							.on("mouseleave", (d) =>  {
								this.fade(1, d);
								this.mouseLeave(d);
							})
							.attr("class", "bar")
							.attr("x", d => this.xGroupScale(d.mainvar)+this.xVarScale(d.subvar))
							.attr("y", d => this.yScale(d.studentCount))
							.attr("width", d => this.xVarScale.bandwidth())
							.attr("height", d=> this.drawRect.bottom-this.yScale(d.studentCount))
							.style("fill", d =>this.colorScale(d.subvar)),
				update =>
					update.transition("bartrans")
						.duration(TRANSITION_DURATION)
						.attr("x", d => ((d.subvarname == this.getMainVar()) ? this.xGroupScale(d.mainvar) : this.xGroupScale(d.mainvar)+this.xVarScale(d.subvar)))
						.attr("y", d => this.yScale(d.studentCount))
						.attr("width", d => ((d.subvarname == this.getMainVar()) ? this.xGroupScale.bandwidth() : this.xVarScale.bandwidth()))
						.attr("height", d=> this.drawRect.bottom-this.yScale(d.studentCount))
						.style("fill", d =>this.colorScale(d.subvar)),
				exit => 
					exit.transition("bartrans")
					.duration(0)
					.remove()
				)

		console.log("===============");
		console.log(types);
		
		this.makeLegend(types, this.colorScale, 10).attr("transform", `translate(${this.totalWidth/2}, ${this.totalHeight/2})`);
	}
	

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


