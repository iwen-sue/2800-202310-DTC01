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

/**
 * generate itinenary test playground using openAI api.
 * 
 * @param {Object} conversation - JSON object contains conversation information
 * @returns {*} - the response from AI
 */
async function generateItinerary(conversation) {
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "user", content: JSON.stringify(conversation) },
            { role: "system", content: "You are an Assistant that applies JSON format to an itinerary" }
        ],
        temperature: 0.2, // Adjust the temperature value for faster response time
    });
    let response = res.data.choices[0].message.content;
    return response;
}

/**
 * print out play ground test respond in console.
 */
generateItinerary(conversation).then((res) => {
    console.log(res) // Print the response content
});
