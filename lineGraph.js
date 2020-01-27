
class LineGraph extends Grapher {
	constructor(data, xVar, yVar, margin, title) {
		super("linegraphsvg", data, margin);
		this.y_var = yVar;
		this.x_var = xVar;
		
		this.drawPadding = 10;
		
		this.title = title;
		
		this.yearFlattenedData = this.getYearData();
				
		this.xScale = d3.scaleLinear()
			.domain(d3.extent(this.yearFlattenedData.map(e => e.x)))
			.range([this.drawRect.left, this.drawRect.right]);
			
		this.yScale = d3.scaleLinear()
			.domain([0, d3.extent(this.yearFlattenedData.map(e => e.y))[1]])
			.range([this.drawRect.bottom, this.drawRect.top]);
		
		this.bottomAxis = this.svg.append("g").call(d3.axisBottom(this.xScale)).attr("transform", `translate(0, ${this.drawRect.bottom+this.drawPadding})`);
		this.leftAxis = this.svg.append("g").call(d3.axisLeft(this.yScale)).attr("transform", `translate(${this.drawRect.left-this.drawPadding}, 0)`);
		
	}
	
	getStackData() {
		let rollup = d3.rollup(this.data, v => d3.sum(v, d => d[STUDENT_COUNT_COLUMN_NAME]), d => d[YEAR_COLUMN_NAME], d => d[this.category]);
		let dataFormatted = [];
		
		//https://medium.com/@louisemoxy/how-to-create-a-stacked-area-chart-with-d3-28a2fee0b8ca
		rollup.forEach((v, k, m) => {
			
			let newObj = {
				year: k
			};
			
			let subGroupMap = v;
			
			subGroupMap.forEach((val, key) => {
				newObj[key] = val;
			});
			
			dataFormatted.push(newObj);
			
		});
		console.log(getPossibleValues(this.data, this.category));
		const stack = d3.stack().keys(getPossibleValues(this.data, this.category));
		const stackedValues = stack(dataFormatted);
		
		let stackData = [];
		
		stackedValues.forEach((layer, index) => {
			const currentStack = { group: layer.key, data : []};
			layer.forEach((d, i) => {
				currentStack.data.push({
					values: d,
					year: d.data.year
				});
			});
			stackData.push(currentStack);
		});
		return stackData;
	}
	
	updateSize() {
		this.xScale.domain(d3.extent(this.yearFlattenedData.map(e => e.x)))
			.range([this.drawRect.left, this.drawRect.right]);
			
		this.yScale.domain([0, d3.extent(this.yearFlattenedData.map(e => e.y))[1]])
			.range([this.drawRect.bottom, this.drawRect.top]);
	}
	
	//https://medium.com/@louisemoxy/how-to-create-a-stacked-area-chart-with-d3-28a2fee0b8ca
	showStacked() {		
		let stackData = this.getStackData();
		
		let types = getPossibleValues(this.data, this.category);
		
		let color = genColorScale(types, d3.interpolateViridis, [0, 100]);
		
		const area = d3.area()
			.x(d => this.xScale(d.year))
			.y0(d => this.yScale(d.values[0]))
			.y1(d => this.yScale(d.values[1]))
		
		console.log(stackData);
		
		let g = this.makeLegend(types, color, 10);
		g.attr("transform", `translate(${this.drawRect.right}, ${this.drawRect.top})`);
		
		const series = this.svg.selectAll(".series")
			.data(stackData)
			.join(
				enter => enter
					.append("path")
					.style("fill", d => color(d.group))
					.transition()
					.duration(1000)
					.attr("class", "series")
					.attr("d", d => area(d.data)),
				update => update
					.style("fill", d => color(d.group))
					.transition()
					.duration(1000)
					.attr("d", d => area(d.data)),
				exit => exit
					.remove()
					);
		
	}
	
	getYearData() {
		let rollupMap = d3.rollup(this.data, v => d3.sum(v, d => d[this.y_var]), d => d[this.x_var]);
		console.log("line data");
		console.log(rollupMap);
		let arr = [];
		
		rollupMap.forEach((value, key, map) => {
			arr.push({
				x: key,
				y: value,
			});
		});
		
		return arr;
	}
	
	update() {
		this.showStacked();
	}
}