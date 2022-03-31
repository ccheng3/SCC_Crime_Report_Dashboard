// Chris Cheng
// 11/27/2021
// Santa Clara County Crime Report Dashboard

// Reason: Always wanted to learn how to use the D3 library. This will be perfect experience.
let getCrimeData = async function () {
    try {
        reportRes = await fetch(
            "https://data.sccgov.org/resource/n9u6-aijz.json?$limit=5000000"
        );
        if (!reportRes.ok) {
            throw new Error(
                `The promise was rejected with status: ${reportRes.status}`
            );
        }
        let dataset = await reportRes.json();
        // filter out all of the entries without address_1 property (many of first entries were prolly tests, have literally no info.)
        // remove all of the "Phone Ur Office entries from the dataset"
        // remove all of the entries that do not have "Block" in their address --> EDIT 02/11/22: these are excluded from the geomap viz but are still valid incidents.
        const filteredData = dataset
            .filter((entry) => entry.hasOwnProperty("address_1"))
            // .filter(entry => entry.address_1.includes('Block' || 'BLOCK') === true)
            .filter((entry) => entry.incident_description.includes("1021") === false);
        // console.log(filteredData[0].address_1.includes('Block'));
        // console.log(filteredData[0].address_1);
        document.body.querySelector("#num_incidents_to_date").textContent =
            filteredData.length.toLocaleString("en");
        // console.log(filteredData[0])

        // Don't copy code, write it out piece by piece...
        // prepare the dataset - the data structure will be an array of objects, each object has both the hour of day and the total incidents for that hour
        let dataset_one_raw = [];
        let dataset_one_final = [];
        filteredData.forEach((element) => {
            let datetime = element.incident_datetime;
            dataset_one_raw.push(
                datetime.slice(datetime.indexOf("T") + 1, datetime.indexOf("T") + 3)
            );
        });
        for (let i = 0; i < 24; ++i) {
            let j = 0;
            dataset_one_raw.forEach((element) => {
                if (i - parseInt(element) === 0) {
                    ++j;
                }
            });
            dataset_one_final.push([i, j]);
        }

        // draw the bar chart (number of incidents (Y-axis) vs. hour of day (X-axis))
        let svgWidth = 700;
        let svgHeight = 200;
        let barPadding = 1;
        // x_scale_one's domain goes from 0 to the largest x value in the array, 23
        // x_scale_one's range goes from 0 to the svg element's width
        let x_scale_one = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(dataset_one_final, (d) => {
                    return d[0];
                }),
            ])
            // super jank x-axis tick implementation
            .range([0, svgWidth - 86]);
        // y_scale_one's domain goes from 0 to the largest y value in the array
        // y_scale_one's range goes from 0 to the svg element's height
        let y_scale_one = d3
            .scaleLinear()
            .domain([
                0,
                d3.max(dataset_one_final, (d) => {
                    return d[1];
                }),
            ])
            .range([svgHeight - 50, 0]);
        // this factor decreases all d[1] values so bar heights remain discernable within svg's height
        // the d[1] values themselves remain unchanged in dataset_one_final array
        // If you forget why this is needed, remove the factor and notice all bar heights exceed
        // svg's height and then "look to be at same height", which is not true at all.
        let data_scaling_factor = 60;
        let svgPadding = 20;
        let yAxisLabelPadAmount = 50;

        let svg_One = d3
            .select("#data_viz_1")
            .append("svg")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);
        // .style('padding', svgPadding)
        // .style('padding-left', svgPadding + 10);

        svg_One.selectAll('rect')
            .data(dataset_one_final)
            .enter()
            .append('rect')
            .attr('x', (d, i) => {
                return i * ((svgWidth - 60) / dataset_one_final.length) + yAxisLabelPadAmount;
            })
            .attr('y', (d) => {
                return svgHeight - svgPadding - Math.abs(y_scale_one(d[1]) - y_scale_one(0));
            })
            .attr('width', (svgWidth - yAxisLabelPadAmount) / dataset_one_final.length - barPadding)
            .attr('height', (d) => {
                return Math.abs(y_scale_one(d[1]) - y_scale_one(0));
            })
            .attr('fill', (d) => {
                console.log(d);
                return `rgb(0, ${Math.round(d[1] / data_scaling_factor)}, 0)`;
            })
            .on('mouseover', function (d) {
                d3.select(this)
                    .attr('fill', 'orange');
            })
            .on('mouseout', function (d) {
                d3.select(this)
                    .transition()
                    .duration(250)
                    .attr('fill', 'green');
            })
            .append("title")
            // hover interactivity displays num incidents as tooltip 
            .text(function (d) {
                return `Number Incidents: ${d[1]}`;
            });
        console.log(dataset_one_final);

        // data_viz_one's title
        svg_One
            .append("text")
            .attr("x", svgWidth / 2)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .attr("fill", "rgba(21, 17, 19, 0.8)")
            .text("Number of Incidents vs. Hour of Day");

        // define x and y axes functions
        let xAxis_one = d3.axisBottom().scale(x_scale_one).ticks(24);
        let yAxis_one = d3.axisLeft().scale(y_scale_one);

        // then draw both x and y axes
        svg_One
            .append("g")
            .attr("class", "axis")
            .attr(
                "transform",
                `translate(${yAxisLabelPadAmount + 12}, ${svgHeight - svgPadding})`
            )
            .call(xAxis_one);

        svg_One
            .append("g")
            .attr("class", "axis")
            .attr("transform", `translate(${yAxisLabelPadAmount}, ${30})`)
            .call(yAxis_one);

        // axes need labels
        svg_One
            .append("text")
            .attr("text-anchor", "middle")
            .attr("x", svgWidth)
            .attr("y", svgHeight + 10)
            .text("Hour of Day");

        // data viz 2: top 5 most common 'primary' crime incidents 
    }
    catch (err) {
        console.log(`Error: ${err} `);
        // promise will still fulfill even if async f(x) fails, so you have to re-throw async()'s error here.
        throw err;
    }
};

getCrimeData();
