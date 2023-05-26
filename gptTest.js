require('dotenv').config();

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// User prompt test
const categories = [
    "Sightseeing",
    "Outdoor Adventure",
    "Cultural Experience",
    "Food and Dining",
    "Shopping",
    "Entertainment",
    "Nature Exploration",
    "Relaxation"
];

const startDate = "2023-06-10";
const endDate = "2023-06-15";
const scheduleStartTime = "09:00";
const scheduleEndTime = "19:00";
const country = "Canada";
const cities = ["Vancouver", "Victoria"];

const itineraryMemory = [
    {
        date: "date",
        schedule: [
            {
                startTime: scheduleStartTime,
                endTime: "endTime you estimate",
                category: "category you choose",
                activity: "recommend ",
                transportation: "transportation with estimated time"
            }
        ]
    },
];


var cityDates

let assignDateUserPromt = `I want to go ${cities} From ${startDate} to ${endDate}. Assign the dates for each city. Format must be like "city": {"start_date": "2023-06-10", "end_date": "2023-06-12", "duration": number}. You don't need to show anything else. Don't include`;

async function assignDay(startDate, endDate, cities, assignDateUserPromt) {
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: "You are an Assistant that make response a valid JSON string. Don't inlucde backticks in response" },
            { role: "user", content: assignDateUserPromt },
        ],
        temperature: 0.3, // Adjust the temperature value for faster response time
    });

    let response = res.data.choices[0].message.content;
    return response;
}


var acitivityMemory = [];

async function generateItinerary(generateUserPrompt, acitivityMemory) {
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "system", content: `You are an Assistant that applies JSON format to an itinerary.` },
            { role: "assistant", content: `This is previous activities already made. ${acitivityMemory}` },
            { role: "user", content: generateUserPrompt },
        ],
        temperature: 0.5, // Adjust the temperature value for faster response time
    });

    let response = res.data.choices[0].message.content;

    return response;
}


// generateItinerary(generateUserPrompt, tripData).then((res) => {
//     console.log(res);
// });

var oneCity, duration;
let memory = [];
let activityMemory = [];

assignDay(startDate, endDate, cities, assignDateUserPromt).then((res) => {
    try {
        cityDates = JSON.parse(res);
        for (let i = 0; i < cities.length; i++) {
            memory.push({
                city: cities[i],
                date: cityDates[cities[i]],
                duration: cityDates[cities[i]].duration
            })
        }
        console.log("memory", memory);
        for (let i = 0; i < memory.length; i++) {
            oneCity = memory[i].city;
            duration = memory[i].duration;
            for (let j = 0; j < duration; j++) {
                let generateUserPrompt = `Make an itinerary for day ${j + 1} in ${oneCity}. starttime is ${scheduleStartTime} endtime is ${scheduleEndTime}. Categorize each activity using ${categories}.
                 No additional words. See ${activityMemory} before you make an activity so that activities won't be duplicated. Right after you make an activity, store that activity into this ${activityMemory} to refer to it later.`;

                (async () => {
                    // Generate the itinerary for the current day
                    let res = await generateItinerary(generateUserPrompt, activityMemory);
                    console.log("This is activityMemory", activityMemory);
                    console.log(res);

                    // Store the generated activity in activityMemory
                    activityMemory.push(res);
                })();
            }
        }
    } catch (error) {
        console.error("Error parsing JSON:", error);
    }
});













