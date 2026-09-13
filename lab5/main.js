Promise.all([
    d3.csv(
        "../data/lab5_assignment_stations.csv",
        d => ({
            id: d.id,
            station_name: d.station_name,
            district: d.district,
            daily_passengers: +d.daily_passengers,
            station_type: d.station_type
        })
    ),

    d3.csv(
        "../data/lab5_assignment_routes.csv",
        d => ({
            source: d.source,
            target: d.target,
            travel_time_min: +d.travel_time_min,
            route_type: d.route_type
        })
    )
])
.then(([nodes, links]) => {

    const width = 850;
    const height = 650;

    const svg = d3.select("#network")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const sizeScale = d3.scaleSqrt()
        .domain(
            d3.extent(
                nodes,
                d => d.daily_passengers
            )
        )
        .range([7, 22]);

    const districts = Array.from(
        new Set(
            nodes.map(d => d.district)
        )
    );

    const districtColorScale = d3.scaleOrdinal()
        .domain(districts)
        .range(d3.schemeTableau10);

    const stationTypeColorScale = d3.scaleOrdinal()
        .domain([
            "Local",
            "Transfer",
            "Terminal"
        ])
        .range([
            "#222222",
            "#FFD700",
            "#8A2BE2"
        ]);

    const travelTimeScale = d3.scaleLinear()
        .domain(
            d3.extent(
                links,
                d => d.travel_time_min
            )
        )
        .range([1, 6]);

    const degree = new Map(
        nodes.map(d => [d.id, 0])
    );

    links.forEach(d => {

        degree.set(
            d.source,
            degree.get(d.source) + 1
        );

        degree.set(
            d.target,
            degree.get(d.target) + 1
        );

    });

    nodes.forEach(d => {
        d.degree = degree.get(d.id);
    });

    const link = svg.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#666")
        .attr(
            "stroke-width",
            d => travelTimeScale(
                d.travel_time_min
            )
        )
        .attr(
            "stroke-dasharray",
            d => {

                if (
                    d.route_type === "Express"
                ) {
                    return "8,5";
                }

                if (
                    d.route_type === "Shuttle"
                ) {
                    return "2,4";
                }

                return null;
            }
        )
        .attr("stroke-opacity", 0.75);

    const node = svg.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr(
            "r",
            d => sizeScale(
                d.daily_passengers
            )
        )
        .attr(
            "fill",
            d => districtColorScale(
                d.district
            )
        )
        .attr(
            "stroke",
            d => stationTypeColorScale(
                d.station_type
            )
        )
        .attr("stroke-width", 4);

    const districtCenters = {
        Central: {
            x: width / 2,
            y: height / 2
        },

        North: {
            x: width / 2,
            y: height * 0.22
        },

        South: {
            x: width / 2,
            y: height * 0.78
        },

        East: {
            x: width * 0.78,
            y: height / 2
        },

        West: {
            x: width * 0.22,
            y: height / 2
        }
    };

    const simulation = d3.forceSimulation(nodes)

        .force(
            "link",
            d3.forceLink(links)
                .id(d => d.id)
                .distance(65)
        )

        .force(
            "charge",
            d3.forceManyBody()
                .strength(-80)
        )

        .force(
            "x",
            d3.forceX(
                d => districtCenters[d.district].x
            )
            .strength(0.05)
        )

        .force(
            "y",
            d3.forceY(
                d => districtCenters[d.district].y
            )
            .strength(0.05)
        )

        .force(
            "collision",
            d3.forceCollide()
                .radius(
                    d =>
                        sizeScale(
                            d.daily_passengers
                        ) + 5
                )
        );

    const boundaryPadding = 30;

    simulation.on(
        "tick",
        () => {

            node
                .attr(
                    "cx",
                    d => {

                        d.x = Math.max(
                            boundaryPadding,
                            Math.min(
                                width - boundaryPadding,
                                d.x
                            )
                        );

                        return d.x;
                    }
                )
                .attr(
                    "cy",
                    d => {

                        d.y = Math.max(
                            boundaryPadding,
                            Math.min(
                                height - boundaryPadding,
                                d.y
                            )
                        );

                        return d.y;
                    }
                );

            link
                .attr(
                    "x1",
                    d => d.source.x
                )
                .attr(
                    "y1",
                    d => d.source.y
                )
                .attr(
                    "x2",
                    d => d.target.x
                )
                .attr(
                    "y2",
                    d => d.target.y
                );
        }
    );

    function dragStarted(event, d) {

        if (!event.active) {
            simulation
                .alphaTarget(0.3)
                .restart();
        }

        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {

        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(event, d) {

        if (!event.active) {
            simulation
                .alphaTarget(0);
        }

        d.fx = d.x;
        d.fy = d.y;
    }

    node.call(
        d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded)
    );

    node.on(
        "dblclick",
        function(event, d) {

            d.fx = null;
            d.fy = null;

            simulation
                .alpha(0.3)
                .restart();
        }
    );

    function isConnected(
        nodeA,
        nodeB
    ) {

        return links.some(
            link =>
                (
                    link.source.id === nodeA.id &&
                    link.target.id === nodeB.id
                )
                ||
                (
                    link.source.id === nodeB.id &&
                    link.target.id === nodeA.id
                )
        );
    }

    node.on(
        "mouseover.highlight",
        function(event, d) {

            node.attr(
                "opacity",
                other =>
                    (
                        other.id === d.id ||
                        isConnected(d, other)
                    )
                        ? 1
                        : 0.15
            );

            link.attr(
                "opacity",
                l =>
                    (
                        l.source.id === d.id ||
                        l.target.id === d.id
                    )
                        ? 1
                        : 0.08
            );
        }
    );

    node.on(
        "mouseout.highlight",
        function() {

            node.attr(
                "opacity",
                1
            );

            link.attr(
                "opacity",
                0.75
            );
        }
    );

    const tooltip =
        d3.select("#tooltip");

    node
        .on(
            "mouseover.tooltip",
            function(event, d) {

                tooltip
                    .style("opacity", 1)
                    .html(`
                        <strong>${d.station_name}</strong>
                        <br>
                        ID: ${d.id}
                        <br>
                        District: ${d.district}
                        <br>
                        Daily Passengers:
                        ${d.daily_passengers}
                        <br>
                        Station Type:
                        ${d.station_type}
                        <br>
                        Connections:
                        ${d.degree}
                    `);
            }
        )

        .on(
            "mousemove.tooltip",
            function(event) {

                tooltip
                    .style(
                        "left",
                        `${event.pageX + 10}px`
                    )
                    .style(
                        "top",
                        `${event.pageY + 10}px`
                    );
            }
        )

        .on(
            "mouseout.tooltip",
            function() {

                tooltip.style(
                    "opacity",
                    0
                );
            }
        );

    link
        .on(
            "mouseover.tooltip",
            function(event, d) {

                d3.select(this)
                    .attr(
                        "stroke-opacity",
                        1
                    );

                tooltip
                    .style(
                        "opacity",
                        1
                    )
                    .html(`
                        <strong>
                            ${d.source.station_name}
                            —
                            ${d.target.station_name}
                        </strong>
                        <br>
                        Travel Time:
                        ${d.travel_time_min} min
                        <br>
                        Route Type:
                        ${d.route_type}
                    `);
            }
        )

        .on(
            "mousemove.tooltip",
            function(event) {

                tooltip
                    .style(
                        "left",
                        `${event.pageX + 10}px`
                    )
                    .style(
                        "top",
                        `${event.pageY + 10}px`
                    );
            }
        )

        .on(
            "mouseout.tooltip",
            function() {

                d3.select(this)
                    .attr(
                        "stroke-opacity",
                        0.75
                    );

                tooltip.style(
                    "opacity",
                    0
                );
            }
        );

    const legend =
        d3.select("#network-legend");

    legend
        .append("h3")
        .text("District");

    const districtLegend =
        legend
            .selectAll(".district-item")
            .data(districts)
            .join("div")
            .attr(
                "class",
                "district-item"
            );

    districtLegend
        .append("span")
        .style(
            "display",
            "inline-block"
        )
        .style(
            "width",
            "14px"
        )
        .style(
            "height",
            "14px"
        )
        .style(
            "margin-right",
            "6px"
        )
        .style(
            "background-color",
            d =>
                districtColorScale(d)
        );

    districtLegend
        .append("span")
        .text(d => d);

    legend
        .append("h3")
        .text("Station Type");

    const stationTypes = [
        "Local",
        "Transfer",
        "Terminal"
    ];

    const stationLegend =
        legend
            .selectAll(".station-type-item")
            .data(stationTypes)
            .join("div")
            .attr(
                "class",
                "station-type-item"
            );

    stationLegend
        .append("span")
        .style(
            "display",
            "inline-block"
        )
        .style(
            "width",
            "14px"
        )
        .style(
            "height",
            "14px"
        )
        .style(
            "border-radius",
            "50%"
        )
        .style(
            "border",
            d =>
                `4px solid ${
                    stationTypeColorScale(d)
                }`
        )
        .style(
            "margin-right",
            "6px"
        );

    stationLegend
        .append("span")
        .text(d => d);

    legend
        .append("h3")
        .text("Route Type");

    const routeLegendData = [
        {
            type: "Metro",
            dash: null
        },
        {
            type: "Express",
            dash: "8,5"
        },
        {
            type: "Shuttle",
            dash: "2,4"
        }
    ];

    const routeLegend =
        legend
            .selectAll(".route-item")
            .data(routeLegendData)
            .join("div")
            .attr(
                "class",
                "route-item"
            );

    routeLegend.each(
        function(d) {

            const item =
                d3.select(this);

            const miniSvg =
                item
                    .append("svg")
                    .attr(
                        "width",
                        55
                    )
                    .attr(
                        "height",
                        16
                    );

            miniSvg
                .append("line")
                .attr(
                    "x1",
                    2
                )
                .attr(
                    "x2",
                    48
                )
                .attr(
                    "y1",
                    8
                )
                .attr(
                    "y2",
                    8
                )
                .attr(
                    "stroke",
                    "#666"
                )
                .attr(
                    "stroke-width",
                    3
                )
                .attr(
                    "stroke-dasharray",
                    d.dash
                );

            item
                .append("span")
                .text(d.type);
        }
    );

    legend
        .append("h3")
        .text("Travel Time");

    legend
        .append("p")
        .text(
            "Thicker links indicate longer travel times."
        );

    const districtOrder = [
    "Central",
    "North",
    "East",
    "South",
    "West"
];

const sortedNodes = [...nodes]
    .sort(
        (a, b) => {

            const districtDifference =
                districtOrder.indexOf(a.district) -
                districtOrder.indexOf(b.district);

            if (districtDifference !== 0) {
                return districtDifference;
            }

            return d3.ascending(
                a.id,
                b.id
            );
        }
    );

const matrixData = [];

sortedNodes.forEach(
    rowNode => {

        sortedNodes.forEach(
            colNode => {

                const foundLink =
                    links.find(
                        link =>
                            (
                                link.source.id === rowNode.id &&
                                link.target.id === colNode.id
                            )
                            ||
                            (
                                link.source.id === colNode.id &&
                                link.target.id === rowNode.id
                            )
                    );

                matrixData.push({
                    row: rowNode.id,
                    col: colNode.id,
                    rowNode: rowNode,
                    colNode: colNode,
                    travel_time_min:
                        foundLink
                            ? foundLink.travel_time_min
                            : 0,
                    route_type:
                        foundLink
                            ? foundLink.route_type
                            : null
                });
            }
        );
    }
);

const matrixSize = 650;

const matrixMargin = {
    top: 120,
    right: 40,
    bottom: 40,
    left: 120
};

const matrixX = d3.scaleBand()
    .domain(
        sortedNodes.map(
            d => d.id
        )
    )
    .range([
        0,
        matrixSize
    ])
    .padding(0.03);

const matrixY = d3.scaleBand()
    .domain(
        sortedNodes.map(
            d => d.id
        )
    )
    .range([
        0,
        matrixSize
    ])
    .padding(0.03);

const matrixRouteTypes = Array.from(
    new Set(
        links.map(
            d => d.route_type
        )
    )
);

const matrixColorScale = d3.scaleOrdinal()
    .domain(matrixRouteTypes)
    .range(d3.schemeSet2);

const matrixOpacityScale = d3.scaleLinear()
    .domain(
        d3.extent(
            links,
            d => d.travel_time_min
        )
    )
    .range([
        0.3,
        1
    ]);

const matrixSvg = d3.select("#matrix")
    .append("svg")
    .attr(
        "width",
        matrixSize +
        matrixMargin.left +
        matrixMargin.right
    )
    .attr(
        "height",
        matrixSize +
        matrixMargin.top +
        matrixMargin.bottom
    );

const matrixGroup =
    matrixSvg.append("g")
        .attr(
            "transform",
            `translate(
                ${matrixMargin.left},
                ${matrixMargin.top}
            )`
        );

const matrixCells =
    matrixGroup
        .selectAll("rect")
        .data(matrixData)
        .join("rect")
        .attr(
            "x",
            d => matrixX(d.col)
        )
        .attr(
            "y",
            d => matrixY(d.row)
        )
        .attr(
            "width",
            matrixX.bandwidth()
        )
        .attr(
            "height",
            matrixY.bandwidth()
        )
        .attr(
            "fill",
            d =>
                d.route_type
                    ? matrixColorScale(
                        d.route_type
                    )
                    : "#f3f3f3"
        )
        .attr(
            "fill-opacity",
            d =>
                d.route_type
                    ? matrixOpacityScale(
                        d.travel_time_min
                    )
                    : 1
        );

const rowLabels =
    matrixGroup
        .selectAll(".row-label")
        .data(sortedNodes)
        .join("text")
        .attr(
            "class",
            "row-label"
        )
        .attr(
            "x",
            -8
        )
        .attr(
            "y",
            d =>
                matrixY(d.id) +
                matrixY.bandwidth() / 2
        )
        .attr(
            "text-anchor",
            "end"
        )
        .attr(
            "dominant-baseline",
            "middle"
        )
        .attr(
            "font-size",
            9
        )
        .attr(
            "fill",
            d =>
                districtColorScale(
                    d.district
                )
        )
        .style(
            "cursor",
            "pointer"
        )
        .text(
            d => d.id
        );

const columnLabels =
    matrixGroup
        .selectAll(".column-label")
        .data(sortedNodes)
        .join("text")
        .attr(
            "class",
            "column-label"
        )
        .attr(
            "transform",
            d =>
                `translate(
                    ${
                        matrixX(d.id) +
                        matrixX.bandwidth() / 2
                    },
                    -8
                )
                rotate(-90)`
        )
        .attr(
            "text-anchor",
            "start"
        )
        .attr(
            "font-size",
            9
        )
        .attr(
            "fill",
            d =>
                districtColorScale(
                    d.district
                )
        )
        .style(
            "cursor",
            "pointer"
        )
        .text(
            d => d.id
        );

function showStationTooltip(
    event,
    d
) {

    tooltip
        .style(
            "opacity",
            1
        )
        .html(`
            <strong>${d.station_name}</strong>
            <br>
            ID: ${d.id}
            <br>
            District: ${d.district}
            <br>
            Daily Passengers:
            ${d.daily_passengers}
            <br>
            Station Type:
            ${d.station_type}
            <br>
            Connections:
            ${d.degree}
        `);
}

function moveStationTooltip(event) {

    tooltip
        .style(
            "left",
            `${event.pageX + 10}px`
        )
        .style(
            "top",
            `${event.pageY + 10}px`
        );
}

function hideStationTooltip() {

    tooltip
        .style(
            "opacity",
            0
        );
}

rowLabels
    .on(
        "mouseover",
        showStationTooltip
    )
    .on(
        "mousemove",
        moveStationTooltip
    )
    .on(
        "mouseout",
        hideStationTooltip
    );

columnLabels
    .on(
        "mouseover",
        showStationTooltip
    )
    .on(
        "mousemove",
        moveStationTooltip
    )
    .on(
        "mouseout",
        hideStationTooltip
    );

matrixCells
    .on(
        "mouseover",
        function(event, d) {

            if (!d.route_type) {
                return;
            }

            d3.select(this)
                .attr(
                    "stroke",
                    "#222"
                )
                .attr(
                    "stroke-width",
                    1.5
                );

            tooltip
                .style(
                    "opacity",
                    1
                )
                .html(`
                    <strong>
                        ${d.rowNode.station_name}
                        —
                        ${d.colNode.station_name}
                    </strong>
                    <br>
                    Route Type:
                    ${d.route_type}
                    <br>
                    Travel Time:
                    ${d.travel_time_min} min
                `);
        }
    )
    .on(
        "mousemove",
        function(event, d) {

            if (!d.route_type) {
                return;
            }

            tooltip
                .style(
                    "left",
                    `${event.pageX + 10}px`
                )
                .style(
                    "top",
                    `${event.pageY + 10}px`
                );
        }
    )
    .on(
        "mouseout",
        function(event, d) {

            if (!d.route_type) {
                return;
            }

            d3.select(this)
                .attr(
                    "stroke",
                    null
                );

            tooltip
                .style(
                    "opacity",
                    0
                );
        }
    );

const matrixLegend =
    d3.select("#matrix-legend");

matrixLegend
    .append("h3")
    .text("Station District");

const matrixDistrictLegend =
    matrixLegend
        .selectAll(".matrix-district-item")
        .data(districts)
        .join("div")
        .attr(
            "class",
            "matrix-district-item"
        );

matrixDistrictLegend
    .append("span")
    .style(
        "display",
        "inline-block"
    )
    .style(
        "width",
        "14px"
    )
    .style(
        "height",
        "14px"
    )
    .style(
        "margin-right",
        "6px"
    )
    .style(
        "background-color",
        d =>
            districtColorScale(d)
    );

matrixDistrictLegend
    .append("span")
    .text(
        d => d
    );

matrixLegend
    .append("h3")
    .text("Route Type");

const matrixRouteLegend =
    matrixLegend
        .selectAll(".matrix-route-item")
        .data(matrixRouteTypes)
        .join("div")
        .attr(
            "class",
            "matrix-route-item"
        );

matrixRouteLegend
    .append("span")
    .style(
        "display",
        "inline-block"
    )
    .style(
        "width",
        "14px"
    )
    .style(
        "height",
        "14px"
    )
    .style(
        "margin-right",
        "6px"
    )
    .style(
        "background-color",
        d =>
            matrixColorScale(d)
    );

matrixRouteLegend
    .append("span")
    .text(
        d => d
    );

matrixLegend
    .append("h3")
    .text("Travel Time");

const travelTimeLegendSvg =
    matrixLegend
        .append("svg")
        .attr(
            "width",
            150
        )
        .attr(
            "height",
            45
        );

const legendGradient =
    travelTimeLegendSvg
        .append("defs")
        .append("linearGradient")
        .attr(
            "id",
            "travel-time-gradient"
        )
        .attr(
            "x1",
            "0%"
        )
        .attr(
            "x2",
            "100%"
        );

legendGradient
    .append("stop")
    .attr(
        "offset",
        "0%"
    )
    .attr(
        "stop-color",
        "#777"
    )
    .attr(
        "stop-opacity",
        0.3
    );

legendGradient
    .append("stop")
    .attr(
        "offset",
        "100%"
    )
    .attr(
        "stop-color",
        "#777"
    )
    .attr(
        "stop-opacity",
        1
    );

travelTimeLegendSvg
    .append("rect")
    .attr(
        "x",
        5
    )
    .attr(
        "y",
        5
    )
    .attr(
        "width",
        120
    )
    .attr(
        "height",
        12
    )
    .attr(
        "fill",
        "url(#travel-time-gradient)"
    );

travelTimeLegendSvg
    .append("text")
    .attr(
        "x",
        5
    )
    .attr(
        "y",
        35
    )
    .attr(
        "font-size",
        11
    )
    .text("Short");

travelTimeLegendSvg
    .append("text")
    .attr(
        "x",
        125
    )
    .attr(
        "y",
        35
    )
    .attr(
        "text-anchor",
        "end"
    )
    .attr(
        "font-size",
        11
    )
    .text("Long");


});