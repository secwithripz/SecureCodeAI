import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const client = new InferenceClient(process.env.HF_TOKEN);

app.use(cors());
app.use(express.json());

app.post("/scan", async (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Valid code string required." });
  }

  try {
    const messages = [
      {
        role: "user",
        content: `Analyze this code for security vulnerabilities and respond with:
1. Vulnerability type
2. Severity (High/Medium/Low)
3. Location
4. Fix recommendation

Code:
${code}`,
      },
    ];

    let result = "";
    const stream = client.chatCompletionStream({
      provider: "featherless-ai",
      model: "mistralai/Magistral-Small-2506",
      messages,
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) result += content;
    }

    res.json({ result });
  } catch (err) {
    console.error("Error analyzing code:", err);
    res.status(500).json({ error: "Failed to analyze code" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "active", timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
