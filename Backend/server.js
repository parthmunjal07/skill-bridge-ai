import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the exact JSON schema we want Gemini to return for React Flow
const reactFlowSchema = {
  type: SchemaType.OBJECT,
  properties: {
    nodes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Unique node ID (e.g., n1)" },
          type: { type: SchemaType.STRING, description: "Must be: root, domain, skill, or leaf" },
          data: {
            type: SchemaType.OBJECT,
            properties: {
              label: { type: SchemaType.STRING, description: "Uppercase concept name" },
              description: { type: SchemaType.STRING, description: "Short explanation" }
            },
            required: ["label"]
          }
        },
        required: ["id", "type", "data"]
      }
    },
    edges: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Unique edge ID (e.g., e1-2)" },
          source: { type: SchemaType.STRING, description: "Source node ID" },
          target: { type: SchemaType.STRING, description: "Target node ID" }
        },
        required: ["id", "source", "target"]
      }
    }
  },
  required: ["nodes", "edges"]
};

// The Model Setup
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: reactFlowSchema,
  },
});

// The Single API Route
app.post('/api/generate-tree', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a syllabus PDF." });
    }

    console.log("Extracting text from PDF...");
    const pdfData = await pdfParse(req.file.buffer);
    const syllabusText = pdfData.text;

    console.log("Analyzing syllabus with Gemini...");

    const prompt = `
      You are an expert Technical Curriculum Designer. Transform the following college syllabus text into an interactive roadmap mapped to modern industry skills.
      Limit the output to 8-12 nodes total to prevent UI clutter. Map theoretical concepts to specific modern tools (e.g., Graph Theory -> Neo4j).
      
      Syllabus Text:
      ${syllabusText}
    `;

    const result = await model.generateContent(prompt);
    const generatedJson = JSON.parse(result.response.text());

    console.log("Tree generated successfully. Saving to Supabase...");

    // Save to Database (Skipping user_id for MVP speed)
    const { data, error } = await supabase
      .from('roadmaps')
      .insert([{ syllabus_text: syllabusText, skill_tree_json: generatedJson }])
      .select();

    if (error) console.error("Supabase Save Error:", error);

    // Send back to React
    res.status(200).json(generatedJson);

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to generate roadmap. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 SkillBridge Backend running on port ${PORT}`));