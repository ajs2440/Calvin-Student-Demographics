
class PieChart extends Grapher {
	constructor(svgID, data, margins) {
		super(svgID, data, margins);

		//https://www.tutorialsteacher.com/d3js/create-pie-chart-using-d3js
		// Generate the arcs
		this.radiusDefinition = d3.arc()
					.innerRadius(this.totalWidth / 4)
					.outerRadius(this.totalWidth / 2 - margins.left - margins.right);
	
		this.container = this.svg.append("g");
		this.container.attr("transform", `translate(${this.totalWidth/2}, ${this.totalHeight/2})`);
		
		d3.selectAll("#year_slider")
		.on("change", (d) => this.update());
		
		this.update();
	}
	
	getPieData() {
		//get student counts per category per year
		let rollup = d3.rollup(this.data, v => d3.sum(v, d => d[STUDENT_COUNT_COLUMN_NAME]), d => d[YEAR_COLUMN_NAME], d => d[this.category]);
		
		//narrow down to selected year
		let toYear = rollup.get(this.year);

		console.log("pieData");
		console.log(this.year);
		console.log(this.category);
		console.log(toYear);

		let toObj = {};
		
		toYear.forEach((value, key, map) => {
			toObj[key] = value;
		});

		//return object version
		return toObj;
	}
	
	updateSize() {
		this.radiusDefinition = d3.arc()
			.innerRadius(this.totalWidth / 4)
			.outerRadius(this.totalWidth / 2 - margins.left - margins.right);
		this.update();
	}
	
	update() {
		this.year = +d3.select("#year_slider").property("value");
		let rawData = this.getPieData();
		//https://www.d3-graph-gallery.com/graph/pie_changeData.html
		var pie = d3.pie()
			.sort(null)
			.value(function(d) {return d.value; });
	 
		let pieData = pie(d3.entries(rawData));


		let colorScale = genColorScale(getPossibleValues(this.data, this.category), d3.interpolateViridis, [0, 100]);
		
			// map to data
		var u = this.container.selectAll("path")
			.data(pieData).on("mouseover", function(d) {
				//d3.select(this).style("fill", "red");
			})

			// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
			u
			.enter()
			.append('path')
			.merge(u)
			.transition()
			.duration(1000)
			
			.attr('d', this.radiusDefinition)
			.attr('fill', d => colorScale(d.data.key))
			.attr("stroke", "white")
			.style("stroke-width", "2px")
			.style("opacity", 1)


			// remove the group that is not present anymore
			u
			.exit()
			.remove()
		
		console.log(rawData);
				
		
	}
	
}
