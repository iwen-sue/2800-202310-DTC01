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

let memory = [];

userInterface.prompt();
userInterface.on("line", async (input) => {
    memory.push(input);
    
    const res = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
            { role: "assistant", content: memory.join('') },
            { role: "user", content: input },
            ],
        temperature: 0.3,
    })
    console.log(res.data.choices[0].message.content);
});

// above are user prompt test