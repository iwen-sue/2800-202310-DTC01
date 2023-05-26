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
const endDate = "2023-06-11";
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

const conversation = [
    { role: 'system', content: `You are an Assistant that provides recommendations for trip itineraries in a format of ${JSON.stringify(itineraryMemory)} in an array.` },
    { role: 'user', content: `I need help planning a trip to ${cities}.` },
    { role: 'assistant', content: 'When are you planning to visit there' },
    { role: 'user', content: `I\'ll be there from ${startDate} to ${endDate}. I want to move from ${scheduleStartTime} to ${scheduleEndTime} per a day` },
    { role: 'assistant', content: 'What are your preferred categories of activities?' },
    { role: 'user', content: `I\'m interested in ${categories}.` },
    { role: 'assistant', content: 'Let me generate an itinerary for you based on your preferences.' },
    { role: 'user', content: `Don\'t forget to include transportation time` },
];

async function generateItinerary() {
    console.log("Generating itinerary...");
    console.time("programRuntime");

    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: "give me from June 3rd to June 11th from 9:00 to 19:00 travel itinerary in Mexico City and its surroundings in JSON format" },
            { role: "system", content: "You are an Assistant that applies JSON format to an itinerary" }
        ],
        temperature: 0.5, // Adjust the temperature value for faster response time
    });

    let response = res.data.choices[0].message.content;

    return response;
}



generateItinerary().then((res) => {
    console.log(res) // Print the response content
    console.timeEnd("programRuntime");
    const runtimeInSeconds = (performance.now() / 1000).toFixed(2);
    console.log(`Program runtime: ${runtimeInSeconds} seconds`);
});

