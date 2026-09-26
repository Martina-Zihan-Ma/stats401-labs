Promise.all([
    d3.csv("../data/lab8_embedding_map.csv", d => ({ ...d, x: +d.x, y: +d.y, page: +d.page, word_count: +d.word_count, cluster: +d.cluster })),
    d3.csv("../data/lab8_topic_section_matrix.csv", d => ({ ...d, count: +d.count })),
    d3.csv("../data/passages_by_section.csv", d => ({ ...d, passage_count: +d.passage_count })),
    d3.csv("../data/average_length_by_section.csv", d => ({ ...d, average_word_count: +d.average_word_count }))
]).then(([data, matrixData, sectionData, lengthData]) => {
    const topics = [...new Set(data.map(d => d.cluster_name))];
    const sections = [...new Set(data.map(d => d.section))].filter(Boolean);
    const topicLabels = new Map([
        ["Quantitative, Data and Computing", "Quant. / Data"],
        ["Arts, Media and Digital Practice", "Arts / Media"],
        ["Academic Community and Student Support", "Community"],
        ["Academic Calendar and Attendance", "Calendar"],
        ["China, Language and Global Education", "China / Language"],
        ["Academic Procedures and Student Life", "Procedures"],
        ["Politics, Culture and Public Policy", "Politics / Policy"],
        ["Academic Credits and Graduation", "Credits / Grad."]
    ]);
    const color = d3.scaleOrdinal(topics, ["#2A9D8F", "#457B9D", "#E76F51", "#8A5A9E", "#E9C46A", "#264653", "#F4A261", "#5B8E7D"]);
    const byId = new Map(data.map(d => [d.passage_id, d]));
    const tooltip = d3.select("body").append("div").attr("class", "tooltip");

    d3.select("#section-filter").selectAll("option.section").data(sections.sort()).join("option").attr("class", "section").attr("value", d => d).text(d => d);
    d3.select("#topic-filter").selectAll("option.topic").data(topics).join("option").attr("class", "topic").attr("value", d => d).text(d => d);
    d3.select("#topic-legend").selectAll("span").data(topics).join("span").html(d => `<i style="background:${color(d)}"></i>${d}`);

    drawBarChart("#section-chart", sectionData.slice(0, 10), "passage_count", d => d.section, "Passages");
    drawBarChart("#length-chart", lengthData.slice(0, 10), "average_word_count", d => d.section, "Words");

    const width = 960;
    const height = 560;
    const margin = 30;
    const svg = d3.select("#semantic-map").append("svg").attr("viewBox", `0 0 ${width} ${height}`);
    const plot = svg.append("g");
    const x = d3.scaleLinear().domain(d3.extent(data, d => d.x)).nice().range([margin, width - margin]);
    const y = d3.scaleLinear().domain(d3.extent(data, d => d.y)).nice().range([height - margin, margin]);
    const radius = d3.scaleSqrt().domain(d3.extent(data, d => d.word_count)).range([2.5, 8]);
    const points = plot.selectAll("circle").data(data).join("circle").attr("class", "passage").attr("cx", d => x(d.x)).attr("cy", d => y(d.y)).attr("r", d => radius(d.word_count)).attr("fill", d => color(d.cluster_name)).on("mouseover", (event, d) => showTip(event, `${d.cluster_name}<br>${d.section}<br>${d.word_count} words`)).on("mouseout", hideTip).on("click", (event, d) => selectPassage(d));
    const zoom = d3.zoom().scaleExtent([1, 8]).on("zoom", event => plot.attr("transform", event.transform));
    svg.call(zoom);
    d3.select("#reset-zoom").on("click", () => svg.transition().call(zoom.transform, d3.zoomIdentity));
    d3.select("#reset-filters").on("click", () => {
        d3.select("#search").property("value", "");
        d3.select("#section-filter").property("value", "");
        d3.select("#topic-filter").property("value", "");
        updateFilters();
    });

    const matrixWidth = Math.max(1660, topics.length * 170 + 300);
    const rowHeight = 18;
    const matrixHeight = 60 + sections.length * rowHeight;
    const matrixSvg = d3.select("#matrix").append("svg").attr("width", matrixWidth).attr("height", matrixHeight);
    const mx = d3.scaleBand().domain(topics).range([290, matrixWidth - 20]).padding(.08);
    const my = d3.scaleBand().domain(sections).range([50, matrixHeight - 10]).padding(.08);
    const matrixCounts = new Map(matrixData.map(d => [`${d.section}|${d.cluster_name}`, d.count]));
    const matrixCells = sections.flatMap(section => topics.map(cluster_name => ({ section, cluster_name, count: matrixCounts.get(`${section}|${cluster_name}`) || 0 })));
    const maxCount = d3.max(matrixData, d => d.count);
    const fill = d3.scaleSequential(d3.interpolateRgbBasis(["#E8F3F1", "#98D4C8", "#2A9D8F", "#1F5A65"])).domain([0, maxCount]);
    d3.select("#matrix-legend").text(`Passage count: light = 0, dark = ${maxCount}`);
    matrixSvg.selectAll(".topic-label").data(topics).join("text").attr("class", "topic-label").attr("x", d => mx(d) + mx.bandwidth() / 2).attr("y", 34).attr("text-anchor", "middle").text(d => topicLabels.get(d)).append("title").text(d => d);
    matrixSvg.selectAll(".section-label").data(sections).join("text").attr("class", "section-label").attr("x", 285).attr("y", d => my(d) + my.bandwidth() / 2 + 3).attr("text-anchor", "end").text(d => d);
    const cells = matrixSvg.selectAll("rect").data(matrixCells).join("rect").attr("class", "matrix-cell").attr("x", d => mx(d.cluster_name)).attr("y", d => my(d.section)).attr("width", mx.bandwidth()).attr("height", my.bandwidth()).attr("fill", d => fill(d.count)).on("mouseover", (event, d) => showTip(event, `${d.section}<br>${d.cluster_name}<br>${d.count} passages`)).on("mouseout", hideTip).on("click", (event, d) => applyHighlight(item => matchesFilters(item) && item.section === d.section && item.cluster_name === d.cluster_name));

    function showTip(event, text) {
        tooltip.html(text).style("opacity", 1).style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
    }

    function hideTip() {
        tooltip.style("opacity", 0);
    }

    function updateFilters() {
        applyHighlight(matchesFilters);
    }

    function matchesFilters(d) {
        const query = d3.select("#search").property("value").toLowerCase().trim();
        const section = d3.select("#section-filter").property("value");
        const topic = d3.select("#topic-filter").property("value");
        return (!query || d.text.toLowerCase().includes(query)) && (!section || d.section === section) && (!topic || d.cluster_name === topic);
    }

    function applyHighlight(predicate) {
        points.classed("selected", false).classed("neighbor", false).attr("opacity", d => predicate(d) ? 1 : .08);
        cells.classed("active-cell", d => data.some(item => predicate(item) && item.section === d.section && item.cluster_name === d.cluster_name));
    }

    function selectPassage(d) {
        const neighbors = d.nearest_neighbors.split("|").map(id => byId.get(id)).filter(Boolean);
        const neighborIds = new Set(neighbors.map(item => item.passage_id));
        points.attr("opacity", item => item.passage_id === d.passage_id || neighborIds.has(item.passage_id) ? 1 : .08).classed("selected", item => item.passage_id === d.passage_id).classed("neighbor", item => neighborIds.has(item.passage_id));
        cells.classed("active-cell", cell => cell.section === d.section && cell.cluster_name === d.cluster_name);
        d3.select("#detail-panel").html(`<h3>${d.section || "No section"}</h3><p><strong>Chapter:</strong> ${d.chapter || "Not recorded"}<br><strong>Subsection:</strong> ${d.subsection || "Not recorded"}<br><strong>Page:</strong> ${d.page}<br><strong>Semantic topic:</strong> ${d.cluster_name}</p><p>${d.text}</p><h3>Nearest semantic neighbors</h3><ol>${neighbors.map(item => `<li><strong>${item.section || "No section"}</strong>: ${item.text}</li>`).join("")}</ol>`);
    }

    d3.selectAll("#search, #section-filter, #topic-filter").on("input", updateFilters).on("change", updateFilters);
});

function drawBarChart(selector, data, value, label, unit) {
    const width = 960;
    const height = Math.max(360, data.length * 38 + 55);
    const margin = { top: 16, right: 85, bottom: 25, left: 330 };
    const svg = d3.select(selector).append("svg").attr("viewBox", `0 0 ${width} ${height}`);
    const x = d3.scaleLinear().domain([0, d3.max(data, d => d[value])]).nice().range([margin.left, width - margin.right]);
    const y = d3.scaleBand().domain(data.map(label)).range([margin.top, height - margin.bottom]).padding(.22);
    const barColor = d3.scaleLinear().domain([0, data.length - 1]).range(["#73C7B8", "#176B87"]);
    const formatLabel = text => text.length > 48 ? `${text.slice(0, 45)}…` : text;
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(y).tickFormat(formatLabel)).selectAll("text").append("title").text(d => d);
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).ticks(5));
    svg.selectAll("rect").data(data).join("rect").attr("class", "bar").attr("x", margin.left).attr("y", d => y(label(d))).attr("width", d => x(d[value]) - margin.left).attr("height", y.bandwidth()).attr("fill", (d, i) => barColor(i)).append("title").text(d => `${label(d)}: ${d[value].toFixed ? d[value].toFixed(1) : d[value]} ${unit}`);
    svg.selectAll(".bar-value").data(data).join("text").attr("class", "bar-value").attr("x", d => x(d[value]) + 7).attr("y", d => y(label(d)) + y.bandwidth() / 2 + 4).text(d => d[value].toFixed ? d[value].toFixed(1) : d[value]);
}
