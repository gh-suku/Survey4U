import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API Routes (Placeholders - will be expanded)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const getAiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured on the server.");
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  };

  app.post("/api/ai/summary", async (req, res) => {
    try {
      const ai = getAiClient();
      const prompt = `
        You are helping prepare a pre-workshop survey analysis report for an enterprise AI workshop.
        Analyze the following survey responses and provide:
        1. Overall themes for pain points.
        2. Grouping of proposed business use cases.
        3. Practical recommendations for the workshop agenda and breakout groups.
        4. A short executive summary narrative in 2-3 paragraphs.

        Write in British English. Use a neutral consulting tone.

        Responses Data:
        ${JSON.stringify(req.body.responses || [])}
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    evidenceCount: { type: Type.NUMBER },
                  },
                  required: ["name", "description"],
                },
              },
              useCases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ["title", "description"],
                },
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["executiveSummary", "themes", "useCases", "recommendations"],
          },
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "AI analysis failed" });
    }
  });

  app.post("/api/ai/individual", async (req, res) => {
    try {
      const ai = getAiClient();
      const prompt = `
        Analyze this single survey response from an enterprise AI readiness assessment.
        Determine:
        1. AI Literacy Level from 1-5.
        2. Specific high-value opportunities mentioned.
        3. Key concerns or barriers.
        4. A summary of the respondent's profile.

        Question Context:
        ${JSON.stringify((req.body.questions || []).map((q: any) => ({ id: q.id, text: q.text })))}

        Response Answers:
        ${JSON.stringify(req.body.response?.answers || {})}

        Return JSON.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              literacyLevel: { type: Type.NUMBER },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              concerns: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
            },
            required: ["literacyLevel", "opportunities", "concerns", "summary"],
          },
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Individual analysis failed" });
    }
  });

  // New API endpoint for analyzing event responses
  app.post("/api/ai/analyze-event", async (req, res) => {
    try {
      const ai = getAiClient();
      const { responses, eventTitle } = req.body;

      const prompt = `
        Analyze survey responses for the event: "${eventTitle}"
        
        Provide a comprehensive analysis including:
        1. Executive Summary (2-3 paragraphs)
        2. Key Themes (identify 3-5 major themes with descriptions)
        3. Use Cases (identify potential use cases mentioned)
        4. Recommendations (actionable recommendations based on responses)

        Responses:
        ${JSON.stringify(responses)}

        Return structured JSON analysis.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              executiveSummary: { type: Type.STRING },
              themes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    evidenceCount: { type: Type.NUMBER },
                  },
                  required: ["name", "description"],
                },
              },
              useCases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    priority: { type: Type.STRING },
                  },
                  required: ["title", "description"],
                },
              },
              recommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["executiveSummary", "themes", "useCases", "recommendations"],
          },
        },
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Analysis failed" });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
