const express = require('express');

const app = express();

app.use(express.json());

const preferredLocations = [];

app.post('/set_preferred_location', (req, res) => {
    const { id, location } = req.body;
    preferredLocations.push({
        id, // Unique id of the driver
        location // location in the format <lat>,<lon> (no space before or after ,)
    });
    res.status(200).send({message: 'Saved successfully'});
});

app.get('/select_ride', (req, res) => {
    const { lat, lon } = req.query;
    const lat1 = parseFloat(lat);
    const lon1 = parseFloat(lon);
    let min = 100000; // Store the minimum distance
    let minIndex = -1; // Store the driver index with min distance
    let nonPrefIndex = -1; // Store the first driver with no pref location

    // Loop through the available drivers to select one
    for(let i = 0; i<preferredLocations.length; i++) {
        if(preferredLocations[i].location !== null) {
            const splitted = preferredLocations[i].location.split(',');
            const lat2 = parseFloat(splitted[0]);
            const lon2 = parseFloat(splitted[1]);
            const distance = calculateDistance(lat1, lat2, lon1, lon2);
            console.log(i, distance);
            if (distance < min){
                min = distance;
                minIndex = i;
            }
        }
        else { 
            if(nonPrefIndex === -1) nonPrefIndex = i;
        }
    }

    const thresholdDistance = 3; // Taking the threshold for choosing a non preferred guy is 3 km.

    // If the min distance between a preferred loc and destination is more than thresholdDistance, we will choose a guy who has no pref
    // Also, if there are more than 1 driver with no pref loc, it will select the first one in the entry
    if (minIndex == -1 && nonPrefIndex == -1) {
        res.status(404).send('No Drivers Available');
    }
    else if (minIndex != -1 && nonPrefIndex == -1) {
        // send the min distance driver
        res.status(200).send({
            id: preferredLocations[minIndex].id
        })
    }
    else if (minIndex == -1 && nonPrefIndex != -1) {
        // send non preferred driver
        res.status(200).send({
            id: preferredLocations[nonPrefIndex].id
        })
    }
    else {
        if(min > thresholdDistance) {
        // send non preferred driver if no pref driver is available for less than threshold distance
            res.status(200).send({
                id: preferredLocations[nonPrefIndex].id
            })
        }
        else {
            //send minIndex
            res.status(200).send({
                id: preferredLocations[minIndex].id
            })
        }
    }
});

// Calculate distance using Haversine formula
function calculateDistance(lat1, lat2, lon1, lon2) {
    lon1 =  lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.pow(Math.sin(dlon / 2),2);
            
    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers
    let r = 6371;
    return(c * r);
}

app.listen(3000, () => {
    console.log('listening on port 3000')
});