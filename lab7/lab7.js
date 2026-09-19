Promise.all([
    d3.csv(
        "../data/lab7_assignment_companies.csv",
        d => ({
            id: d.id,
            company_name: d.company_name,
            sector: d.sector,
            region: d.region
        })
    ),
    d3.csv(
        "../data/lab7_assignment_transactions_60days.csv",
        d => ({
            date: d3.timeParse("%Y-%m-%d")(d.date),
            day: +d.day,
            source: d.source,
            target: d.target,
            amount_usd: +d.amount_usd,
            transaction_type: d.transaction_type,
            transaction_count: +d.transaction_count
        })
    )
])
.then(([companies, transactions]) => {

    const width = 1100;
    const height = 680;
    const networkWidth = 800;

    const formatMoney = d3.format("$,.0f");
    const formatDate = d3.timeFormat("%B %d, %Y");

    const sectors = Array.from(
        new Set(
            companies.map(d => d.sector)
        )
    );

    const regions = Array.from(
        new Set(
            companies.map(d => d.region)
        )
    );

    const transactionTypes = Array.from(
        new Set(
            transactions.map(
                d => d.transaction_type
            )
        )
    );

    const sectorColor = d3.scaleOrdinal()
        .domain(sectors)
        .range(d3.schemeTableau10);

    const regionColor = d3.scaleOrdinal()
        .domain(regions)
        .range(d3.schemeSet2);

    const transactionColor = d3.scaleOrdinal()
        .domain(transactionTypes)
        .range(d3.schemeDark2);

    const linkWidthScale = d3.scaleSqrt()
        .domain([
            0,
            d3.max(
                transactions,
                d => d.amount_usd
            )
        ])
        .range([1.5, 8]);

    const dailyVolumes = [];

    for (let day = 1; day <= 60; day++) {

        const links = transactions.filter(
            d => d.day === day
        );

        companies.forEach(company => {

            const volume = d3.sum(
                links.filter(
                    d =>
                        d.source === company.id ||
                        d.target === company.id
                ),
                d => d.amount_usd
            );

            dailyVolumes.push(volume);
        });
    }

    const sizeScale = d3.scaleSqrt()
        .domain([
            0,
            d3.max(dailyVolumes)
        ])
        .range([10, 34]);

    const dateByDay = new Map();

    transactions.forEach(d => {

        if (!dateByDay.has(d.day)) {

            dateByDay.set(
                d.day,
                d.date
            );
        }
    });

    companies.forEach(
        (d, i) => {

            const angle =
                (
                    i /
                    companies.length
                ) *
                Math.PI *
                2;

            d.x =
                networkWidth / 2 +
                Math.cos(angle) *
                210;

            d.y =
                height / 2 +
                Math.sin(angle) *
                210;

            d.currentVolume = 0;
            d.currentCount = 0;
            d.currentRadius = 10;
        }
    );

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr(
            "viewBox",
            `0 0 ${width} ${height}`
        );

    const slider =
        d3.select("#time-slider");

    const currentDateDisplay =
        d3.select("#current-date");

    const summaryDay =
        d3.select("#summary-day");

    const summaryActiveCompanies =
        d3.select("#summary-active-companies");

    const summaryActiveLinks =
        d3.select("#summary-active-links");

    const summaryTotalValue =
        d3.select("#summary-total-value");

    const summaryTotalTransactions =
        d3.select("#summary-total-transactions");

    let tooltip =
        d3.select("#tooltip");

    if (tooltip.empty()) {

        tooltip =
            d3.select("body")
                .append("div")
                .attr(
                    "id",
                    "tooltip"
                );
    }

    tooltip
        .style(
            "position",
            "absolute"
        )
        .style(
            "background",
            "white"
        )
        .style(
            "border",
            "1px solid #bbb"
        )
        .style(
            "border-radius",
            "6px"
        )
        .style(
            "padding",
            "10px"
        )
        .style(
            "font-size",
            "13px"
        )
        .style(
            "pointer-events",
            "none"
        )
        .style(
            "opacity",
            0
        );

    const linkGroup =
        svg.append("g")
            .attr(
                "class",
                "links"
            );

    const nodeGroup =
        svg.append("g")
            .attr(
                "class",
                "nodes"
            );

    const labelGroup =
        svg.append("g")
            .attr(
                "class",
                "labels"
            );

    const node =
        nodeGroup
            .selectAll("circle")
            .data(
                companies,
                d => d.id
            )
            .join("circle")
            .attr(
                "r",
                d => d.currentRadius
            )
            .attr(
                "fill",
                d =>
                    sectorColor(
                        d.sector
                    )
            )
            .attr(
                "stroke",
                d =>
                    regionColor(
                        d.region
                    )
            )
            .attr(
                "stroke-width",
                4
            )
            .on(
                "mouseover",
                function(event, d) {

                    d3.select(this)
                        .attr(
                            "stroke-width",
                            6
                        );

                    tooltip
                        .style(
                            "opacity",
                            1
                        )
                        .html(`
                            <strong>${d.company_name}</strong><br>
                            Sector: ${d.sector}<br>
                            Region: ${d.region}<br>
                            Daily transaction volume: ${formatMoney(d.currentVolume)}<br>
                            Transactions: ${d.currentCount}
                        `);
                }
            )
            .on(
                "mousemove",
                function(event) {

                    tooltip
                        .style(
                            "left",
                            `${event.pageX + 15}px`
                        )
                        .style(
                            "top",
                            `${event.pageY - 20}px`
                        );
                }
            )
            .on(
                "mouseout",
                function() {

                    d3.select(this)
                        .attr(
                            "stroke-width",
                            4
                        );

                    tooltip
                        .style(
                            "opacity",
                            0
                        );
                }
            );

    const labels =
        labelGroup
            .selectAll("text")
            .data(
                companies,
                d => d.id
            )
            .join("text")
            .text(
                d => d.company_name
            )
            .attr(
                "text-anchor",
                "middle"
            )
            .attr(
                "font-size",
                11
            )
            .style(
                "pointer-events",
                "none"
            );

    let currentLinks = [];

    const simulation =
        d3.forceSimulation(
            companies
        )
        .force(
            "link",
            d3.forceLink()
                .id(d => d.id)
                .distance(150)
                .strength(0.15)
        )
        .force(
            "charge",
            d3.forceManyBody()
                .strength(-320)
        )
        .force(
            "center",
            d3.forceCenter(
                networkWidth / 2,
                height / 2
            )
        )
        .force(
            "x",
            d3.forceX(
                networkWidth / 2
            )
                .strength(0.025)
        )
        .force(
            "y",
            d3.forceY(
                height / 2
            )
                .strength(0.025)
        )
        .force(
            "collision",
            d3.forceCollide()
                .radius(
                    d =>
                        d.currentRadius +
                        12
                )
        )
        .on(
            "tick",
            ticked
        );

    node.call(
        d3.drag()
            .on(
                "start",
                dragStarted
            )
            .on(
                "drag",
                dragged
            )
            .on(
                "end",
                dragEnded
            )
    );

    const legend =
        svg.append("g")
            .attr(
                "class",
                "legend"
            )
            .attr(
                "transform",
                `translate(${networkWidth + 30},40)`
            );

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            0
        )
        .attr(
            "font-size",
            20
        )
        .attr(
            "font-weight",
            "bold"
        )
        .text("Legend");

    let legendY = 35;

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            legendY
        )
        .attr(
            "font-size",
            14
        )
        .attr(
            "font-weight",
            "bold"
        )
        .text(
            "Node Fill: Sector"
        );

    legendY += 22;

    sectors.forEach(sector => {

        legend
            .append("circle")
            .attr(
                "cx",
                8
            )
            .attr(
                "cy",
                legendY
            )
            .attr(
                "r",
                7
            )
            .attr(
                "fill",
                sectorColor(
                    sector
                )
            );

        legend
            .append("text")
            .attr(
                "x",
                23
            )
            .attr(
                "y",
                legendY + 4
            )
            .attr(
                "font-size",
                12
            )
            .text(sector);

        legendY += 22;
    });

    legendY += 15;

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            legendY
        )
        .attr(
            "font-size",
            14
        )
        .attr(
            "font-weight",
            "bold"
        )
        .text(
            "Node Border: Region"
        );

    legendY += 22;

    regions.forEach(region => {

        legend
            .append("circle")
            .attr(
                "cx",
                8
            )
            .attr(
                "cy",
                legendY
            )
            .attr(
                "r",
                7
            )
            .attr(
                "fill",
                "white"
            )
            .attr(
                "stroke",
                regionColor(
                    region
                )
            )
            .attr(
                "stroke-width",
                3
            );

        legend
            .append("text")
            .attr(
                "x",
                23
            )
            .attr(
                "y",
                legendY + 4
            )
            .attr(
                "font-size",
                12
            )
            .text(region);

        legendY += 22;
    });

    legendY += 15;

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            legendY
        )
        .attr(
            "font-size",
            14
        )
        .attr(
            "font-weight",
            "bold"
        )
        .text(
            "Node Size"
        );

    legendY += 20;

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            legendY
        )
        .attr(
            "font-size",
            12
        )
        .text(
            "Daily transaction volume"
        );

    legendY += 35;

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            legendY
        )
        .attr(
            "font-size",
            14
        )
        .attr(
            "font-weight",
            "bold"
        )
        .text(
            "Link Color: Type"
        );

    legendY += 22;

    transactionTypes.forEach(type => {

        legend
            .append("line")
            .attr(
                "x1",
                0
            )
            .attr(
                "x2",
                20
            )
            .attr(
                "y1",
                legendY
            )
            .attr(
                "y2",
                legendY
            )
            .attr(
                "stroke",
                transactionColor(
                    type
                )
            )
            .attr(
                "stroke-width",
                4
            );

        legend
            .append("text")
            .attr(
                "x",
                28
            )
            .attr(
                "y",
                legendY + 4
            )
            .attr(
                "font-size",
                12
            )
            .text(type);

        legendY += 22;
    });

    legendY += 15;

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            legendY
        )
        .attr(
            "font-size",
            14
        )
        .attr(
            "font-weight",
            "bold"
        )
        .text(
            "Link Width"
        );

    legendY += 20;

    legend
        .append("text")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            legendY
        )
        .attr(
            "font-size",
            12
        )
        .text(
            "Transaction amount"
        );

    function calculateActivity(
        companyId,
        links
    ) {

        const companyLinks =
            links.filter(
                d =>
                    d.sourceId === companyId ||
                    d.targetId === companyId
            );

        return {
            volume:
                d3.sum(
                    companyLinks,
                    d => d.amount_usd
                ),

            count:
                d3.sum(
                    companyLinks,
                    d => d.transaction_count
                )
        };
    }

    function showDay(day) {

        const daily =
            transactions.filter(
                d => d.day === day
            );

        currentLinks =
            daily.map(
                d => ({
                    date: d.date,
                    day: d.day,
                    source: d.source,
                    target: d.target,
                    sourceId: d.source,
                    targetId: d.target,
                    amount_usd:
                        d.amount_usd,
                    transaction_type:
                        d.transaction_type,
                    transaction_count:
                        d.transaction_count
                })
            );

        companies.forEach(
            company => {

                const activity =
                    calculateActivity(
                        company.id,
                        currentLinks
                    );

                company.currentVolume =
                    activity.volume;

                company.currentCount =
                    activity.count;

                company.currentRadius =
                    sizeScale(
                        activity.volume
                    );
            }
        );

        node
            .transition()
            .duration(400)
            .attr(
                "r",
                d =>
                    d.currentRadius
            );

        linkGroup
            .selectAll("line")
            .data(
                currentLinks,
                d => {

                    const pair = [
                        d.sourceId,
                        d.targetId
                    ]
                        .sort()
                        .join("-");

                    return (
                        pair +
                        "-" +
                        d.transaction_type
                    );
                }
            )
            .join(
                enter =>
                    enter
                        .append("line")
                        .attr(
                            "stroke",
                            d =>
                                transactionColor(
                                    d.transaction_type
                                )
                        )
                        .attr(
                            "stroke-width",
                            d =>
                                linkWidthScale(
                                    d.amount_usd
                                )
                        )
                        .attr(
                            "opacity",
                            0
                        )
                        .attr(
                            "stroke-linecap",
                            "round"
                        )
                        .on(
                            "mouseover",
                            function(
                                event,
                                d
                            ) {

                                const source =
                                    companies.find(
                                        company =>
                                            company.id ===
                                            d.sourceId
                                    );

                                const target =
                                    companies.find(
                                        company =>
                                            company.id ===
                                            d.targetId
                                    );

                                tooltip
                                    .style(
                                        "opacity",
                                        1
                                    )
                                    .html(`
                                        <strong>${source.company_name} ↔ ${target.company_name}</strong><br>
                                        Type: ${d.transaction_type}<br>
                                        Amount: ${formatMoney(d.amount_usd)}<br>
                                        Transaction count: ${d.transaction_count}
                                    `);
                            }
                        )
                        .on(
                            "mousemove",
                            function(event) {

                                tooltip
                                    .style(
                                        "left",
                                        `${event.pageX + 15}px`
                                    )
                                    .style(
                                        "top",
                                        `${event.pageY - 20}px`
                                    );
                            }
                        )
                        .on(
                            "mouseout",
                            function() {

                                tooltip
                                    .style(
                                        "opacity",
                                        0
                                    );
                            }
                        )
                        .call(
                            enter =>
                                enter
                                    .transition()
                                    .duration(400)
                                    .attr(
                                        "opacity",
                                        0.7
                                    )
                        ),

                update =>
                    update
                        .transition()
                        .duration(400)
                        .attr(
                            "stroke",
                            d =>
                                transactionColor(
                                    d.transaction_type
                                )
                        )
                        .attr(
                            "stroke-width",
                            d =>
                                linkWidthScale(
                                    d.amount_usd
                                )
                        )
                        .attr(
                            "opacity",
                            0.7
                        ),

                exit =>
                    exit
                        .transition()
                        .duration(400)
                        .attr(
                            "opacity",
                            0
                        )
                        .remove()
            );

        simulation
            .force("link")
            .links(
                currentLinks
            );

        simulation
            .force("collision")
            .radius(
                d =>
                    d.currentRadius +
                    12
            );

        simulation
            .alpha(0.25)
            .restart();

        slider.property(
            "value",
            day
        );

        const currentDate =
            dateByDay.get(day);

        currentDateDisplay.text(
            currentDate
                ? `Day ${day} · ${formatDate(currentDate)}`
                : `Day ${day}`
        );

        const activeCompanies =
            new Set(
                currentLinks.flatMap(
                    d => [
                        d.sourceId,
                        d.targetId
                    ]
                )
            ).size;

        const activeLinks =
            currentLinks.length;

        const totalValue =
            d3.sum(
                currentLinks,
                d => d.amount_usd
            );

        const totalTransactions =
            d3.sum(
                currentLinks,
                d => d.transaction_count
            );

        summaryDay
            .text(
                 `Day: ${day}`
            );

        summaryActiveCompanies
            .text(
                `Active companies: ${activeCompanies}`
            );

        summaryActiveLinks
            .text(
                `Active links: ${activeLinks}`
            );

        summaryTotalValue
            .text(
                `Total transaction value: ${formatMoney(totalValue)}`
            );

        summaryTotalTransactions
            .text(
                `Total transactions: ${totalTransactions}`
            );
    }

    function ticked() {

        companies.forEach(d => {

            const padding =
                d.currentRadius +
                8;

            d.x = Math.max(
                padding,
                Math.min(
                    networkWidth -
                    padding,
                    d.x
                )
            );

            d.y = Math.max(
                padding,
                Math.min(
                    height -
                    padding,
                    d.y
                )
            );
        });

        linkGroup
            .selectAll("line")
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

        node
            .attr(
                "cx",
                d => d.x
            )
            .attr(
                "cy",
                d => d.y
            );

        labels
            .attr(
                "x",
                d => d.x
            )
            .attr(
                "y",
                d =>
                    d.y +
                    d.currentRadius +
                    16
            );
    }

    function dragStarted(
        event,
        d
    ) {

        if (!event.active) {

            simulation
                .alphaTarget(0.15)
                .restart();
        }

        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(
        event,
        d
    ) {

        d.fx = event.x;
        d.fy = event.y;
    }

    function dragEnded(
        event,
        d
    ) {

        if (!event.active) {

            simulation
                .alphaTarget(0);
        }

        d.fx = null;
        d.fy = null;
    }

    let currentDay = 1;
    let timer = null;

    function play() {

        if (timer) {
            return;
        }

        if (currentDay >= 60) {

            currentDay = 1;

            showDay(
                currentDay
            );
        }

        timer = d3.interval(
            () => {

                if (currentDay >= 60) {

                    pause();
                    return;
                }

                currentDay += 1;

                showDay(
                    currentDay
                );
            },
            900
        );
    }

    function pause() {

        if (timer) {

            timer.stop();
            timer = null;
        }
    }

    function reset() {

        pause();

        currentDay = 1;

        companies.forEach(
            (d, i) => {

                const angle =
                    (
                        i /
                        companies.length
                    ) *
                    Math.PI *
                    2;

                d.x =
                    networkWidth / 2 +
                    Math.cos(angle) *
                    210;

                d.y =
                    height / 2 +
                    Math.sin(angle) *
                    210;

                d.vx = 0;
                d.vy = 0;
                d.fx = null;
                d.fy = null;
            }
        );

        showDay(1);

        simulation
            .alpha(0.5)
            .restart();
    }

    d3.select("#play")
        .on(
            "click",
            play
        );

    d3.select("#pause")
        .on(
            "click",
            pause
        );

    d3.select("#reset")
        .on(
            "click",
            reset
        );

    slider
        .on(
            "input",
            function() {

                pause();

                currentDay =
                    +this.value;

                showDay(
                    currentDay
                );
            }
        );

    showDay(1);
});