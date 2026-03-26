import 'dotenv/config';

const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.error("Error: GEMINI_API_KEY is not set in .env");
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("Checking available models for key ending in...", key.slice(-4));

interface Model {
  name: string;
  version: string;
  displayName: string;
  description: string;
  inputTokenLimit: number;
  outputTokenLimit: number;
  supportedGenerationMethods: string[];
}

interface ResponseData {
  models?: Model[];
  error?: any;
}

fetch(url)
  .then(res => res.json() as Promise<ResponseData>)
  .then(data => {
    if (data.error) {
        console.error("Error:", JSON.stringify(data.error, null, 2));
    } else if (data.models) {
        console.log("Available Models:");
        const visionModels = data.models
            .filter((m: Model) => m.supportedGenerationMethods.includes("generateContent"))
            .map((m: Model) => m.name.replace('models/', ''));
            
        console.log(visionModels.join('\n'));
    } else {
        console.log("No models found or unexpected response structure.");
    }
  })
  .catch(err => console.error("Fetch error:", err));
