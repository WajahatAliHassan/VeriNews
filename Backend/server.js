const express = require('express');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const Together = require('together-ai');
const bodyParser = require('body-parser');
require('dotenv').config();  // Make sure you have a .env file with TOGETHER_API_KEY

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Initialize the Together client
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

// Check if the input is a URL
function isUrl(inputData) {
    return inputData.startsWith('http://') || inputData.startsWith('https://');
}

// Fetch the title from a URL
async function fetchTitleFromUrl(url) {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const titleTag = $('title');
    return titleTag.text() || "No title found";
}

// Preprocess the input data
function preprocessText(text) {
    return text.replace(/<.*?>/g, '').replace(/\W/g, ' ').toLowerCase();
}

// Function to query the Llama3 model
async function callLlama3Model(preprocessedData, prompt) {
    const response = await together.chat.completions.create({
        model: "meta-llama/Llama-3-8b-chat-hf",
        messages: [
            { role: "system", content: preprocessedData },
            { role: "user", content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1,
        stop: [""],
        stream: false
    });

    return response.choices[0].message.content;
}

// Route to handle the User Query
app.post('/api/detect', async (req, res) => {
    const { text } = req.body;
    let content;

    if (isUrl(text)) {
        content = await fetchTitleFromUrl(text);
    } else {
        content = text;
    }

    const preprocessedData = preprocessText(content);
    const prompt = "Is this news fake or real? Give me an answer in only boolean return Real or Fake and also give me confidence score in percentage in response";
    const responseData = await callLlama3Model(preprocessedData, prompt);

    res.json({
        input: text,
        result: responseData.trim()
    });
});

// The "catchall" handler: for any request that doesn't match the above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
