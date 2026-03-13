import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Multer keeps the uploaded PDF in memory as a buffer
const upload = multer({ storage: multer.memoryStorage() });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// The exact JSON schema for React Flow
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
              label: { type: SchemaType.STRING, description: "Uppercase concept name, keep it SHORT (1-3 words)" },
              description: { type: SchemaType.STRING, description: "1-2 sentence explanation of what this skill is and why it matters" },
              projects: {
                type: SchemaType.ARRAY,
                items: { type: SchemaType.STRING, description: "A specific mini-project idea to practice this skill, e.g. 'Build a Random Color Generator to master DOM manipulation'" },
                description: "2-3 hands-on project ideas to practice this skill"
              }
            },
            required: ["label", "description", "projects"]
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

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: reactFlowSchema,
  },
});

// The API Route
app.post('/api/generate-tree', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a syllabus PDF." });
    }

    console.log(`Sending raw PDF (${req.file.originalname}) directly to Gemini...`);

    // 1. Convert the raw PDF buffer from Multer into a Base64 string
    const pdfBase64 = req.file.buffer.toString('base64');

    // 2. Create the Gemini inline data object for the PDF
    const pdfPart = {
      inlineData: {
        data: pdfBase64,
        mimeType: "application/pdf"
      }
    };

    // 3. The prompt instruction
    const textPrompt = `
      You are an expert Technical Curriculum Designer. Read the attached college syllabus PDF.
      Transform the academic concepts inside it into a DETAILED interactive skill roadmap mapped to modern industry skills.

      RULES:
      - Generate 20-30 nodes total for a comprehensive, granular tree.
      - Use exactly these node types: root (1 node), domain (3-6 nodes), skill (8-15 nodes), leaf (5-10 nodes).
      - Keep labels SHORT: 1-3 words max, all UPPERCASE.
      - For EVERY node, write a 1-2 sentence "description" explaining what this skill is and why it matters in the real world.
      - For skill and leaf nodes, provide 2-3 specific "projects" — concrete mini-project ideas a student can build to practice that skill.
        Example projects: "Build a Random Color Generator to master DOM manipulation", "Create a CLI Todo App to learn file I/O and CRUD".
      - For root and domain nodes, provide 1-2 broader project ideas.
      - Map theoretical/academic concepts to specific modern tools and frameworks (e.g., Graph Theory -> Neo4j, Concurrency -> Go goroutines).
      - Connect nodes with edges showing prerequisite relationships.
    `;

    // 4. Send BOTH the text prompt and the PDF file directly to the model
    const result = await model.generateContent([textPrompt, pdfPart]);
    const generatedJson = JSON.parse(result.response.text());

    console.log("Tree generated successfully! Saving to Supabase...");

    const { data, error } = await supabase
      .from('roadmaps')
      .insert([{ syllabus_text: "PDF parsed directly by Gemini API", skill_tree_json: generatedJson }])
      .select();

    if (error) console.error("Supabase Save Error (Non-Fatal):", error);

    res.status(200).json(generatedJson);

  } catch (error) {
    console.error("Backend Error Caught:", error);
    res.status(500).json({ error: "Failed to generate roadmap. Please try again." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SkillBridge Backend running on port ${PORT}`));