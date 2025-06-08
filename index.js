import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import multer from 'multer';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
const upload = multer({ dest: 'uploads/' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

    console.log("🛰️ Image received:", imagePath);
    console.log("🔍 Base64 prefix:", base64Image.slice(0, 30));

    const response = await openai.chat.completions.create({
      model: "gpt-3.5",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this remote observation site. Extract weather, terrain, sky visibility, light pollution, equipment condition, risks. Return in bullet points."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 800
    });

    res.json({ analysis: response.choices[0].message.content });

  } catch (error) {
    console.error("❌ GPT Vision error:", error);
    res.status(500).json({ error: "Failed to analyze image." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
