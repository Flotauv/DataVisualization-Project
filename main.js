// set the dimensions and margins of the graph
//const margin = {top: 10, right: 30, bottom: 40, left: 70},
    //width = 800 - margin.left - margin.right,
    //height = 600 - margin.top - margin.bottom;




// Dimensions communes à la page 2
const width_page2 = 300;
const height_page2 = 300;
const margin_page2 = { top: 20, right: 20, bottom: 30, left: 40 };

// Adding SVG (Scalable Vector Graphics) Met à l'échelle un graphique si la personne zoom ou dézoom sur la page
// Ajout d'un espace pour graphique dans les div de la section Graphique-page2
const svg_page2_graph1 = d3.select("#graph-page2-graph1")
    .append("svg")
    .attr("width", width_page2 + margin_page2.left + margin_page2.right)
    .attr("height", height_page2 + margin_page2.top + margin_page2.bottom)
    .append("g")
    .attr("transform", `translate(${margin_page2.left},${margin_page2.top})`);

const svg_page2_graph2 = d3.select("#graph-page2-graph2")
    .append("svg")
    .attr("width", width_page2 + margin_page2.left + margin_page2.right)
    .attr("height", height_page2 + margin_page2.top + margin_page2.bottom)
    .append("g")
    .attr("transform", `translate(${margin_page2.left},${margin_page2.top})`);
// lecture du fichier des départements de la région Auvergne Rhone Alpes
const db = d3.csv("db_Auvergne_Rhone_Alpes.csv").then(function(data) {
    data.forEach(function(d){
        d.annee = +Number(d.annee);
        d.Code_departement = +Number(d.Code_departement);
        d.nombre = +Number(d.nombre)

        
    });
    console.log(data)});

// à partir d'ici il a lu le fichier db =====> suite code







