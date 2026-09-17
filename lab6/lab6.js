d3.json(
    "../data/lab6_assignment_gdp.json"
)
.then(data => {

    const width = 1000;
    const height = 700;

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

    function shortenLabel(
        text,
        availableWidth,
        fontSize
    ) {

        const maxCharacters =
            Math.floor(
                availableWidth /
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

    function addLegend(
        svg,
        y
    ) {

        const legend = svg
            .append("g")
            .attr(
                "transform",
                `translate(20,${y})`
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

        const items =
            legend.selectAll(
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
                    `translate(${i * 150},20)`
            );

        items.append("rect")
            .attr(
                "width",
                16
            )
            .attr(
                "height",
                16
            )
            .attr(
                "rx",
                2
            )
            .attr(
                "fill",
                d =>
                    colorScale(d)
            );

        items.append("text")
            .attr(
                "x",
                23
            )
            .attr(
                "y",
                13
            )
            .attr(
                "font-size",
                12
            )
            .text(
                d => d
            );
    }

    function drawTreemap(
        container,
        title,
        tileMethod,
        compactPadding
    ) {

        const root =
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
                    width,
                    height
                ])
                .tile(
                    tileMethod
                )
                .paddingOuter(
                    compactPadding
                        ? 2
                        : 4
                )
                .paddingInner(
                    compactPadding
                        ? 1
                        : 2
                )
                .paddingTop(
                    d => {

                        if (
                            d.depth === 1
                        ) {
                            return compactPadding
                                ? 16
                                : 25;
                        }

                        if (
                            d.depth === 2
                        ) {
                            return compactPadding
                                ? 8
                                : 20;
                        }

                        return 0;
                    }
                );

        treemapLayout(
            root
        );

        const section =
            d3.select(
                container
            );

        section.append("h2")
            .text(
                title
            );

        const svg =
            section
                .append("svg")
                .attr(
                    "width",
                    width
                )
                .attr(
                    "height",
                    height + 100
                );

        const continents =
            root.descendants()
                .filter(
                    d =>
                        d.depth === 1
                );

        svg.selectAll(
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

        svg.selectAll(
            ".continent-label"
        )
            .data(
                continents
            )
            .join("text")
            .attr(
                "x",
                d =>
                    d.x0 + 6
            )
            .attr(
                "y",
                d =>
                    d.y0 +
                    (
                        compactPadding
                            ? 12
                            : 17
                    )
            )
            .attr(
                "font-size",
                compactPadding
                    ? 11
                    : 13
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
                        compactPadding
                            ? 11
                            : 13
                    )
            );

        const areas =
            root.descendants()
                .filter(
                    d =>
                        d.depth === 2
                );

        svg.selectAll(
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

        svg.selectAll(
            ".area-label"
        )
            .data(
                areas
            )
            .join("text")
            .attr(
                "x",
                d =>
                    d.x0 + 5
            )
            .attr(
                "y",
                d =>
                    d.y0 +
                    (
                        compactPadding
                            ? 7
                            : 14
                    )
            )
            .attr(
                "font-size",
                compactPadding
                    ? 8
                    : 10
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
                d => {

                    const areaWidth =
                        d.x1 - d.x0;

                    const areaHeight =
                        d.y1 - d.y0;

                    if (
                        compactPadding &&
                        (
                            areaWidth < 45 ||
                            areaHeight < 14
                        )
                    ) {
                        return "";
                    }

                    return shortenLabel(
                        d.data.name,
                        areaWidth - 10,
                        compactPadding
                            ? 8
                            : 10
                    );
                }
            );

        const leaves =
            root.leaves();

        const cells =
            svg.selectAll(
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

                    const cellWidth =
                        d.x1 - d.x0;

                    const cellHeight =
                        d.y1 - d.y0;

                    if (
                        cellWidth > 55 &&
                        cellHeight > 25
                    ) {

                        return shortenLabel(
                            d.data.name,
                            cellWidth - 10,
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
            svg,
            height + 30
        );
    }

    drawTreemap(
        "#tree",
        "Treemap 1: Squarify",
        d3.treemapSquarify,
        false
    );

    drawTreemap(
        "#treemap",
        "Treemap 2: Slice-Dice",
        d3.treemapSliceDice,
        true
    );

})
.catch(error => {

    console.error(error);

});