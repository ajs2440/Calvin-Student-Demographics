class Grapher {
	
	marginToRect() {
		return new Rectangle(this.margin.left, this.margin.top, this.totalWidth-this.margin.left-this.margin.right, this.totalHeight - this.margin.top - this.margin.bottom);
	}
	
	makeLegend(ordinalData, colorScale, size) {
		
		//make legend
		let legendScale = d3.scaleBand()
			.domain(ordinalData)
			.range([MARGIN.top, MARGIN.top + size*ordinalData.length])
			.paddingInner(1);    
		
		let legendBox = this.svg.selectAll(".legendWhatever").data([1]).enter().append("g").attr("class", "legendWhatever");
		
		console.log(legendBox);

		//make color symbols for legend
		legendBox.selectAll("circle.legend").data(ordinalData)
			.join(
				enter => enter.append("circle")
				  .attr("class", "legend")
				  .attr("cx", 10)
				  .attr("cy", d => {console.log("creating"); return(legendScale(d))})
				  .attr("r", 5)
				  .style("fill", d => this.colorScale(d)),
				update => update
				  .attr("cx", 10)
				  .attr("cy", d => {console.log("Updating!"); return(legendScale(d))})
				  .attr("r", 5)
				  .style("fill", d => this.colorScale(d)),
				exit => exit.remove()
		)

		//make text for legend
		legendBox.selectAll("text.legend").data(ordinalData)
			.join(
				enter => enter.append("text")
					.attr("class", "legend")
					.attr("x", 3*size)
					.attr("y", d => (legendScale(d)+size))
					.attr("font-family", "sans-serif")
					.attr("font-size", `${size-1}px`)
					.text(d => d),
				update => update
					.attr("x", 3*size)
					.attr("y", d => (legendScale(d)+size))
					.attr("font-family", "sans-serif")
					.attr("font-size", `${size-1}px`)
					.text(d => d),
				exit => exit.remove()
		)
		
		return legendBox;
	}
	
	constructor(svgID, data, margin) {
		this.id = svgID;
		this.margin = margin;
		this.svg = d3.select(`svg#${svgID}`);
		this.setDimensions();
		this._data = data;
		this._legendContainer = this.svg.append("g");
	}
	
	setDimensions() {
		let boundingBox = this.svg.node().getBoundingClientRect();
		this.totalWidth = boundingBox.width;
		this.totalHeight = boundingBox.height;
		this.drawRect = this.marginToRect();
	}
	
	resize() {
		this.setDimensions();
		this.updateSize();
	}
	
	updateSize() {
		throw "method updateScales not implemented";
	}
	
	updateCategory(category) {
		this.category = category;
		this.update();
	};
	
	get data() {
		return this._data;
	}
	
	update() {
		console.log("Warning: method update has not been implemented.");
	}
	
}