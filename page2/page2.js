// ================= PAGE 2 =================== //
let code_dpt = sessionStorage.getItem("code_dpt");
let selectedYear = sessionStorage.getItem("selectedYear");
let nom_dpt = sessionStorage.getItem("nom_dpt");

document.getElementById("id_titre_page2").textContent = "Crimes et délits pour la région :    " + nom_dpt;

Papa.parse("../data/db_CrimesDelits.csv", {
    download : true,
    header : true, // important sinon il charge les éléments [] et non entre {}
    delimiter :",",
    complete : function(results) {

        const data = results.data;
        //const years = [... new Set(data.map(d => d.annee))].sort();
        const years = [... new Set(data.map(d => d.annee))].sort().slice(0,9);

        console.log("Années dispo :",years)

        let savedIndex = sessionStorage.getItem("sliderIndex");
        console.log(savedIndex)
        let initialIndex = savedIndex !== null ? parseInt(savedIndex) : 0;
        console.log(initialIndex)
        if (initialIndex>= length.years || initialIndex <0 || initialIndex === NaN){
            initialIndex = 0;
        }
        if (initialIndex === 0){

            //initialIndex = 0;
            selectedYear=years[0];
        };
        console.log("initialIndex",initialIndex);
        console.log("selectedYear",selectedYear);
        const yearSlider = d3.select("#year_slider");
        const yearLabel = d3.select("#year_label");  

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
            yearLabel.text(selectedYear)
        });
    }
});


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

    Papa.parse("../data/db_CrimesDelits.csv", {
        download : true,
        header : true, // important sinon il charge les éléments [] et non entre {}
        delimiter :",",
        complete : function(results) {
            console.log("CSV chargé  :",results.data)
            const data = results.data;
            // Extraire les années uniques triées
            const years = [... new Set(data.map(d => d.annee))].sort().slice(0,9);

            

            selectedYear = sessionStorage.getItem("selectedYear");

            let savedIndex = sessionStorage.getItem("sliderIndex");
            
            let initialIndex = years.indexOf(selectedYear);
            console.log("index = ",initialIndex);
            
            
            
            
            const yearSlider = d3.select("#year_slider");
            console.log("year slider : ",yearSlider);
            const yearLabel = d3.select("#year_label");  
            console.log("year_label : ",yearLabel);


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

                const aggregate = {};
                filtered.forEach(d => {
                    const indicateur = d.indicateur;
                    const nombre = parseInt(d.nombre) ||0;
                    aggregate[indicateur] = (aggregate[indicateur]||0)+nombre;
                });


                const chartData = Object.entries(aggregate).map(([indicateur,count])=>({
                        type : indicateur,
                        count : count
                    }));

                d3.select("#graph-page2").selectAll("svg").remove();

                createBarChart(chartData);

                function createBarChart(data){
                    const margin = { top: 70, right: 70, bottom: 60, left: 320 };
                    const width = 600 + margin.left + margin.right ;
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
                                        // Source - https://stackoverflow.com/a
                    // Posted by mbostock
                    // Retrieved 2025-11-16, License - CC BY-SA 3.0

                    svg.append("text")
                        .attr("class", "x label")
                        .attr("text-anchor", "end")
                        .attr("x", width)
                        .attr("y", height - 3)
                        .text("Nombre d'infractions");


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
