async function loadData() {

    const data = await d3.csv(
        "../data/students.csv",
        d => ({
            name: d.name,
            score: +d.score
        })
    );

    console.log(data);

    data.sort((a, b) => b.score - a.score);

    const colorScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.score))
            .range(["lightblue", "darkblue"]);

    const svg = d3.select("#svg-chart1")
        .append("svg")
        .attr("width", 1000)
        .attr("height", 450)
    
    svg.selectAll("rect")
       .data(data)
       .join("rect")
       .attr("height", d => 2*d.score)
       .attr("x", (d,i) => 120+i*70)
       .attr("y", d => 350 - 2*d.score)
       .attr("width", 50)
       .attr("class", "bar")
       .attr("fill", d => colorScale(d.score))
    
    svg.selectAll(".score-label")
       .data(data)
       .join("text")
       .attr("class", "score-label")
       .attr("x", (d, i) => 145 + i * 70)
       .attr("y", 370)
       .attr("text-anchor", "middle")
       .text(d => d.score);

    svg.selectAll(".name-label")
       .data(data)
       .join("text")
       .attr("class", "name-label")
       .attr("x", (d, i) => 145 + i * 70)
       .attr("y", 390)
       .attr("text-anchor", "middle")
       .text(d => d.name);
    
    svg.append("text")
    .attr("x", 400)
    .attr("y", 70)
    .attr("text-anchor", "middle")
    .attr("font-size", "20px")
    .text("Student Scores");

}

loadData();