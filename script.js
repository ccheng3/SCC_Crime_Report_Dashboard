// Chris Cheng
// 11/27/2021
// Santa Clara County Crime Report Dashboard 
// Description: A vanilla JS app that fetches SCC Crime Report data from SCC Open Data API and 
// visualizes the data with a map (Leaflet) and some straight-forward metrics (D3.js). 

// Goal: Practice designing and developing a vanilla JS app from scratch in order to practice 
// JS coding skills. 

// Purpose: Create an app that I will use for myself to investigate the dataset and learn about 
// SCC crime history from 2018 - present. 

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
        // remove all of the entries that do not have "Block" in their address
        const filteredData = dataset.filter(entry => entry.hasOwnProperty('address_1'))
            .filter(entry => entry.address_1.includes('Block' || 'BLOCK') === true)
            .filter(entry => entry.incident_description.includes('1021') === false);
        console.log(filteredData[0].address_1.includes('Block'));
        console.log(filteredData[0].address_1);
        console.log(filteredData.length)
    }
    catch (err) {
        console.log(`Error: ${err}`);
        // promise will still fulfill even if async f(x) fails, so you have to re-throw async()'s error here.
        throw err;
    }
};

getCrimeData();