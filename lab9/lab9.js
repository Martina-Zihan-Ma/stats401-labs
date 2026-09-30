function parseGDPRow(row) {
    return {
        iso3: row.iso3,
        country: row.country,
        gdp: +row.gdp_2025_billion_usd,
        rank: +row.rank
    };
}

function buildGDPIndex(rows) {
    return new Map(rows.map(row => [row.iso3, row]));
}

function formatGDP(value) {
    return `$${Math.round(value).toLocaleString("en-US")} billion`;
}

const WORLD_ATLAS_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const ISO3_BY_NUMERIC_ID = new Map([
    [36, "AUS"], [40, "AUT"], [50, "BGD"], [56, "BEL"], [76, "BRA"], [124, "CAN"],
    [152, "CHL"], [156, "CHN"], [170, "COL"], [203, "CZE"], [208, "DNK"], [246, "FIN"],
    [250, "FRA"], [276, "DEU"], [344, "HKG"], [356, "IND"], [360, "IDN"], [364, "IRN"],
    [372, "IRL"], [376, "ISR"], [380, "ITA"], [392, "JPN"], [398, "KAZ"], [410, "KOR"],
    [458, "MYS"], [484, "MEX"], [528, "NLD"], [578, "NOR"], [586, "PAK"], [604, "PER"],
    [608, "PHL"], [616, "POL"], [620, "PRT"], [642, "ROU"], [643, "RUS"], [682, "SAU"],
    [702, "SGP"], [710, "ZAF"], [724, "ESP"], [752, "SWE"], [756, "CHE"], [764, "THA"],
    [784, "ARE"], [792, "TUR"], [804, "UKR"], [818, "EGY"], [826, "GBR"], [840, "USA"],
    [158, "TWN"], [704, "VNM"], [32, "ARG"]
]);

const width = 960;
const mapHeight = 520;
const cartogramHeight = 570;
const tooltip = d3.select("#tooltip");
let selectedId = null;
let hoveredId = null;

Promise.all([
    d3.json(WORLD_ATLAS_URL),
    d3.csv("../data/lab9_gdp_2025_top50.csv", parseGDPRow)
]).then(([world, rows]) => {
    const gdpById = buildGDPIndex(rows);
    const features = topojson.feature(world, world.objects.countries).features;

    features.forEach(feature => {
        feature.properties.iso3 = ISO3_BY_NUMERIC_ID.get(+feature.id);
        feature.properties.gdpRecord = gdpById.get(feature.properties.iso3);
    });

    const countriesWithGDP = features.filter(feature => feature.properties.gdpRecord);
    drawChoropleth(features, countriesWithGDP);
    drawCartogram(countriesWithGDP);
}).catch(error => {
    d3.selectAll("#choropleth, #cartogram").html(`<p class="load-error">The maps could not be loaded. Please check your internet connection and reload the page.</p>`);
    console.error("Lab 9 data loading error:", error);
});

function drawChoropleth(features, countriesWithGDP) {
    const svg = d3.select("#choropleth").append("svg")
        .attr("viewBox", `0 0 ${width} ${mapHeight}`)
        .attr("role", "img")
        .attr("aria-label", "World choropleth map of 2025 nominal GDP");
    const mapGroup = svg.append("g");
    const projection = d3.geoNaturalEarth1().fitExtent([[18, 18], [width - 18, mapHeight - 18]], { type: "FeatureCollection", features });
    const path = d3.geoPath(projection);
    const values = countriesWithGDP.map(feature => feature.properties.gdpRecord.gdp);
    const color = d3.scaleSequentialLog(d3.interpolateYlGnBu).domain(d3.extent(values));

    const countries = mapGroup.selectAll("path")
        .data(features)
        .join("path")
        .attr("class", feature => `country${feature.properties.gdpRecord ? " has-data" : ""}`)
        .attr("d", path)
        .attr("fill", feature => feature.properties.gdpRecord ? color(feature.properties.gdpRecord.gdp) : "#e2e5e8")
        .attr("tabindex", feature => feature.properties.gdpRecord ? 0 : null)
        .attr("aria-label", feature => feature.properties.gdpRecord ? `${feature.properties.gdpRecord.country}: ${formatGDP(feature.properties.gdpRecord.gdp)}` : "No GDP data")
        .on("mouseenter", (event, feature) => {
            if (feature.properties.gdpRecord) {
                hoveredId = feature.properties.iso3;
                updateLinkedHighlight();
                showTooltip(event, feature.properties.gdpRecord);
            }
        })
        .on("mousemove", event => moveTooltip(event))
        .on("mouseleave", () => {
            hoveredId = null;
            updateLinkedHighlight();
            hideTooltip();
        })
        .on("click", (event, feature) => toggleSelected(feature.properties.iso3, feature.properties.gdpRecord, event))
        .on("keydown", (event, feature) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleSelected(feature.properties.iso3, feature.properties.gdpRecord, event);
            }
        });

    const zoom = d3.zoom().scaleExtent([1, 7]).on("zoom", event => mapGroup.attr("transform", event.transform));
    svg.call(zoom);
    d3.select("#reset-map").on("click", () => svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity));
    registerLinkedLayer(countries, "country");
    drawLegend(color, d3.extent(values));
}

function drawLegend(color, domain) {
    const legendWidth = 235;
    const legendHeight = 42;
    const legend = d3.select("#color-legend").append("svg")
        .attr("width", 286)
        .attr("height", 47)
        .attr("viewBox", `0 0 ${legendWidth} ${legendHeight}`);
    const gradient = legend.append("defs").append("linearGradient").attr("id", "gdp-gradient");
    d3.range(0, 1.01, .02).forEach(stop => gradient.append("stop").attr("offset", `${stop * 100}%`).attr("stop-color", color(domain[0] * Math.pow(domain[1] / domain[0], stop))));
    const scale = d3.scaleLog().domain(domain).range([0, 150]);
    legend.append("rect").attr("x", 0).attr("y", 4).attr("width", 150).attr("height", 10).attr("fill", "url(#gdp-gradient)");
    legend.append("g").attr("transform", "translate(0,14)").call(d3.axisBottom(scale).tickValues([500, 5000, 30000]).tickFormat(value => `$${d3.format("~s")(value)}B`));
    legend.append("rect").attr("x", 171).attr("y", 4).attr("width", 10).attr("height", 10).attr("fill", "#e2e5e8").attr("stroke", "#bbb");
    legend.append("text").attr("x", 187).attr("y", 13).attr("font-size", 10).text("No data");
}

function drawCartogram(countriesWithGDP) {
    const svg = d3.select("#cartogram").append("svg")
        .attr("viewBox", `0 0 ${width} ${cartogramHeight}`)
        .attr("role", "img")
        .attr("aria-label", "Dorling cartogram where country circle area represents 2025 GDP");
    const projection = d3.geoNaturalEarth1().fitExtent([[30, 40], [width - 30, cartogramHeight - 32]], { type: "FeatureCollection", features: countriesWithGDP });
    const path = d3.geoPath(projection);
    const radius = d3.scaleSqrt().domain(d3.extent(countriesWithGDP, feature => feature.properties.gdpRecord.gdp)).range([9, 72]);
    const nodes = countriesWithGDP.map(feature => {
        const [x, y] = path.centroid(feature);
        return { ...feature.properties.gdpRecord, x, y, homeX: x, homeY: y, r: radius(feature.properties.gdpRecord.gdp) };
    });

    svg.append("text").attr("x", 20).attr("y", 25).attr("font-size", 13).attr("fill", "#555").text("Circle area represents 2025 GDP; positions are approximate.");
    const circles = svg.append("g").selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("class", "cartogram-country")
        .attr("r", node => node.r)
        .attr("tabindex", 0)
        .attr("aria-label", node => `${node.country}: ${formatGDP(node.gdp)}`)
        .on("mouseenter", (event, node) => {
            hoveredId = node.iso3;
            updateLinkedHighlight();
            showTooltip(event, node);
        })
        .on("mousemove", event => moveTooltip(event))
        .on("mouseleave", () => {
            hoveredId = null;
            updateLinkedHighlight();
            hideTooltip();
        })
        .on("click", (event, node) => toggleSelected(node.iso3, node, event))
        .on("keydown", (event, node) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleSelected(node.iso3, node, event);
            }
        });
    const labels = svg.append("g").selectAll("text.country-label")
        .data(nodes.filter(node => node.rank <= 15))
        .join("text")
        .attr("class", "cartogram-label")
        .text(node => node.iso3);

    d3.forceSimulation(nodes)
        .force("x", d3.forceX(node => node.homeX).strength(.22))
        .force("y", d3.forceY(node => node.homeY).strength(.22))
        .force("collide", d3.forceCollide(node => node.r + 2).iterations(2))
        .on("tick", () => {
            circles.attr("cx", node => node.x).attr("cy", node => node.y);
            labels.attr("x", node => node.x).attr("y", node => node.y + 3);
        });
    registerLinkedLayer(circles, "cartogram-country");
}

const linkedLayers = [];

function registerLinkedLayer(selection, className) {
    linkedLayers.push({ selection, className });
}

function updateLinkedHighlight() {
    linkedLayers.forEach(({ selection }) => {
        selection.classed("is-hovered", datum => datum.properties ? datum.properties.iso3 === hoveredId : datum.iso3 === hoveredId)
            .classed("is-selected", datum => datum.properties ? datum.properties.iso3 === selectedId : datum.iso3 === selectedId);
    });
}

function toggleSelected(iso3, record, event) {
    if (!record) return;
    selectedId = selectedId === iso3 ? null : iso3;
    updateLinkedHighlight();
    showTooltip(event, record);
}

function showTooltip(event, record) {
    tooltip.html(`<strong>${record.country}</strong><br>Rank: ${record.rank}<br>2025 GDP: ${formatGDP(record.gdp)}`)
        .style("opacity", 1);
    moveTooltip(event);
}

function moveTooltip(event) {
    tooltip.style("left", `${event.pageX + 12}px`).style("top", `${event.pageY + 12}px`);
}

function hideTooltip() {
    tooltip.style("opacity", 0);
}
