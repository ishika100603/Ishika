const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const openaiApiKey = defineSecret("OPENAI_API_KEY");

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: "Missing 'messages' array in request body." });
        }

        const openai = new OpenAI({ apiKey: openaiApiKey.value() });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content:
                        "You are a friendly assistant embedded in a student's design portfolio website. Keep answers concise and helpful.",
                },
                ...messages,
            ],
            max_tokens: 300,
        });

        const reply = completion.choices[0].message.content;
        res.status(200).json({ reply });
    } catch (err) {
        console.error("OpenAI error:", err);
        res.status(500).json({ error: "Something went wrong talking to OpenAI." });
    }
});

exports.chat = onRequest({ secrets: [openaiApiKey] }, app);
