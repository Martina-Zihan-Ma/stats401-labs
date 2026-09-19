d3.csv(
    "../data/lab7_historical_weather.csv",
    d => ({
        date: d3.timeParse("%Y-%m-%d")(d.date),
        city: d.city,
        country: d.country,
        temperature_c: +d.temperature_c,
        humidity_pct: +d.humidity_pct,
        wind_speed_mps: +d.wind_speed_mps,
        pressure_hpa: +d.pressure_hpa,
        precipitation_mm: +d.precipitation_mm
    })
)
.then(data => {

    console.log(data);

    const selectedCities = [
        "Tokyo",
        "London",
        "New York"
    ];

    const filteredData = data
        .filter(d => selectedCities.includes(d.city))
        .sort((a, b) => d3.ascending(a.date, b.date));

    const cityData = filteredData
        .filter(d => d.city === "Tokyo")
        .sort((a, b) => d3.ascending(a.date, b.date));

    const grouped = d3.group(
        filteredData,
        d => d.city
    );

    const width = 900;
    const height = 500;

    const margin = {
        top: 40,
        right: 40,
        bottom: 70,
        left: 70
    };

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleTime()
        .domain(
            d3.extent(filteredData, d => d.date)
        )
        .range([
            margin.left,
            width - margin.right
        ]);

    const yScale = d3.scaleLinear()
        .domain(
            d3.extent(
                filteredData,
                d => d.temperature_c
            )
        )
        .nice()
        .range([
            height - margin.bottom,
            margin.top
        ]);

    const xAxis = svg.append("g")
        .attr(
            "transform",
            `translate(0,${height - margin.bottom})`
        )
        .call(d3.axisBottom(xScale));

    const yAxis = svg.append("g")
        .attr(
            "transform",
            `translate(${margin.left},0)`
        )
        .call(d3.axisLeft(yScale));

    const colorScale = d3.scaleOrdinal()
        .domain(selectedCities)
        .range(d3.schemeTableau10);

    let currentMetric = "temperature_c";

    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d[currentMetric]));

    svg.selectAll(".city-line")
        .data(grouped)
        .join("path")
        .attr("class", "city-line")
        .attr("fill", "none")
        .attr(
            "stroke",
            d => colorScale(d[0])
        )
        .attr("stroke-width", 2)
        .attr(
            "d",
            d => line(d[1])
        );

    d3.select("#metric")
        .on("change", function() {
            updateChart(this.value);
        });

    function updateChart(metric) {

        currentMetric = metric;

        yScale
            .domain(
                d3.extent(
                    filteredData,
                    d => d[metric]
                )
            )
            .nice();

        line.y(
            d => yScale(d[metric])
        );

        yAxis
            .transition()
            .duration(600)
            .call(d3.axisLeft(yScale));

        svg.selectAll(".city-line")
            .transition()
            .duration(600)
            .attr(
                "d",
                d => line(d[1])
            );

        showFrame(currentIndex);
    }


    const tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid #999")
        .style("padding", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0);


    const bisectDate =
        d3.bisector(d => d.date).center;

    function moved(event) {

        const [mouseX] =
            d3.pointer(event);

        const date =
            xScale.invert(mouseX);

        const index =
            bisectDate(cityData, date);

        const d =
            cityData[index];

        if (!d) return;

        tooltip
            .style("opacity", 1)
            .style(
                "left",
                `${event.pageX + 10}px`
            )
            .style(
                "top",
                `${event.pageY + 10}px`
            )
            .html(`
                <strong>${d.city}</strong><br>
                ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>
                Temperature: ${d.temperature_c} °C<br>
                Humidity: ${d.humidity_pct}%<br>
                Wind: ${d.wind_speed_mps} m/s<br>
                Pressure: ${d.pressure_hpa} hPa
            `);
    }

    svg.append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr(
            "width",
            width - margin.left - margin.right
        )
        .attr(
            "height",
            height - margin.top - margin.bottom
        )
        .attr("fill", "transparent")
        .style("pointer-events", "all")
        .on("mousemove", moved)
        .on("mouseleave", () => {
            tooltip.style("opacity", 0);
        });


    let currentIndex = 0;
    let timer = null;

    const marker = svg.append("circle")
        .attr("r", 7)
        .attr("fill", "red");

    const dateLabel = svg.append("text")
        .attr("x", width - 180)
        .attr("y", 30)
        .attr("font-size", 20);

    d3.select("#time-slider")
        .attr("min", 0)
        .attr(
            "max",
            cityData.length - 1
        )
        .attr("step", 1)
        .property("value", 0);

    function showFrame(index) {

        const d = cityData[index];

        if (!d) return;

        marker
            .attr(
                "cx",
                xScale(d.date)
            )
            .attr(
                "cy",
                yScale(d[currentMetric])
            );

        dateLabel.text(
            d3.timeFormat("%Y-%m-%d")(
                d.date
            )
        );

        d3.select("#time-slider")
            .property(
                "value",
                index
            );
    }

    function play() {

        if (timer) return;

        timer = d3.interval(
            () => {

                showFrame(currentIndex);

                currentIndex += 1;

                if (
                    currentIndex >=
                    cityData.length
                ) {
                    pause();
                    currentIndex =
                        cityData.length - 1;
                }

            },
            150
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

        currentIndex = 0;

        showFrame(0);
    }

    d3.select("#play")
        .on("click", play);

    d3.select("#pause")
        .on("click", pause);

    d3.select("#reset")
        .on("click", reset);

    d3.select("#time-slider")
        .on("input", function() {

            pause();

            currentIndex =
                +this.value;

            showFrame(currentIndex);
        });

    showFrame(0);

});