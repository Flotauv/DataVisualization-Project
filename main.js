

// ================= PAGE 1 =================== //
// ====== Initialisation des constantes ==== //

const width_page1 = 1450;
const height_page1 = 600;

const svg_page1 = d3.select('svg')
    .attr('width',width_page1)
    .attr('height',height_page1);

// Projection centrée Rhône-Alpes
const projection = d3.geoMercator()
  .center([4.5, 45.5]) // centré Rhône-Alpes
  .scale(8000)          // zoom
  .translate([width_page1 / 2, height_page1 / 2]);

// Projection des contours des départements
const path = d3.geoPath().projection(projection);

// Tooltip pour le style de la carte 
const tooltip = d3.select("#tooltip");

// Slider DOM
const yearSlider = d3.select("#year_slider");
const yearLabel = d3.select("#year_label");

// Échelle couleur
const colorScale = d3.scaleSequential()
  .domain([7000, 0]) // adapter à ton dataset
  .interpolator(d3.interpolateRdYlGn)
  .unknown("#ccc");

// load csv 
Papa.parse("db_Auvergne_Rhone_Alpes.csv", {
    download : true,
    header : true, // important sinon il charge les éléments [] et non entre {}
    delimiter :",",
    complete : function(results) {
        console.log("CSV chargé  :",results.data)
        const data = results.data;

        // Extraire les années uniques triées
        const years = [... new Set(data.map(d => d.annee))].sort();
        console.log("Années dispo :",years)

        // Slider des années
        yearSlider
            .attr("min",0)
            .attr("max",years.length-1)
            .attr("value",0);

        // Valeur par défaut du slider 
        yearLabel.text(years[0]);
        

        d3.json("dataset/departements-auvergne-rhone-alpes.geojson").then(geojson => {
            console.log("GeoJSON Chargé",geojson)

            // Création de la fonction de mise à jour de la carte suivant l'année

            function UpdateMap(selectedYear){
                console.log("Année selectionnée :", selectedYear);

                // variable très importante car c'est le dataset filtrer selon l'année choisi par l'utilisateur.
                const filtered = data.filter(d =>
                    d.annee === selectedYear && 
                    d.Type === "Délit"
                );
                // Récupération des délits mais à changer plus tard 
                const delits = {};
                filtered.forEach(d => {
                    const code_dpt = d.Code_departement?.padStart(2,"0");
                    const nombre = parseInt(d.nombre) || 0;
                    delits[code_dpt] = (delits[code_dpt] || 0) + nombre;
                    
                });
                console.log("code_dpt et nb de délits",delits)
            





                const paths = svg_page1.selectAll("path")
                    .data(geojson.features);

                paths.enter()
                    .append("path")
                    .merge(paths)
                    .attr("d", path)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)
                    .on("mousemove",(event,d)=>{
                        const code_dpt = d.properties.code; // ici ce sont les données geoJSON qui sont appelées 'd' et elle ont un attribut 'properties' avec le code et le nom du département
                        const nom = d.properties.nom;
                        const count = delits[code_dpt] || 0 ; // à changer ici peut être 
                        tooltip.style("opacity", 1)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY + 10) + "px")
                            .html(`<strong>${nom}</strong><br>${count} délits`);


                    })
                    
                    .on("mouseout", () => tooltip.style("opacity", 0))
                    .transition()
                    .duration(500)
                    .attr("fill", d => colorScale(delits[d.properties.code] || 0));
                    

            }
            
            // Initialisation
            UpdateMap(years[0]);

            
            // Mise à jour avec le slider
            yearSlider.on("input", (event) => {
                const index = +event.target.value;
                const selectedYear = years[index];
                yearLabel.text(selectedYear);
                UpdateMap(selectedYear);
            });
            

        });



    
    }
});




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










