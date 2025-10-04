const width = 960;
const height = 600;

const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

// Projection centrée sur la France métropolitaine
const projection = d3.geoMercator()
  .center([2.5, 46.6])
  .scale(2200)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const regionNames = {
  "01": "Auvergne-Rhône-Alpes",
  "84": "Auvergne-Rhône-Alpes",
  "02": "Hauts-de-France",
  "03": "Grand Est",
  "27": "Bourgogne-Franche-Comté",
  "24": "Centre-Val de Loire",
  "32": "Occitanie",
  "44": "Pays de la Loire",
  "28": "Normandie",
  "76": "Normandie",
  "04": "Provence-Alpes-Côte d'Azur",
  "93": "Provence-Alpes-Côte d'Azur",
  "11": "Ile-de-France",
  "75": "Ile-de-France",
  "94": "Ile-de-France",
  "52": "Bretagne",
  "53": "Bretagne"
};

// Échelle de couleur
const colorScale = d3.scaleThreshold()
  .domain([1,5,10,20,50,100])
  .range(["#FFEDA0","#FEB24C","#FD8D3C","#FC4E2A","#E31A1C","#BD0026","#800026"]);

// Charger le CSV
Papa.parse("dataset/db_delinquance.csv", {
  download: true,
  header: true,
  delimiter: ";",
  complete: function(results) {
    const data2024 = results.data.filter(d => d.annee === "2024");

    const homicideData = {};
    data2024.forEach(d => {
      const code = d.Code_region;
      const region = regionNames[code];
      if (!region) return;
      const nombre = parseInt(d.nombre) || 0;
      if (!homicideData[region]) homicideData[region] = 0;
      homicideData[region] += nombre;
    });

    // Charger le GeoJSON local
    d3.json("geojson/regions-version-simplifiee.geojson")
      .then(geojson => {

        // Filtrer métropole uniquement (si nécessaire)
        const ultraCodes = ["971","972","973","974","976"];
        geojson.features = geojson.features.filter(f => !ultraCodes.includes(f.properties.code));

        // Dessiner les régions
        svg.selectAll("path")
          .data(geojson.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", "region")
          .attr("fill", d => colorScale(homicideData[d.properties.nom] || 0))
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .on("mousemove", (event,d) => {
            const region = d.properties.nom;
            const count = homicideData[region] || 0;
            tooltip.style("opacity",1)
                   .style("left",(event.pageX+10)+"px")
                   .style("top",(event.pageY+10)+"px")
                   .html(`<strong>${region}</strong><br>Homicides en 2024: ${count}`);
          })
          .on("mouseout", () => tooltip.style("opacity",0));

      });
  }
});
