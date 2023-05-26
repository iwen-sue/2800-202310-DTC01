const fs = require("fs");
const { parse } = require("csv-parse");

const data = [];
var countriesAndLength = [];

/**
 * calculate the average duration for each place in the given array.
 * 
 * @param {Array} jsonArray - target array information needs to calculate
 * @returns {Array} - the calculated results
 */
function calculateAverageDuration(jsonArray) {
// Create an object to store the sum and count for each place
    const placeData = {};

// Iterate over each JSON object in the array
    jsonArray.forEach(obj => {
        const place = obj.Place;
        const duration = parseInt(obj.Duration);

    // If the place is not in the placeData object, initialize the sum and count to 0
        if (!placeData[place]) {
            placeData[place] = {
                sum: 0,
                count: 0
            };
        }

        // Add the duration to the sum and increment the count
        placeData[place].sum += duration;
        placeData[place].count++;
    });
    // Create a new array to store the results
    const result = [];

    // Iterate over the placeData object and calculate the average duration for each place
    for (const place in placeData) {
        const averageDuration = Math.round(placeData[place].sum / placeData[place].count);
        result.push({ Place: place, AverageDuration: averageDuration });
    }
    return result;
}

fs.createReadStream("../assets/Travel details dataset.csv")
    .pipe(
        parse({
        delimiter: ",",
        columns: true,
        ltrim: true,
        })
    )
    .on("data", function (row) {
    // This will push the object row into the array
        data.push(row);
        countriesAndLength.push({
            Place: row.Destination,
            Duration: row["Duration (days)"],
        });
    })
    .on("error", function (error) {
        console.log(error.message);
    })
    .on("end", function () {
    // Here log the result array
        var recommendationsList = calculateAverageDuration(countriesAndLength);
        console.log(recommendationsList);
});