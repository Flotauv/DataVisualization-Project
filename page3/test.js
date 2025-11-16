//! ===== III. Parse Data & Plot =====
Papa.parse("../data/db_CrimesDelits.csv", {
    download : true,
    header : true,
    delimiter :",",
    complete : function(results) {

        console.log("CSV chargé :",results.data)
        const data = results.data;

        // --- 1. Filter Data ---
        const filtered_data = data.filter(d =>
            d.annee === selectedYear && 
            (d.Type === "Délit" || d.Type === "Crime")
        );

        // --- 2. Compute totals you need ---
        const total_all = d3.sum(filtered_data, d => +d.nombre);

        // Compute total per category
        const totals_by_category = d3.rollup(
            filtered_data,
            v => d3.sum(v, d => +d.nombre),
            d => d.indicateur
        );
        
        // --- 3. Group data by category ---
        const categories = {};

        filtered_data.forEach(d => {
            const indic = d.indicateur;
            const nombre = +d.nombre;

            // A. quantity
            const quantity = nombre;

            // B. proportion per category
            const total_cat = totals_by_category.get(indic);
            const prop_cat = quantity / total_cat;

            // C. proportion per region (i.e. whole dataset)
            const prop_region = quantity / total_all;

            // If category not created, initialize it
            if (!categories[indic]) {
                categories[indic] = [];
            }

            // Push your [quantity, proportion_per_categorie, proportion_per_region]
            categories[indic].push([quantity, prop_cat, prop_region]);
        });

    }
})