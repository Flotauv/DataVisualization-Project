// set the dimensions and margins of the graph
const margin = {top: 10, right: 30, bottom: 40, left: 70},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Adding SVG (Scalable Vector Graphics)
// Met à l'échelle un graphique si la personne zoom ou dézoom sur la page
// noté <sv> sur un fichier .html

// append the svg object to the body of the page
const svg = d3.select("section.Zone-carte")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("db_Auvergne_Rhone_Alpes.csv").then(function(data) {
    console.log(data)});