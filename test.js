
// ================= DETECTION DE PAGE =================== //
const isCarte = document.getElementById("Carte") !== null;
const isCarte2 = document.getElementById("Carte2") !== null;
const isContexte = document.getElementById("Contexte") !== null;

    if (isCarte){
        console.log("On est sur la Carte")
    
    // ================= CARTE =================== //
    // ====== Initialisation des constantes ==== //

    const width_page1 = 1250; // largeur de la carte 
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
    .domain([100000, 0]) // il faudra mettre un point de reference 
    .interpolator(d3.interpolateRdYlGn)
    .unknown("#ccc");

    // load csv 
    Papa.parse("dataset/db_CrimesDelits.csv", {
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
                    sessionStorage.setItem("selectedYear",selectedYear);

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

                    
                    const paths = svg_page1.selectAll("path")
                        .data(geojson.features);

                    paths.enter()
                        .append("path")
                        .merge(paths)
                        .attr("d", path)
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1)
                        .on("mouseenter" ,(event,d) => {
                            d3.select(event.currentTarget)
                                .transition()
                                .duration(200)
                                .attr("stroke-width",2)
                                .attr("stroke","#333")
                                .attr("filter","brightness(1.2)");
                                
                        })
                        .on("mousemove",(event,d)=>{
                            const code_dpt = d.properties.code; // ici ce sont les données geoJSON qui sont appelées 'd' et elle ont un attribut 'properties' avec le code et le nom du département
                            const nom = d.properties.nom;
                            const count = delits[code_dpt] || 0 ; // à changer ici peut être 
                            tooltip.style("opacity", 1)
                                .style("left", (event.pageX + 10) + "px")
                                .style("top", (event.pageY + 10) + "px")
                                .html(`<strong>${nom}</strong><br>${count} délits`);


                        })
                        
                        .on("mouseleave", (event,d) =>{
                            d3.select(event.currentTarget)
                                .transition()
                                .duration(200)
                                .attr("strok-width",1)
                                .attr("stroke","#fff")
                                .attr("filter","brightness(1)");
                            tooltip.style("opacity",0);
                        })
                        .on("click",(event,d) => {

                            const code_dpt = d.properties.code;
                            const nom_dpt = d.properties.nom;
                            sessionStorage.setItem("code_dpt",code_dpt);
                            sessionStorage.setItem("nom_dpt",nom_dpt);
                            
                            


                            // Changer de fenêtre
                            window.location.href = "Carte2.html";

                        })
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
    })};




// ================= PAGE 2 =================== //
// Dimensions communes aux balises svg des graphes de la page 2


// récupération dynamiques des variables de la page 1
if (isCarte2){
    console.log("On est sur la carte2");

    let code_dpt = sessionStorage.getItem("code_dpt");
    let selectedYear = sessionStorage.getItem("selectedYear");
    let nom_dpt = sessionStorage.getItem("nom_dpt");

    const yearSlider = d3.select("#year_slider");
    const yearLabel = d3.select("#year_label");

    console.log("Les variables de la page 1 sur la page 2 sont : ",code_dpt,",",selectedYear,",",nom_dpt);

    Papa.parse("dataset/db_CrimesDelits.csv", {
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
                yearLabel.text(selectedYear);

                function UpdateChart(selectedYear,codeDpt){
                    const filtered = data.filter(d => {

                        return d.Code_departement?.padStart(2,"0") === codeDpt &&
                        d.Type==="Délit" && d.annee === selectedYear
                    })
                    console.log("Dataset filtré code et année :",filtered)

                    const aggregate = {};
                    filtered.forEach(d => {
                        const indicateur = d.indicateur;
                        const nombre = parseInt(d.nombre) ||0;
                        aggregate[indicateur] = (aggregate[indicateur]||0)+nombre;
                    });

                    console.log("aggre récup",aggregate)

                    const chartData = Object.entries(aggregate).map(([indicateur,count])=>({
                            type : indicateur,
                            count : count
                        }));
                    console.log("Données pour l'année ",selectedYear," et pour la région ",codeDpt,":",chartData)

                    d3.select("#test_graph").selectAll("svg").remove();

                    createBarChart(chartData);

                };
                
                function createBarChart(data){
                    const margin = { top: 70, right: 30, bottom: 60, left: 130 };
                    const width = 800 + margin.left + margin.right ;
                    const height = 300 + margin.top + margin.bottom;

                    data.sort((a,b) =>  a.count -  b.count);

                        
                    // Création de l'espace qui va contenir le graphique 
                    const svg = d3.select("#graph-page2-graph1").append("svg")
                        .attr("width", width )
                        .attr("height", height)
                        .append("g")
                        .attr("transform", `translate(0,${margin.left},${margin.top})`);

                    

                    // Création de l'axe des X qui sera des barres => valeurs qualitatives 

                    const xScale = d3.scaleBand()
                        .domain(data.map(d => d.type))
                        .range([0, width])
                        .padding(0.4);
                    

                    // Création de l'axe des Y qui sera une 'échelle linéaire' => valeurs quantitatives
                    const yScale = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.count)])
                        .range([height, 0]);

                    // Barres
                    svg.selectAll(".bar")
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("class", "bar")
                        .attr("x", d => xScale(d.type))
                        .attr("y", d => yScale(d.count))
                        .attr("width", xScale.bandwidth())
                        .attr("height", d => height - yScale(d.count))
                        .attr("fill", "#4da6ff");

                    

                    svg.append("g")
                        .attr("transform", `translate(0,${height})`)
                        .call(d3.axisBottom(xScale))
                        .selectAll("text")
                        .attr("transform","rotate(15)")
                        .style("text-anchor", "start")
                        .style("font-size", "11px")
                        .attr("dx", "0em")  // Décalage horizontal
                        .attr("dy", "2em");  // Décalage vertical

                    // Axe Y
                    svg.append("g")
                        .call(d3.axisLeft().scale(yScale))
                        .style("font-size", "11px")
                        .selectAll("line")
                        .style("stroke", "#ccc");
                    
                    svg.append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 0 - margin.left + 20)
                        .attr("x", 0 - (height / 2))
                        .attr("dy", "1em")
                        .style("text-anchor", "middle")
                        .style("font-size", "12px")
                        .text("Nombre de délits");


                }

                UpdateChart(selectedYear,code_dpt);

                

                
            }
            
        
        });

         

        
    
    

    

    

};

if (isContexte) {

    console.log("On est sur page Contexte");
    let code_dpt = sessionStorage.getItem("code_dpt");
    let selectedYear = sessionStorage.getItem("selectedYear");
    let nom_dpt = sessionStorage.getItem("nom_dpt");

    // =============== TEST ================== //
    Papa.parse("dataset/db_CrimesDelits.csv", {
            download : true,
            header : true, // important sinon il charge les éléments [] et non entre {}
            delimiter :",",
            complete : function(results) {
                console.log("CSV chargé  :",results.data)
                const data = results.data;

                function UpdateChart(selectedYear,codeDpt){
                    const filtered = data.filter(d => {

                        return d.Code_departement?.padStart(2,"0") === codeDpt &&
                        d.Type==="Délit" && d.annee === selectedYear
                    })
                    console.log("Dataset filtré code et année :",filtered)

                    const aggregate = {};
                    filtered.forEach(d => {
                        const indicateur = d.indicateur;
                        const nombre = parseInt(d.nombre) ||0;
                        aggregate[indicateur] = (aggregate[indicateur]||0)+nombre;
                    });

                    console.log("aggre récup",aggregate)

                    const chartData = Object.entries(aggregate).map(([indicateur,count])=>({
                            type : indicateur,
                            count : count
                        }));
                    console.log("Données pour l'année ",selectedYear," et pour la région ",codeDpt,":",chartData)

                    d3.select("#test_graph").selectAll("svg").remove();

                    createBarChart(chartData);
                };
                    function createBarChart(data){
                        const margin = { top: 70, right: 30, bottom: 60, left: 270 };
                        const width = 800 + margin.left + margin.right ;
                        const height = 300 + margin.top + margin.bottom;

                        data.sort((a,b) =>  a.count -  b.count);

                        svg2 = d3.select("#test").append("svg")
                            .attr("width",width)
                            .attr("heiht",height)
                            .append("g")
                            .attr("transform","translate(" + margin.left + "," +margin.top + ")");

                        const x = d3.scaleLinear()
                            .range([0,width])
                            .domain([0,d3.max(data,function(d){return d.count})])

                        const y =d3.scaleBand()
                            .range([height,0])
                            .padding(0.1)
                            .domain(data.map(function (d) {return d.type}))

                        const xAxis = d3.axisBottom(x)
                            .ticks(5)
                            .tickSize(0);

                        const yAxis = d3.axisLeft(y)
                            .tickSize(0)
                            .tickPadding(20);

                        svg2.selectAll(".bar")
                            .data(data)
                            .enter().append("rect")
                            .attr("y",function(d){return y(d.type)})
                            .attr("height",y.bandwidth())
                            .attr("x",0)
                            .attr("width",function (d) {return x(d.count)})
                            .style("fill",'skyblue'); //changement de couleur ici 

                        svg2.append("g")
                            .attr("class","x axis")
                            .attr("transform","translate(0,"+height+")")
                            .call(xAxis);

                        svg2.append("g")
                            .call(yAxis);
                        
                        // Add labels to the end of each bar
                        svg2.selectAll(".label")
                            .data(data)
                            .enter().append("text")
                            .attr("x", function (d) { return x(d.count) + 5; })
                            .attr("y", function (d) { return y(d.type) + y.bandwidth() / 2; })
                            .attr("dy", ".35em")
                            .style("font-family", "sans-serif")
                            .style("font-size", "10px")
                            .style("font-weight", "bold")
                            .style('fill', '#3c3d28')
                            .text(function (d) { return d.count; });


                        


                        

                    };

                UpdateChart(selectedYear,code_dpt);

                


            }});
    

};






// Adding SVG (Scalable Vector Graphics) Met à l'échelle un graphique si la personne zoom ou dézoom sur la page
// Ajout d'un espace pour graphique dans les div de la section Graphique-page2
