//! ===== 0. Slider and Buttons Methods =====
function setType(button){
    infractionType = button.id === "delits" ? "delitType" : "crimeType";
    sessionStorage.setItem("isDelit", infractionType);
    // Update button styles
    document.getElementById("delits").classList.remove("active");
    document.getElementById("crimes").classList.remove("active");
    button.classList.add("active");
    // Refresh chart
    loadDataAndCreateChart();
}





// Retrieve previously selected year from sessionStorage, or default to 2016
const savedYear = sessionStorage.getItem("selectedYear");
const initialYear = savedYear ? parseInt(savedYear, 10) : 2016;

// Select slider and label elements
const year_slider = document.getElementById("year_slider");
const year_label = document.getElementById("year_label");

// Initialize slider and label
year_slider.value = initialYear;
year_label.textContent = initialYear;

// Update both the label and sessionStorage when the user moves the slider
year_slider.addEventListener("input", (event) => {
  const selectedYear = parseInt(event.target.value, 10);
  year_label.textContent = selectedYear;
  sessionStorage.setItem("selectedYear", selectedYear);
  console.log("Selected year:", selectedYear);

  // Optional: refresh chart or visualization
  loadDataAndCreateChart(selectedYear, infractionType, code_dpt);
});




//! ===== I. Retrieve Information =====
const year_slider = document.getElementById("year_slider");
const selected_year = yearSlider.value;

let code_dpt = sessionStorage.getItem("code_dpt");
let nom_dpt = sessionStorage.getItem("nom_dpt");
let infractionType = sessionStorage.getItem("isDelit") || "Délit";




//! ===== I. Retrieve Information =====
document.getElementById("page3_title").textContent = "Détails pour le département : " + nom_dpt;



Papa.parse("../data/db_CrimesDelits.csv", {
    download: true,
    header: true,
    delimiter: ",",
    complete: function(results) {
        const data = results.data;

        // Filter data by selected department, year, and infraction type
        const filtered = data.filter(d => 
            d.Code_departement?.padStart(2,"0") === code_dpt &&
            d.Type === infractionType &&
            d.annee === selected_year
        );

        // Aggregate if needed (e.g., sum by indicator)
        const aggregate = {};
        filtered.forEach(d => {
            const key = d.indicateur;
            const value = parseInt(d.nombre) || 0;
            aggregate[key] = (aggregate[key] || 0) + value;
        });

        // Convert to array for D3
        const chartData = Object.entries(aggregate).map(([key, value]) => ({
            indicateur: key,
            nombre: value
        }));

        createBubbleChart(chartData);
    }
});

// ================== Bubble Chart ==================
function createBubbleChart(data){
    // Clear old chart
    d3.select("#graph-page3").selectAll("svg").remove();

    const margin = {top: 50, right: 50, bottom: 70, left: 100};
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#graph-page3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // X scale (e.g., indicator names as ordinal, or numbers if numeric)
    const x = d3.scaleBand()
        .domain(data.map(d => d.indicateur))
        .range([0, width])
        .padding(0.4);

    // Y scale (number of incidents)
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.nombre) * 1.1])
        .range([height, 0]);

    // Bubble size scale
    const r = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.nombre)])
        .range([5, 40]);  // min/max bubble radius

    // X axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform","rotate(-40)")
        .style("text-anchor","end");

    // Y axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Tooltip
    const tooltip = d3.select("body").append("div")
        .attr("id","tooltip")
        .style("position","absolute")
        .style("padding","6px")
        .style("background","#fff")
        .style("border","1px solid #aaa")
        .style("border-radius","4px")
        .style("opacity",0);

    // Draw bubbles
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.indicateur) + x.bandwidth()/2)
        .attr("cy", d => y(d.nombre))
        .attr("r", d => r(d.nombre))
        .attr("fill","#001f5c")
        .attr("opacity",0.7)
        .on("mouseenter", (event,d) => {
            tooltip.transition().duration(200).style("opacity",1);
            tooltip.html(`<strong>${d.indicateur}</strong><br>Nombre: ${d.nombre}`)
                .style("left", (event.pageX+10)+"px")
                .style("top", (event.pageY+10)+"px");
        })
        .on("mouseleave", () => {
            tooltip.transition().duration(200).style("opacity",0);
        });
}
