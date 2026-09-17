d3.json(
    "../data/lab6_assignment_gdp.json"
)
.then(data => {

    const statuses = [
        "Increase",
        "Unchanged",
        "Decrease"
    ];

    const colorScale = d3.scaleOrdinal()
        .domain(statuses)
        .range([
            "#4F8A8B",
            "#8D99AE",
            "#C76D5E"
        ]);

    const tooltip = d3.select(
        "#tooltip"
    );

    function showTooltip(
        event,
        d
    ) {

        if (d.depth === 3) {

            const country =
                d.data.name;

            const area =
                d.parent.data.name;

            const continent =
                d.parent.parent.data.name;

            tooltip
                .style(
                    "opacity",
                    1
                )
                .html(`
                    <strong>${country}</strong>
                    <br>
                    Continent: ${continent}
                    <br>
                    Area: ${area}
                    <br>
                    GDP: $${d.data.gdp.toLocaleString()} billion
                    <br>
                    Status: ${d.data.status}
                `);

        } else {

            tooltip
                .style(
                    "opacity",
                    1
                )
                .html(`
                    <strong>${d.data.name}</strong>
                    <br>
                    Total GDP:
                    $${d.value.toLocaleString()} billion
                `);
        }

        tooltip
            .style(
                "left",
                `${event.pageX + 12}px`
            )
            .style(
                "top",
                `${event.pageY + 12}px`
            );
    }

    function moveTooltip(
        event
    ) {

        tooltip
            .style(
                "left",
                `${event.pageX + 12}px`
            )
            .style(
                "top",
                `${event.pageY + 12}px`
            );
    }

    function hideTooltip() {

        tooltip.style(
            "opacity",
            0
        );
    }

    function addLegend(
        svg,
        x,
        y
    ) {

        const legend = svg
            .append("g")
            .attr(
                "transform",
                `translate(${x},${y})`
            );

        legend.append("text")
            .attr(
                "x",
                0
            )
            .attr(
                "y",
                0
            )
            .attr(
                "font-weight",
                "bold"
            )
            .text(
                "GDP Status"
            );

        const items = legend
            .selectAll(
                ".legend-item"
            )
            .data(
                statuses
            )
            .join("g")
            .attr(
                "class",
                "legend-item"
            )
            .attr(
                "transform",
                (d, i) =>
                    `translate(0,${25 + i * 25})`
            );

        items.append("rect")
            .attr(
                "width",
                15
            )
            .attr(
                "height",
                15
            )
            .attr(
                "rx",
                2
            )
            .attr(
                "fill",
                d => colorScale(d)
            );

        items.append("text")
            .attr(
                "x",
                22
            )
            .attr(
                "y",
                12
            )
            .attr(
                "font-size",
                12
            )
            .text(
                d => d
            );
    }

    function shortenLabel(
        text,
        width,
        fontSize
    ) {

        const maxCharacters =
            Math.floor(
                width /
                (fontSize * 0.6)
            );

        if (
            maxCharacters < 4
        ) {
            return "";
        }

        if (
            text.length <=
            maxCharacters
        ) {
            return text;
        }

        return (
            text.slice(
                0,
                maxCharacters - 3
            ) + "..."
        );
    }


    const treeWidth = 1100;
    const treeHeight = 720;

    const treeRoot =
        d3.hierarchy(data)
            .sum(
                d => d.gdp || 0
            );

    const treeLayout =
        d3.tree()
            .size([
                treeHeight - 120,
                treeWidth - 300
            ]);

    treeLayout(
        treeRoot
    );

    const gdpValues =
        treeRoot.leaves()
            .map(
                d => d.data.gdp
            );

    const radiusScale =
        d3.scaleSqrt()
            .domain([
                d3.min(gdpValues),
                d3.max(gdpValues)
            ])
            .range([
                5,
                18
            ]);

    const treeSection =
        d3.select("#tree");

    treeSection.append("h2")
        .text(
            "Node-Link Tree"
        );

    const treeSvg =
        treeSection
            .append("svg")
            .attr(
                "width",
                treeWidth
            )
            .attr(
                "height",
                treeHeight
            );

    const treeGroup =
        treeSvg
            .append("g")
            .attr(
                "transform",
                "translate(80,40)"
            );

    treeGroup
        .selectAll(
            ".tree-link"
        )
        .data(
            treeRoot.links()
        )
        .join("path")
        .attr(
            "class",
            "tree-link"
        )
        .attr(
            "fill",
            "none"
        )
        .attr(
            "stroke",
            "#B0B7C3"
        )
        .attr(
            "stroke-width",
            1.3
        )
        .attr(
            "d",
            d3.linkHorizontal()
                .x(
                    d => d.y
                )
                .y(
                    d => d.x
                )
        );

    const treeNodes =
        treeGroup
            .selectAll(
                ".tree-node"
            )
            .data(
                treeRoot.descendants()
            )
            .join("g")
            .attr(
                "class",
                "tree-node"
            )
            .attr(
                "transform",
                d =>
                    `translate(${d.y},${d.x})`
            );

    treeNodes.append("circle")
        .attr(
            "r",
            d =>
                d.depth === 3
                    ? radiusScale(
                        d.data.gdp
                    )
                    : 7
        )
        .attr(
            "fill",
            d =>
                d.depth === 3
                    ? colorScale(
                        d.data.status
                    )
                    : "#58677C"
        )
        .attr(
            "stroke",
            "white"
        )
        .attr(
            "stroke-width",
            1.5
        );

    treeNodes.append("text")
        .attr(
            "x",
            d => {

                if (
                    d.depth === 3
                ) {
                    return (
                        radiusScale(
                            d.data.gdp
                        ) + 5
                    );
                }

                return 0;
            }
        )
        .attr(
            "y",
            d => {

                if (
                    d.depth === 3
                ) {
                    return 0;
                }

                return 18;
            }
        )
        .attr(
            "dy",
            d =>
                d.depth === 3
                    ? "0.35em"
                    : "0"
        )
        .attr(
            "text-anchor",
            d =>
                d.depth === 3
                    ? "start"
                    : "middle"
        )
        .attr(
            "font-size",
            d =>
                d.depth === 3
                    ? 10
                    : 11
        )
        .attr(
            "font-weight",
            d =>
                d.depth < 3
                    ? "600"
                    : "normal"
        )
        .attr(
            "fill",
            "#2F3542"
        )
        .text(
            d => d.data.name
        );

    treeNodes
        .on(
            "mouseover",
            function(
                event,
                d
            ) {

                d3.select(this)
                    .select("circle")
                    .attr(
                        "stroke",
                        "#2F3542"
                    )
                    .attr(
                        "stroke-width",
                        2.5
                    );

                showTooltip(
                    event,
                    d
                );
            }
        )
        .on(
            "mousemove",
            moveTooltip
        )
        .on(
            "mouseout",
            function() {

                d3.select(this)
                    .select("circle")
                    .attr(
                        "stroke",
                        "white"
                    )
                    .attr(
                        "stroke-width",
                        1.5
                    );

                hideTooltip();
            }
        );

    addLegend(
        treeSvg,
        treeWidth - 150,
        40
    );


    const treemapWidth = 1000;
    const treemapHeight = 600;

    const treemapRoot =
        d3.hierarchy(data)
            .sum(
                d => d.gdp || 0
            )
            .sort(
                (a, b) =>
                    b.value - a.value
            );

    const treemapLayout =
        d3.treemap()
            .size([
                treemapWidth,
                treemapHeight
            ])
            .tile(
                d3.treemapSquarify
            )
            .paddingOuter(4)
            .paddingInner(2)
            .paddingTop(
                d => {

                    if (
                        d.depth === 1
                    ) {
                        return 25;
                    }

                    if (
                        d.depth === 2
                    ) {
                        return 20;
                    }

                    return 0;
                }
            );

    treemapLayout(
        treemapRoot
    );

    const treemapSection =
        d3.select(
            "#treemap"
        );

    treemapSection.append("h2")
        .text(
            "Treemap"
        );

    const treemapSvg =
        treemapSection
            .append("svg")
            .attr(
                "width",
                treemapWidth
            )
            .attr(
                "height",
                treemapHeight + 100
            );

    const continents =
        treemapRoot.descendants()
            .filter(
                d => d.depth === 1
            );

    treemapSvg
        .selectAll(
            ".continent-border"
        )
        .data(
            continents
        )
        .join("rect")
        .attr(
            "x",
            d => d.x0
        )
        .attr(
            "y",
            d => d.y0
        )
        .attr(
            "width",
            d =>
                d.x1 - d.x0
        )
        .attr(
            "height",
            d =>
                d.y1 - d.y0
        )
        .attr(
            "fill",
            "none"
        )
        .attr(
            "stroke",
            "#394150"
        )
        .attr(
            "stroke-width",
            1.8
        );

    treemapSvg
        .selectAll(
            ".continent-label"
        )
        .data(
            continents
        )
        .join("text")
        .attr(
            "x",
            d => d.x0 + 6
        )
        .attr(
            "y",
            d => d.y0 + 17
        )
        .attr(
            "font-size",
            13
        )
        .attr(
            "font-weight",
            "700"
        )
        .attr(
            "fill",
            "#2F3542"
        )
        .text(
            d =>
                shortenLabel(
                    d.data.name,
                    d.x1 -
                    d.x0 -
                    12,
                    13
                )
        );

    const areas =
        treemapRoot.descendants()
            .filter(
                d => d.depth === 2
            );

    treemapSvg
        .selectAll(
            ".area-border"
        )
        .data(
            areas
        )
        .join("rect")
        .attr(
            "x",
            d => d.x0
        )
        .attr(
            "y",
            d => d.y0
        )
        .attr(
            "width",
            d =>
                d.x1 - d.x0
        )
        .attr(
            "height",
            d =>
                d.y1 - d.y0
        )
        .attr(
            "fill",
            "none"
        )
        .attr(
            "stroke",
            "#858C97"
        )
        .attr(
            "stroke-width",
            0.9
        );

    treemapSvg
        .selectAll(
            ".area-label"
        )
        .data(
            areas
        )
        .join("text")
        .attr(
            "x",
            d => d.x0 + 5
        )
        .attr(
            "y",
            d => d.y0 + 14
        )
        .attr(
            "font-size",
            10
        )
        .attr(
            "font-weight",
            "600"
        )
        .attr(
            "fill",
            "#4A4F59"
        )
        .text(
            d =>
                shortenLabel(
                    d.data.name,
                    d.x1 -
                    d.x0 -
                    10,
                    10
                )
        );

    const leaves =
        treemapRoot.leaves();

    const cells =
        treemapSvg
            .selectAll(
                ".cell"
            )
            .data(
                leaves
            )
            .join("g")
            .attr(
                "class",
                "cell"
            )
            .attr(
                "transform",
                d =>
                    `translate(${d.x0},${d.y0})`
            );

    cells.append("rect")
        .attr(
            "width",
            d =>
                Math.max(
                    0,
                    d.x1 - d.x0
                )
        )
        .attr(
            "height",
            d =>
                Math.max(
                    0,
                    d.y1 - d.y0
                )
        )
        .attr(
            "fill",
            d =>
                colorScale(
                    d.data.status
                )
        )
        .attr(
            "stroke",
            "#F7F7F7"
        )
        .attr(
            "stroke-width",
            1
        );

    cells.append("text")
        .attr(
            "x",
            5
        )
        .attr(
            "y",
            16
        )
        .attr(
            "fill",
            "white"
        )
        .attr(
            "font-size",
            10
        )
        .attr(
            "font-weight",
            "600"
        )
        .text(
            d => {

                const width =
                    d.x1 - d.x0;

                const height =
                    d.y1 - d.y0;

                if (
                    width > 55 &&
                    height > 25
                ) {

                    return shortenLabel(
                        d.data.name,
                        width - 10,
                        10
                    );
                }

                return "";
            }
        );

    cells
        .on(
            "mouseover",
            function(
                event,
                d
            ) {

                d3.select(this)
                    .select("rect")
                    .attr(
                        "stroke",
                        "#252A34"
                    )
                    .attr(
                        "stroke-width",
                        2
                    );

                showTooltip(
                    event,
                    d
                );
            }
        )
        .on(
            "mousemove",
            moveTooltip
        )
        .on(
            "mouseout",
            function() {

                d3.select(this)
                    .select("rect")
                    .attr(
                        "stroke",
                        "#F7F7F7"
                    )
                    .attr(
                        "stroke-width",
                        1
                    );

                hideTooltip();
            }
        );

    addLegend(
        treemapSvg,
        20,
        treemapHeight + 30
    );

})
.catch(error => {

    console.error(error);

});