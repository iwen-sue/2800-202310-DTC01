require('dotenv').config();
const readline = require('readline');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// user prompt test

const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

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
const endDate = "2023-06-12";
const startTime = "09:00";
const endTime = "19:00";
const country = "Canada";
const cities = ["Vancouver", "Victoria"];
const promptArgs = `Make an itinerary at ${cities} in ${country} from ${startDate} to ${endDate}, around ${startTime} to ${endTime} in a format {date :, schedule: [{"time":, "category":, "activity":, "transportation":  transportation with estimated time }]}, in JSON format as an array. Assign dates properly in only one city considering distance. Include recommended transportation for each activity. Use the following categories to categorize each activity: ${categories}`;

async function generateItinerary() {
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: promptArgs },
        ],
        temperature: 0.3,
    });

    return res.data.choices[0].message.content;
}

console.log("Generating itinerary...");
generateItinerary().then((res) => {
    const jsonObj = JSON.parse(res);
    console.dir(jsonObj, { depth: null });
});



// above are user prompt test