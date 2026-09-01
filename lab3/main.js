d3.csv("../data/lab3_data.csv")
    .then(data => {

        const originalData = [...data];

        const columns = data.columns.filter(
            column => column !== "place"
        );

        const table = d3.select("#data-table");

        const pageSize = 10;
        let currentPage = 1;

        let sortColumn = null;
        let ascending = true;

        const numericColumns = [
            "magnitude",
            "longitude",
            "latitude",
            "depth"
        ];

        const header = table
            .select("thead")
            .append("tr");

        header.selectAll("th")
            .data(columns)
            .join("th")
            .style("cursor", "pointer")
            .on("click", function(event, column) {

                if (sortColumn === column) {

                    ascending = !ascending;

                } else {

                    sortColumn = column;
                    ascending = true;
                }

                data.sort((a, b) => {

                    let aValue = a[column];
                    let bValue = b[column];

                    if (numericColumns.includes(column)) {

                        aValue = +aValue;
                        bValue = +bValue;
                    }

                    return ascending
                        ? d3.ascending(aValue, bValue)
                        : d3.descending(aValue, bValue);
                });

                currentPage = 1;

                updateHeader();
                updateRows();
            });

        function updateHeader() {

            header.selectAll("th")

                .text(column => {

                    if (column === sortColumn) {

                        return `${column} ${
                            ascending ? "↑" : "↓"
                        }`;
                    }

                    return column;
                })

                .classed(
                    "sorted-column",
                    column => column === sortColumn
                );
        }

        function updateRows() {

            const totalPages = Math.ceil(
                data.length / pageSize
            );

            const start =
                (currentPage - 1) * pageSize;

            const end =
                start + pageSize;

            const pageData =
                data.slice(start, end);


            const rows = table
                .select("tbody")
                .selectAll("tr")
                .data(pageData);


            rows.join("tr")
                .selectAll("td")
                .data(
                    row =>
                        columns.map(
                            column =>
                                row[column]
                        )
                )
                .join("td")
                .text(d => d);

            d3.select("#page-info")
                .text(
                    `Page ${currentPage} of ${totalPages}`
                );

            d3.select("#prev-btn")
                .property(
                    "disabled",
                    currentPage === 1
                );

            d3.select("#next-btn")
                .property(
                    "disabled",
                    currentPage === totalPages
                );
        }

        d3.select("#prev-btn")
            .on("click", () => {

                if (currentPage > 1) {

                    currentPage--;

                    updateRows();
                }

            });

        d3.select("#next-btn")
            .on("click", () => {

                const totalPages =
                    Math.ceil(
                        data.length / pageSize
                    );

                if (currentPage < totalPages) {

                    currentPage++;

                    updateRows();
                }

            });

        d3.select("#reset-btn")
           .on("click", () => {

         data.splice(
            0,
            data.length,
            ...originalData
          );

          sortColumn = null;
          ascending = true;
          currentPage = 1;

          updateHeader();
          updateRows();
        });

        updateHeader();
        updateRows();

    });