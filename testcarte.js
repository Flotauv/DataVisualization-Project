const width = 960;
const height = 600;

// SVG principal
const svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

const tooltip = d3.select("#tooltip");

// Projection
const projection = d3.geoMercator()
  .center([4.5, 45.75]) // ajuster longitude, latitude
  .scale(3000)          // augmenter ou diminuer
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Échelle couleur
const colorScale = d3.scaleSequential()
  .domain([7000, 0]) // plus c’est haut, plus c’est rouge
  .interpolator(d3.interpolateRdYlGn)
  .unknown("#ccc");

// Slider DOM
const yearSlider = d3.select("#yearSlider");
const yearLabel = d3.select("#yearLabel");

// Charger le CSV
Papa.parse("dataset/db_delinquance_dpt.csv", {
  download: true,
  header: true,
  delimiter: ";",
  complete: function(results) {
    const data = results.data;

    // Extraire les années uniques triées
    const years = [...new Set(data.map(d => d.annee))].sort();

    // Configurer le slider
    yearSlider
      .attr("min", 0)
      .attr("max", years.length - 1)
      .attr("value", 0);

    yearLabel.text(years[0]);

    // Charger GeoJSON
    d3.json("geojson/departements-auvergne-rhone-alpes.geojson").then(geojson => {

      function updateMap(selectedYear) {
        console.log("🔄 Année :", selectedYear);

        const filtered = data.filter(d =>
          d.annee === selectedYear &&
          d.indicateur === "Cambriolages de logement"
        );

        const cambriolages = {};
        filtered.forEach(d => {
          const code = d.Code_departement?.padStart(2, "0");
          const nombre = parseInt(d.nombre) || 0;
          cambriolages[code] = (cambriolages[code] || 0) + nombre;
        });

        const paths = svg.selectAll("path")
          .data(geojson.features);

        paths.enter()
          .append("path")
          .merge(paths)
          .attr("d", path)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1)
          .on("mousemove", (event, d) => {
            const code = d.properties.code;
            const nom = d.properties.nom;
            const count = cambriolages[code] || 0;
            tooltip.style("opacity", 1)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px")
              .html(`<strong>${nom}</strong><br>${count} cambriolages`);
          })
          .on("mouseout", () => tooltip.style("opacity", 0))
          .transition()
          .duration(500)
          .attr("fill", d => colorScale(cambriolages[d.properties.code] || 0));
      }

      // Initialisation
      updateMap(years[0]);

      // Mise à jour avec le slider
      yearSlider.on("input", (event) => {
        const index = +event.target.value;
        const selectedYear = years[index];
        yearLabel.text(selectedYear);
        updateMap(selectedYear);
      });
    });
  }
});
