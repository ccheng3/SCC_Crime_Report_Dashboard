// Chris Cheng
// 11/27/2021
// Santa Clara County Crime Report Dashboard 

// Reason: Always wanted to learn how to use the D3 library. This will be perfect experience. 
let getCrimeData = async function () {
    try {
        reportRes = await fetch('https://data.sccgov.org/resource/n9u6-aijz.json?$limit=5000000')
        if (!reportRes.ok) {
            throw new Error(`The promise was rejected with status: ${reportRes.status}`)
        }
        let dataset = await reportRes.json();
        // filter out all of the entries without address_1 property (many of first entries were prolly tests, have literally no info.)
        // remove all of the "Phone Ur Office entries from the dataset"
        // remove all of the entries that do not have "Block" in their address --> EDIT 02/11/22: these are excluded from the geomap viz but are still valid incidents. 
        const filteredData = dataset.filter(entry => entry.hasOwnProperty('address_1'))
            // .filter(entry => entry.address_1.includes('Block' || 'BLOCK') === true)
            .filter(entry => entry.incident_description.includes('1021') === false);
        // console.log(filteredData[0].address_1.includes('Block'));
        // console.log(filteredData[0].address_1);
        document.body.querySelector('#num_incidents_to_date').textContent = filteredData.length.toLocaleString('en');
        // console.log(filteredData[0])

        // Don't copy code, write it out piece by piece...
        // prepare the dataset - the data structure will be an array of objects, each object has both the hour of day and the total incidents for that hour
        let dataset_one_raw = [];
        let dataset_one_final = [];
        filteredData.forEach(element => {
            let datetime = element.incident_datetime;
            dataset_one_raw.push(datetime.slice(datetime.indexOf('T') + 1, datetime.indexOf('T') + 3));
        });
        for (let i = 0; i < 24; ++i) {
            let j = 0;
            dataset_one_raw.forEach(element => {
                if (i - parseInt(element) === 0) {
                    ++j;
                }
            })
            dataset_one_final.push([i, j]);
        }

        // draw the bar chart (number of incidents (Y-axis) vs. hour of day (X-axis))
        let svgWidth = 600;
        let svgHeight = 150;
        let barPadding = 1;
        // x_scale_one's domain goes from 0 to the largest x value in the array, 23
        // x_scale_one's range goes from 0 to the svg element's width 
        let x_scale_one = d3.scaleLinear()
            .domain([0, d3.max(dataset_one_final, (d) => {
                return d[0];
            })])
            .range([0, svgWidth]);
        // y_scale_one's domain goes from 0 to the largest y value in the array
        // y_scale_one's range goes from 0 to the svg element's height 
        let y_scale_one = d3.scaleLinear()
            .domain([0, d3.max(dataset_one_final, (d) => {
                return d[1];
            })])
            .range([0, svgHeight]);
        // this factor decreases all d[1] values so bar heights remain discernable within svg's height
        // the d[1] values themselves remain unchanged in dataset_one_final array 
        // If you forget why this is needed, remove the factor and notice all bar heights exceed
        // svg's height and then "look to be at same height", which is not true at all.  
        let data_scaling_factor = 60;

        let svg_One = d3.select('#data_viz_1')
            .append('svg')
            .attr('width', svgWidth)
            .attr('height', svgHeight);
        svg_One.selectAll('rect')
            .data(dataset_one_final)
            .enter()
            .append('rect')
            .attr('x', (d, i) => {
                return i * (svgWidth / dataset_one_final.length);
            })
            .attr('y', (d) => {
                return svgHeight - y_scale_one(d[1]);
            })
            .attr('width', svgWidth / dataset_one_final.length - barPadding)
            .attr('height', (d) => {
                return y_scale_one(d[1]);
            })
            .attr('fill', (d) => {
                return `rgb(0, ${Math.round(d[1] / data_scaling_factor)}, 0)`;
            });

    }
    catch (err) {
        console.log(`Error: ${err}`);
        // promise will still fulfill even if async f(x) fails, so you have to re-throw async()'s error here.
        throw err;
    }
};

getCrimeData();