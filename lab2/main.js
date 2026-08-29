const width = 1000;
const height = 700;
const centerX = width / 2;
const centerY = height / 2;

const margin = {
    top: 40,
    right: 70,
    bottom: 40,
    left: 70
};

d3.csv("../data/cities_multivariate.csv", d => ({
    city: d.city,
    population: +d.population,
    temp_c: +d.temp_c,
    development_level: d.development_level,
    region: d.region
}))
.then(data => {
    console.log(data);

    const regionBox = {
    North: {
        x1: margin.left,
        x2: centerX,
        y1: margin.top,
        y2: centerY
    },

    East: {
        x1: centerX,
        x2: width-margin.right,
        y1: margin.top,
        y2: centerY
    },

    West: {
        x1: margin.left,
        x2: centerX,
        y1: centerY,
        y2: height-margin.bottom
    },

    South: {
        x1: centerX,
        x2: width-margin.right,
        y1: centerY,
        y2: height-margin.bottom
    }
  };

     const svg = d3.select("#chart")
     .append("svg")
     .attr("width", width)
     .attr("height", height);

   svg.append("line")
    .attr("x1", centerX)
    .attr("x2", centerX)
    .attr("y1", margin.top)
    .attr("y2", height-margin.bottom)
    .attr("stroke", "#aaa");

 svg.append("line")
    .attr("x1", margin.left)
    .attr("x2", width-margin.right)
    .attr("y1", centerY)
    .attr("y2", centerY)
    .attr("stroke", "#aaa");

 svg.append("text")
    .attr("x", 285)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("class", "region-label")
    .text("North");

 svg.append("text")
    .attr("x", 715 )
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .attr("class", "region-label")
    .text("East");

 svg.append("text")
    .attr("x", 285 )
    .attr("y", height-10)
    .attr("text-anchor", "middle")
    .attr("class", "region-label")
    .text("West");

 svg.append("text")
    .attr("x", 715 )
    .attr("y", height-10)
    .attr("text-anchor", "middle")
    .attr("class", "region-label")
    .text("South");

 svg.append("text")
    .attr("x", 500 )
    .attr("y", 35)
    .attr("text-anchor", "middle")
    .text("Development level");

  const cityXScales = {};

  const regions = Array.from(
    new Set(data.map(d => d.region))
 );

 regions.forEach(region => {

    const cities = data
        .filter(d => d.region === region)
        .map(d => d.city);

    const box = regionBox[region];

    cityXScales[region] = d3.scaleBand()
        .domain(cities)
        .range([
            box.x1 + 40,
            box.x2 - 40
        ])
        .padding(0.3);
  });

  const developmentYScales = {};

 regions.forEach(region => {

    const box = regionBox[region];

    developmentYScales[region] = d3.scalePoint()
        .domain(["High", "Medium", "Low"])
        .range([
            box.y1 + 40,
            box.y2 - 40
        ]);
});

 const sizeScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.population))
    .range([20, 35]);

 const tempExtent = d3.extent(data, d => d.temp_c);

 const colorScale = d3.scaleDiverging()
    .domain([tempExtent[1],
        20,
        tempExtent[0]])
    .interpolator(d3.interpolateRdBu);

 svg.append("g")
    .attr("transform", `translate(${centerX}, 0)`)
    .call(
        d3.axisLeft(developmentYScales["North"])
    );

 svg.append("g")
    .attr("transform", `translate(${centerX}, 0)`)
    .call(
        d3.axisLeft(developmentYScales["South"])
    );
 const legendX = width - 45;
 const legendY = 100;
 const legendHeight = 180;
 const legendWidth = 15;

 const tempLegendScale = d3.scaleLinear()
    .domain([tempExtent[1], tempExtent[0]])
    .range([legendY, legendY + legendHeight]);

 const defs = svg.append("defs");

 const gradient = defs.append("linearGradient")
    .attr("id", "temp-gradient")
    .attr("x1", "0%")
    .attr("x2", "0%")
    .attr("y1", "0%")
    .attr("y2", "100%");

 gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(tempExtent[1]));

 gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", colorScale(20));

 gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(tempExtent[0]));

 svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .attr("fill", "url(#temp-gradient)");

 svg.append("g")
    .attr(
        "transform",
        `translate(${legendX + legendWidth}, 0)`
    )
    .call(
        d3.axisRight(tempLegendScale)
            .tickValues([
                tempExtent[1],
                20,
                tempExtent[0]
            ])
    );

 svg.append("text")
    .attr(
        "transform",
        `translate(${legendX - 15}, ${legendY + legendHeight / 2 + 25}) rotate(-90)`
    )
    .text("Temperature (°C)");

 const tooltip = d3.select("#tooltip");

 svg.selectAll(".data-point")
    .data(data)
    .join("circle")
    .attr("class", "data-point")
    .attr("cx", d => {
    const scale = cityXScales[d.region];

    return scale(d.city) + scale.bandwidth() / 2;
   })
    .attr("cy", d =>
    developmentYScales[d.region](d.development_level)
    )
    .attr("r", d => sizeScale(d.population))
    .attr("fill", d => colorScale(d.temp_c))
    .on("mouseover", function(event, d) {

          tooltip
             .style("opacity", 1)
              .html(`
            <strong>${d.city}</strong><br>
            Population: ${d.population}million<br>
            Temperature: ${d.temp_c}°C<br>
            Development level: ${d.development_level}<br>
            region: ${d.region}
        `);

    })
    .on("mousemove", function(event) {

    tooltip
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`);

 })
     .on("mouseout", function() {

    tooltip
        .style("opacity", 0);

});
 
 svg.selectAll(".city-label")
    .data(data)
    .join("text")
    .attr("class", "city-label")
    .attr("x", d => {
        const scale = cityXScales[d.region];
        return scale(d.city) + scale.bandwidth() / 2;
    })
    .attr("y", d => {
        const circleY =
            developmentYScales[d.region](d.development_level);

        return circleY + sizeScale(d.population) + 15;
    })
    .attr("text-anchor", "middle")
    .text(d => d.city);
                 
 });
 