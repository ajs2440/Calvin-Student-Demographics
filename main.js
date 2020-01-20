const data = d3.csv('simple_2007_2019.csv')
.then(function(data) {
    console.log(data);
})
.catch(function(error){
    console.log("Error thrown.");
});
console.log("it worked");