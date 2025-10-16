// set the dimensions and margins of the graph
//const margin = {top: 10, right: 30, bottom: 40, left: 70},
    //width = 800 - margin.left - margin.right,
    //height = 600 - margin.top - margin.bottom;


// ================= PAGE 1 =================== //
// ====== Initialisation des constantes ==== //

const width_page1 = 950;
const height_page1 = 700;

const svg_page1 = d3.select('svg')
    .attr('width',width_page1)
    .attr('height',height_page1);

// Projection centrée Rhône-Alpes
const projection = d3.geoMercator()
  .center([4.5, 45.75]) // centré Rhône-Alpes
  .scale(8000)          // zoom
  .translate([width_page1 / 2, height_page1 / 2]);

const path = d3.geoPath().projection(projection);

  // Slider DOM
const yearSlider = d3.select("#yearSlider");
const yearLabel = d3.select("#yearLabel");

// Couleurs de remplissage (0 → max)
const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 5000]); 

// load csv 
Papa.parse("db_Auvergne_Rhone_Alpes.csv", {
    download : true,
    delimiter :",",
    complete : function(results) {
        console.log("CSV chargé v2 :",results.data)
        const data = results.data;

        d3.json("dataset/departements-auvergne-rhone-alpes.geojson").then(geojson => {
            const paths = svg_page1.selectAll("path")
                .data(geojson.features);

            paths.enter()
                .append("path")
                .merge(paths)
                .attr("d", path)
                .attr("stroke", "#fff")
                .attr("stroke-width", 1)

        })



    
    }
})




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











