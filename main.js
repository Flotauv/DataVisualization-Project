// set the dimensions and margins of the graph
//const margin = {top: 10, right: 30, bottom: 40, left: 70},
    //width = 800 - margin.left - margin.right,
    //height = 600 - margin.top - margin.bottom;


// ================= PAGE 1 =================== //
// Dimensions communes à la page 1

const width_page1 = 600;
const height_page1 = 500;

const svg_page1 = d3.select('#graph-page1')
    .append("svg")
    .attr("widtg",width_page1)
    .attr('height',height_page1)
    .style("background", "#f9f9f9")
    
    
d3.json("dataset/region-auvergne-rhone-alpes.geojson").then(function(data) {
    console.log("Données GeoJSON chargé",data)
});
    // Création de la carte en pixel
    const projection = d3.geoMercator()
        .fitSize([width_page1,height_page1],data);

    // Création des chemins pour dessiner la carte
    const path = d3.geoPath().projection(projection);
    
    // Échelle couleur
    const colorScale = d3.scaleSequential()
        .domain([7000, 0]) // plus c’est haut, plus c’est rouge
        .interpolator(d3.interpolateRdYlGn)
        .unknown("#ccc");
    
    // Dessiner les départements
    svg_page1.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#cce5df")
        .attr("stroke", "#333")
        .attr("stroke-width", 0.5);


// ================= PAGE 2 =================== //
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
d3.csv("db_Auvergne_Rhone_Alpes.csv").then(function(donnees) {
    donnees.forEach(function(d){
        d.annee = +Number(d.annee);
        d.Code_departement = +Number(d.Code_departement);
        d.nombre = +Number(d.nombre)

        
    });
    console.log(donnees)});










