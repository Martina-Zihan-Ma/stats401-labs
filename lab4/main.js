const width = 1000;
const height = 650;

const margin = {
    top: 50,
    right: 150,
    bottom: 70,
    left: 90
};

const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv(
    "../data/lab4_clean_tweets.csv",
    d => ({
        ...d,
        retweets: +d.retweets,
        favorites: +d.favorites,
        sentiment_score: +d.sentiment_score,
        sentiment_confidence: +d.sentiment_confidence
    })
)
.then(data => {

    console.log(data);
    console.log(data[0].sentiment_confidence);

    const xScale = d3
        .scaleLinear()
        .domain([-1, 1])
        .range([
            margin.left,
            width - margin.right
        ]);

    const yScale = d3
        .scaleSymlog()
        .domain([
            0,
            d3.max(data, d => d.retweets)
        ])
        .nice()
        .range([
            height - margin.bottom,
            margin.top
        ]);

    const sizeScale = d3
        .scaleSqrt()
        .domain([
            0,
            d3.max(data, d => d.favorites)
        ])
        .range([3, 18]);

    const colorScale = d3
        .scaleOrdinal()
        .domain([
            "Negative",
            "Neutral",
            "Positive"
        ])
        .range([
            "#d95f5f",
            "#999999",
            "#4c9f70"
        ]);

    svg.append("g")
        .attr(
            "transform",
            `translate(0, ${height - margin.bottom})`
        )
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr(
            "transform",
            `translate(${margin.left}, 0)`
        )
        .call(
            d3.axisLeft(yScale)
                .ticks(8, "~s")
        );

    svg.append("text")
        .attr(
            "x",
            (
                margin.left
                + width
                - margin.right
            ) / 2
        )
        .attr(
            "y",
            height - 20
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text(
            "Sentiment Score (-1 = Negative, +1 = Positive)"
        );

    svg.append("text")
        .attr(
            "transform",
            "rotate(-90)"
        )
        .attr(
            "x",
            -height / 2
        )
        .attr(
            "y",
            25
        )
        .attr(
            "text-anchor",
            "middle"
        )
        .text("Number of Retweets");

    const tooltip = d3
        .select("#tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "10px")
        .style("max-width", "350px");

    svg.selectAll("circle")
        .data(data)
        .join("circle")
        .attr(
            "cx",
            d => xScale(d.sentiment_score)
        )
        .attr(
            "cy",
            d => yScale(d.retweets)
        )
        .attr(
            "r",
            d => sizeScale(d.favorites)
        )
        .attr(
            "fill",
            d => colorScale(d.sentiment)
        )
        .attr("opacity", 0.55)
        .on("mouseover", function(event, d) {

            d3.select(this)
                .attr("opacity", 1);

            tooltip
                .style("visibility", "visible")
                .html(`
                    <strong>${d.sentiment}</strong><br>
                    Sentiment score:
                    ${d.sentiment_score.toFixed(3)}<br>
                    Retweets:
                    ${d.retweets}<br>
                    Favorites:
                    ${d.favorites}<br><br>
                    ${d.tweet_text_raw}
                `);
        })
        .on("mousemove", function(event) {

            tooltip
                .style(
                    "left",
                    `${event.pageX + 15}px`
                )
                .style(
                    "top",
                    `${event.pageY + 15}px`
                );
        })
        .on("mouseout", function() {

            d3.select(this)
                .attr("opacity", 0.55);

            tooltip
                .style(
                    "visibility",
                    "hidden"
                );
        });

    const categories = [
        "Negative",
        "Neutral",
        "Positive"
    ];

    const legend = svg
        .append("g")
        .attr(
            "transform",
            `translate(
                ${width - margin.right + 30},
                ${margin.top}
            )`
        );

    categories.forEach(
        (category, i) => {

            legend.append("circle")
                .attr("cx", 0)
                .attr(
                    "cy",
                    i * 30
                )
                .attr("r", 6)
                .attr(
                    "fill",
                    colorScale(category)
                );

            legend.append("text")
                .attr("x", 15)
                .attr(
                    "y",
                    i * 30 + 5
                )
                .text(category);
        }
    );

    const uncertainTweets = data
    .slice()
    .sort(
        (a, b) =>
            d3.ascending(
                a.sentiment_confidence,
                b.sentiment_confidence
            )
    )
    .slice(0, 5);


const cards = d3
    .select("#confidence-cards")
    .selectAll(".confidence-card")
    .data(uncertainTweets)
    .join("div")
    .attr("class", "confidence-card");

function decodeHtml(text) {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
}


cards.each(function(d) {

    const card = d3.select(this);

    card.html("");

    const header = card
        .append("div")
        .attr("class", "confidence-header");

    header.append("span")
        .attr("class", "confidence-sentiment")
        .text(d.sentiment);

    header.append("span")
        .attr("class", "confidence-score")
        .text(
            `Confidence: ${d.sentiment_confidence.toFixed(3)}`
        );

    card.append("p")
        .attr("class", "confidence-tweet")
        .text(d.text);

});
});
