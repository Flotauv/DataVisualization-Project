//! ===== 0. Retrieve Dpt Info from page2 =====
let code_dpt = sessionStorage.getItem("code_dpt");
let name_dpt = sessionStorage.getItem("nom_dpt");
let selected_year = sessionStorage.getItem("selectedYear");
let infraction_type = sessionStorage.getItem("isDelit");
let initialIndex = sessionStorage.getItem("sliderIndex");

console.log("Code Department: " + code_dpt + " | Name Department: " + name_dpt);
console.log("Selected Year: " + selected_year + " | Infraction Type: " + infraction_type);

document.getElementById("page3_title").textContent = infraction_type + " pour la région : " + name_dpt;

//! ===== I. Slider and Buttons Methods =====
const yearSlider = d3.select("#year_slider");
const yearLabel = d3.select("#year_label");

yearSlider.property("value", selected_year);
yearLabel.text(selected_year);

yearSlider.on("input", (event) => {
    selected_year = event.target.value;
    sessionStorage.setItem("selectedYear", selected_year);
    yearLabel.text(selected_year);
    update_graph();
    console.log("Selected year:", selected_year);
    
});

if (infraction_type === "Délits") {
    document.getElementById("delits").classList.add("active");
} else {
    document.getElementById("crimes").classList.add("active");
}

function setType(button){
    infraction_type = button.id === "delits" ? "Délits" : "Crimes";
    sessionStorage.setItem("isDelit", infraction_type);
    document.getElementById("delits").classList.remove("active");
    document.getElementById("crimes").classList.remove("active");
    button.classList.add("active");
    document.getElementById("page3_title").textContent = infraction_type + " pour la région : " + name_dpt;
    console.log("Selected type:", infraction_type);
    update_graph();
}

//! ===== II. Retrieve Data =====
function update_graph() {
    // --- 1. Load Data ---
    Papa.parse("../data/db_CrimesDelits.csv", {
        download: true,
        header: true,
        delimiter: ",",

        // --- 2. Create Required DataStructure for Bubble Plot ---
        complete: function(results) {
            const data = results.data;
            const i_type = infraction_type === "Délits" ? "Délit" : "Crime";

            // i. Filter data
            const data_region = data.filter(d =>
                d.annee === selected_year && 
                d.Type === i_type
            );

            const data_dpt = data.filter(d =>
                d.annee === selected_year && 
                d.Type === i_type &&
                d.Code_departement === code_dpt
            );

            // ii. Get useful totals
            const totals_by_category = d3.rollup(
                data_region,
                v => d3.sum(v, d => +d.nombre),
                d => d.indicateur
            );

            const total_all_dpt = d3.sum(data_dpt, d => +d.nombre);

            // iii. Grouping
            const categories = [];
            data_dpt.forEach(d => {
                const indic = d.indicateur;
                const quantity = +d.nombre;
                const total_cat = totals_by_category.get(indic);
                categories.push({
                    category: indic,
                    qty: quantity,
                    prop_cat: quantity / total_all_dpt,
                    prop_region: quantity / total_cat
                });
            });

            console.log("GRAPH DATA:", categories);
            make_graph(categories);
        }
    });
}

//! ===== III. Graphs Functions =====
function make_graph(categories) {
    // Clear previous chart and tooltip
    d3.select("#graph").selectAll("*").remove();

    const width = 1350;
    const height = 600;
    const margin = { top: 50, right: 280, bottom: 60, left: 130 };

    const svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left - 50}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(categories, d => d.prop_region) * 100])
        .range([0, innerWidth]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(categories, d => d.prop_cat) * 100])
        .range([innerHeight, 0]);

    const r = d3.scaleSqrt()
        .domain([0, d3.max(categories, d => d.qty)])
        .range([5, 30]);

    const color = d3.scaleOrdinal(d3.schemeCategory10)
        .domain([...new Set(categories.map(d => d.category))]);

    // Axes
    chart.append("g")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "%"));

    chart.append("g")
        .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"));

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .text("Proportion du département par rapport à la région, pour un même type d'infraction (%)");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        //.text("Proportion du type d'infraction par rapport au total d'infractions du département (%)");
        .text("Nb d'infractions/ Nb total d'infractions du département (%)");


    // Tooltip
    const tooltip = d3.select("#graph").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "black")
        .style("color", "white")
        .style("padding", "5px 10px")
        .style("border-radius", "5px");

    const showTooltip = (event, d) => {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip.html(
            `<strong>${d.category}</strong><br>
            Qty: ${d.qty}<br>
            Prop Cat: ${(d.prop_cat*100).toFixed(2)}%<br>
            Prop Region: ${(d.prop_region*100).toFixed(2)}%`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    };

    const moveTooltip = (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY + 10) + "px");
    };

    const hideTooltip = () => tooltip.transition().duration(200).style("opacity", 0);

    // Draw bubbles
    chart.selectAll("circle")
        .data(categories)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.prop_region * 100))
        .attr("cy", d => y(d.prop_cat * 100))
        .attr("r", d => r(d.qty))
        .attr("fill", d => color(d.category))
        .attr("opacity", 0.7)
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseleave", hideTooltip);

    // Legend
    const legend = svg.append("g")
        .attr("transform", `translate(${width - margin.right}, ${margin.top})`);

    [...new Set(categories.map(d => d.category))].forEach((cat, i) => {
        legend.append("circle")
            .attr("cx", 0)
            .attr("cy", i * 20)
            .attr("r", 6)
            .style("fill", color(cat));

        legend.append("text")
            .attr("x", 12)
            .attr("y", i * 20 + 5)
            .text(cat)
            .style("font-size", "12px")
            .attr("alignment-baseline", "middle");
    });
}

// Initial graph draw
update_graph();
