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

// ✅ Échelle couleur adaptée aux pourcentages (0% → vert / 6% → rouge)
const colorScale = d3.scaleSequential()
.domain([0, 6])  
.interpolator(t => d3.interpolateRdYlGn(1 - t))
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

            // Slider
            yearSlider.on("input", (event) => {
                const index = +event.target.value;
                const selectedYear = years[index];
                sessionStorage.setItem("sliderIndex",index.toString());
                yearLabel.text(selectedYear);
                UpdateMap(selectedYear);
            });

        });

    }
});
