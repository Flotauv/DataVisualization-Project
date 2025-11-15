// ================= DETECTION DE PAGE =================== //
const isCarte = document.getElementById("Carte") !== null;
const isCarte2 = document.getElementById("Carte2") !== null;
const isContexte = document.getElementById("Index") !== null;







// ================= POPULATION PAR DÉPARTEMENT (2016-2024) =================== //
// Ajout : données de population pour calcul du taux Crimes+Délits / Population
const populations = {
    "01": {2016: 638425,2017: 643350,2018: 647634,2019: 652432,2020: 657856,2021: 663202,2022: 668613,2023: 674071,2024: 679498},
    "03": {2016: 339384,2017: 337988,2018: 337171,2019: 335975,2020: 335628,2021: 334872,2022: 334177,2023: 333355,2024: 332708},
    "07": {2016: 325157,2017: 325712,2018: 326606,2019: 328278,2020: 329325,2021: 331415,2022: 333172,2023: 334707,2024: 336501},
    "15": {2016:145969,2017:145143,2018:144765,2019:144692,2020:144379,2021:144226,2022:143934,2023:143720,2024:143567},
    "26": {2016:508006,2017:511553,2018:514732,2019:516762,2020:517709,2021:519458,2022:521006,2023:522535,2024:524109},
    "43": {2016:227339,2017:227283,2018:227552,2019:227570,2020:227489,2021:227284,2022:227222,2023:226987,2024:226900},
    "74": {2016:801416,2017:807360,2018:816699,2019:826094,2020:835206,2021:841482,2022:849959,2023:858305,2024:866490},
    "38": {2016:1252912,2017:1258722,2018:1263563,2019:1271166,2020:1277513,2021:1284948,2022:1292276,2023:1299578,2024:1307146},
    "42": {2016:761997,2017:762941,2018:763441,2019:765634,2020:768508,2021:769029,2022:770969,2023:772981,2024:775102},
    "63": {2016:650700,2017:653742,2018:659048,2019:662152,2020:661852,2021:662285,2022:663351,2023:664157,2024:665094},
    "69": {2016:1835903,2017:1843319,2018:1859524,2019:1875747,2020:1883437,2021:1893692,2022:1905369,2023:1916293,2024:1926989},
    "73": {2016:429681,2017:431174,2018:433724,2019:436434,2020:439750,2021:442468,2022:445714,2023:448853,2024:451819}
};





if (isCarte){
    

        

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

// Échelle couleur adaptée aux pourcentages (0% → vert / 6% → rouge)
    const colorScale = d3.scaleLinear()
    .domain([0, 1.5, 3, 4.5,6 ])  
    .range(['#91AE4F','#00AC8C','#FF6F4C','#FF9940','#E1000F'])
    .unknown("#ccc");

// ================= Chargement CSV & initialisation =============== //

    Papa.parse("dataset/db_CrimesDelits.csv", {
        download : true,
        header : true,
        delimiter :",",
        complete : function(results) {

            console.log("CSV chargé :",results.data)
            const data = results.data;

            const years = [... new Set(data.map(d => d.annee))].sort();
            let savedIndex = sessionStorage.getItem("sliderIndex");
            let initialIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
            if (initialIndex >= years.length || initialIndex < 0 || isNaN(initialIndex)) initialIndex = 0;

            yearSlider.attr("min",0).attr("max",years.length-1).attr("value",initialIndex);
            yearLabel.text(years[initialIndex]);

        // Chargement carte GeoJSON
            d3.json("dataset/departements-auvergne-rhone-alpes.geojson").then(geojson => {

            // ================= Fonction de mise à jour =============== //
                function UpdateMap(selectedYear){

                // Filtrer Crimes + Délits
                    const filtered = data.filter(d =>
                        d.annee === selectedYear && 
                        (d.Type === "Délit" || d.Type === "Crime")
                    );

                // Compter crimes+délits par département
                    const taux = {};
                    filtered.forEach(d => {
                        const code = d.Code_departement?.padStart(2,"0");
                        const nombre = parseInt(d.nombre) || 0;
                        taux[code] = (taux[code] || 0) + nombre;
                    });

                // Convertir en % Population
                    Object.keys(taux).forEach(code => {
                        const pop = populations[code]?.[selectedYear];
                        if (pop) taux[code] = (taux[code] / pop) * 100;
                        else taux[code] = 0;
                    });

                    const paths = svg_page1.selectAll("path")
                        .data(geojson.features);

                // Dessiner les départements
                    paths.enter()
                    .append("path")
                    .merge(paths)
                    .attr("d", path)
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1)

                // Hover
                    .on("mouseenter",(event,d) => {
                        d3.select(event.currentTarget)
                        .transition().duration(200)
                        .attr("stroke-width",2)
                        .attr("stroke","#333");
                    })

                    .on("mousemove",(event,d)=>{
                        const code = d.properties.code;
                        const nom = d.properties.nom;
                        const val = taux[code] || 0;

                        tooltip.style("opacity", 1)
                            .style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY + 10) + "px")
                            .html(`<strong>${nom}</strong><br>${val.toFixed(2)}% crimes/délits`);
                    })

                    .on("mouseleave",(event,d)=>{
                        d3.select(event.currentTarget)
                        .transition().duration(200)
                        .attr("stroke-width",1)
                        .attr("stroke","#fff");
                        tooltip.style("opacity",0);
                    })

                    .on("click",(event,d) => {
                        sessionStorage.setItem("code_dpt",d.properties.code);
                        sessionStorage.setItem("nom_dpt",d.properties.nom);
                        window.location.href = "Carte2.html";
                    })

                // Coloration selon taux %
                    .transition().duration(500)
                    .attr("fill", d => colorScale(taux[d.properties.code] || 0));

                };

            // Initialisation
                UpdateMap(years[initialIndex]);
            
                        // ================= LÉGENDE COULEURS =================== //
            const legendWidth = 300;
            const legendHeight = 10;

            const legendSvg = svg_page1.append("g")
                .attr("class", "legend")
                .attr("transform", `translate(${width_page1 - legendWidth - 50}, ${height_page1 - 50})`);

            // Échelle pour positionner les couleurs
            const legendScale = d3.scaleLinear()
                .domain(colorScale.domain())
                .range([0, legendWidth]);

            // Dégradé
            const defs = svg_page1.append("defs");
            const linearGradient = defs.append("linearGradient")
                .attr("id", "legend-gradient");

            linearGradient.selectAll("stop")
                .data(colorScale.range().map((color, i) => ({
                    offset: `${(i / (colorScale.range().length - 1)) * 100}%`,
                    color: color
                })))
                .enter()
                .append("stop")
                .attr("offset", d => d.offset)
                .attr("stop-color", d => d.color);

            // Rectangle de la légende
            legendSvg.append("rect")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .style("fill", "url(#legend-gradient)")
                .attr("stroke", "#333")
                .attr("stroke-width", 0.5);

            // Axe
            const legendAxis = d3.axisBottom(legendScale)
                .tickValues(colorScale.domain())
                .tickFormat(d => d + " %");

            legendSvg.append("g")
                .attr("transform", `translate(0, ${legendHeight})`)
                .call(legendAxis)
                .selectAll("text")
                .style("font-size", "12px");

            // Titre
            legendSvg.append("text")
                .attr("x", legendWidth / 2)
                .attr("y", -8)
                .attr("text-anchor", "middle")
                .style("font-size", "13px")
                .style("font-weight", "bold")
                .text("Taux de crimes et délits (%)");

            // Slider
                yearSlider.on("input", (event) => {
                    const index = +event.target.value;
                    const selectedYear = years[index];
                    sessionStorage.setItem("sliderIndex",index.toString());
                    sessionStorage.setItem("selectedYear",selectedYear);
                    yearLabel.text(selectedYear);
                    UpdateMap(selectedYear);
                });

            });

        }
    });
}



// ================= PAGE 2 =================== //
// Dimensions communes aux balises svg des graphes de la page 2


// récupération dynamiques des variables de la page 1
if (isCarte2){
    console.log("On est sur la carte2");

    let code_dpt = sessionStorage.getItem("code_dpt");
    let selectedYear = sessionStorage.getItem("selectedYear");
    let nom_dpt = sessionStorage.getItem("nom_dpt");
    
    document.getElementById("Titre-page2").textContent = "Crimes et délits pour la région :    " + nom_dpt;

    
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

        let savedIndex = sessionStorage.getItem("sliderIndex");
        console.log(savedIndex)
        let initialIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
        console.log(initialIndex)
        if (initialIndex>= length.years || initialIndex <0 || initialIndex === NaN){
            initialIndex = 0;
        }
        
        const yearSlider = d3.select("#year_slider");
        const yearLabel = d3.select("#year_label");  

        console.log("Les variables de la page 1 sur la page 2 sont : ",code_dpt,",",selectedYear,",",nom_dpt);

        // Slider des années
        yearSlider
            .attr("min",0)
            .attr("max",years.length-1)
            .attr("value",initialIndex);

        // Valeur par défaut du slider 
        yearLabel.text(selectedYear);

        // Mise à jour avec le slider
        yearSlider.on("input", (event) => {
            const index = +event.target.value;
            console.log("Slider touché :",index);
            const selectedYear = years[index];
            sessionStorage.setItem("sliderIndex",index.toString());
            sessionStorage.setItem("selectedYear",selectedYear);
            console.log("Année selectionnée sur le slider dans délits et crimes touchés :",selectedYear)
            yearLabel.text(selectedYear)});

        
        

        

        
        


    }});

    

    function setActive(element) {
        
        // Retirer active de tous
        document.querySelectorAll('.btn').forEach(btn => {
            btn.classList.remove('active');
        });
        // Ajouter active au bouton cliqué
        element.classList.add('active');

        let isDelit = element.id ==="délits"? 'Délit':'Crime';
        console.log("brrrrrrr",isDelit);
        sessionStorage.setItem("isDelit",isDelit);

        

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

                selectedYear = sessionStorage.getItem("selectedYear");

                let savedIndex = sessionStorage.getItem("sliderIndex");
                console.log("LE SLIDER QUAND ON TOUCHE UN BTN EST :",savedIndex);
                let initialIndex = years.indexOf(selectedYear);
                console.log("Le nouvel index suivit BIIIIITE ",initialIndex);
                if (initialIndex === -1){
                    initialIndex = 0;
                    selectedYear=years[0];
                }
                
                
                const yearSlider = d3.select("#year_slider");
                const yearLabel = d3.select("#year_label");  

                console.log("Les variables de la page 1 sur la page 2 sont : ",code_dpt,",",selectedYear,",",nom_dpt);

                // Slider des années
                yearSlider
                    .attr("min",0)
                    .attr("max",years.length-1)
                    .attr("value",initialIndex);

                // Valeur par défaut du slider 
                yearLabel.text(selectedYear);

                
                

                

                
                

                function UpdateChart(selectedYear,codeDpt, infractionType){

                    

                    
                    const filtered = data.filter(d => {

                        return d.Code_departement?.padStart(2,"0") === codeDpt &&
                        d.Type=== infractionType && d.annee === selectedYear
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

                    d3.select("#graph-page2").selectAll("svg").remove();

                    createBarChart(chartData);

                    function createBarChart(data){

                        

                        const margin = { top: 70, right: 70, bottom: 60, left: 320 };
                        const width = 1000 + margin.left + margin.right ;
                        const height = 300 + margin.top + margin.bottom;

                        data.sort((a,b) =>  a.count -  b.count);

                        svg = d3.select("#graph-page2").append("svg")
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

                        svg.selectAll(".bar")
                            .data(data)
                            .enter().append("rect")
                            .attr("y",function(d){return y(d.type)})
                            .attr("height",y.bandwidth())
                            .attr("x",0)
                            .attr("width",function (d) {return x(d.count)})
                            .style("fill","#000091"); //changement de couleur ici (pour ensuite mettre la chartre graphique de la police nationale)

                        svg.append("g")
                            .attr("class","x axis")
                            .attr("transform","translate(0,"+height+")")
                            .style("font-size", "12px")
                            .call(xAxis)
                            .call(g => g.select(".domain").remove());

                        svg.append("g")
                            .attr("class", "y axis")
                            .style("font-size", "8px")
                            
                            .style('fill',"#0000")
                            .call(yAxis)
                            .selectAll('path')
                            .style('stroke-width', '2.4px');
                            

                        svg.selectAll(".y.axis .tick text")
                            .text(function (d) {
                            return d.toUpperCase();
                            })
                            .style("font-size","9px");

                        // Add labels to the end of each bar
                        svg.selectAll(".label")
                            .data(data)
                            .enter().append("text")
                            .attr("x", function (d) { return x(d.count) + 5; })
                            .attr("y", function (d) { return y(d.type) + y.bandwidth() / 2; })
                            .attr("dy", ".35em")
                            .style("font-family", "sans-serif")
                            .style("font-size", "15px")
                            .style("font-weight", "bold")
                            .style('fill', '#3c3d28')
                            .text(function (d) { return d.count; });

                    
                    };

                };

              
                //Initialisation
                //UpdateChart(selectedYear,code_dpt,infractionType);
                

                // Mise à jour avec le slider
                yearSlider.on("input", (event) => {
                    const index = +event.target.value;
                    console.log("Slider touché :",index);
                    const selectedYear = years[index];
                    sessionStorage.setItem("sliderIndex",index.toString());
                    sessionStorage.setItem("selectedYear",selectedYear);
                    yearLabel.text(selectedYear);
                    UpdateChart(selectedYear,code_dpt,isDelit);
                });
                
                UpdateChart(selectedYear,code_dpt,isDelit);

                 


            }
            
        
        });
        



        
        
        
                
    };

    
    
    


    
    
    

    
    
    

    

         

        
    
    

    

    

};