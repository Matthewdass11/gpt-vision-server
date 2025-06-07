import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import OpenAI from 'openai';

dotenv.config();
const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    console.log("Received file:", req.file);
    const imagePath = req.file.path;
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this remote observation site. Extract weather, terrain, sky visibility, light pollution, equipment condition, risks. Return in bullet points." },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      max_tokens: 800
    });

    res.json({ analysis: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze image." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GPT Vision server running on http://localhost:${PORT}`));
