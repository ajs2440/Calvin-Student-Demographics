const svg = d3.select("svg#jacob");

dataPromise.then(myBarChart);

function myBarChart(d) {
    console.log("Loading bar chart");
    setupBarChart(d);
};

function setupBarChart(data) {

}

function updateBarChart(xvar, year) {
    console.log("My listener worked!");
    console.log(xvar);
    console.log(year);
}


addListener(updateBarChart);