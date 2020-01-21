dataPromise.then(d => () => myBarChart(d));

const myBarChart = (data) => {
    console.log("My function")
    console.log(data);
};