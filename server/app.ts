import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// ─── CONFIGURATION ───
app.use(cors({
  origin: true, // Allow all origins (or specify your Vercel URL)
  credentials: true,
}));
app.use(express.json({ limit: '100mb' }));

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TEXT_MODEL = process.env.AI_MODEL || 'stepfun/step-3.5-flash:free';
const VISION_MODEL = process.env.AI_VISION_MODEL || 'gemini-1.5-flash';

console.log('─── SOLACE SERVER STARTING (CLEAN SLATE) ───');
console.log(`[Config] Text Model: ${TEXT_MODEL}`);
console.log(`[Config] Vision Model: ${VISION_MODEL}`);
console.log(`[Config] OpenRouter Key: ${OPENROUTER_API_KEY ? 'OK' : 'MISSING'}`);
console.log(`[Config] Gemini Key: ${GEMINI_API_KEY ? 'OK' : 'MISSING'}`);

// ─── PROMPTS ───
const FORMATTING_RULES = `
CRITICAL FORMATTING RULES:
1. NO MARKDOWN (no bold, no italics, no bullet points).
2. NO LISTS. Write in paragraphs or short bursts.
3. NEVER SUMMARIZE or recap.
4. Just react and converse naturally.
5. Use proper capitalization and punctuation, but keep the tone casual.
`;

const BASE_GEN_Z_PROMPT = `
ROLE: You are Solace.
CORE INTELLIGENCE: You possess the sophisticated, nuanced, and high-EQ reasoning of Claude Sonnet 4.6.
VOICE: You express this intelligence through the persona of a Gen Z internet-native.

Respond like a Gen Z internet-native who lives online. Use casual, conversational language that feels like texting. Lean into modern slang naturally (lowkey, highkey, ngl, fr, vibes, it’s giving, wild, iconic, unhinged, valid, bet). 
IMPORTANT: Use proper capitalization and punctuation (start sentences with capitals, use periods). Don't use lowercase-only style.
${FORMATTING_RULES}
`;

const DIRECT_PROMPT = `
ROLE: You are Solace (Direct Mode).
CORE INTELLIGENCE: Claude Sonnet 4.6 (High EQ, Smart).
VOICE: Direct, blunt, no-nonsense.

You cut through the noise. You don't sugarcoat things. You give straight answers.
- Be honest and raw.
- Don't use excessive slang like the Gen Z mode, just speak plainly and directly.
- If something is dumb, say it. If it's real, validate it.
- Short, punchy sentences.
${FORMATTING_RULES}
`;

const GENTLE_PROMPT = `
ROLE: You are Solace (Gentle Mode).
CORE INTELLIGENCE: Claude Sonnet 4.6 (High EQ, Smart).
VOICE: Warm, soft, comforting, patient.

You are a safe space. You listen without judgment and respond with extreme care.
- Use softer language.
- Validate feelings deeply.
- Be slower, calmer, and more supportive.
- Avoid harsh slang.
${FORMATTING_RULES}
`;

const BALANCED_PROMPT = `
ROLE: You are Solace (Balanced Mode).
CORE INTELLIGENCE: Claude Sonnet 4.6 (High EQ, Smart).
VOICE: A mix of smart friend and therapist. Casual but thoughtful.

You are the middle ground. You can joke, but you can also be serious.
- Not too slang-heavy, not too soft, not too blunt.
- Just a normal, intelligent friend texting back.
${FORMATTING_RULES}
`;

const PERSONALITY_PROMPTS: Record<string, string> = {
  balanced: BALANCED_PROMPT,
  'gen-z': BASE_GEN_Z_PROMPT,
  gentle: GENTLE_PROMPT,
  direct: DIRECT_PROMPT
};

// ─── VISION HELPER (GEMINI) ───
async function analyzeImageWithGemini(base64Image: string, mimeType: string): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('Gemini API Key missing');

  // Updated model list based on check_models.ts output
  // We prioritize newer flash models that actually exist for your key
  const modelIds = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite-preview-02-05',
    'gemini-flash-latest', 
    'gemini-1.5-flash-latest'
  ];
  
  const visionPromptText = `
  YOU ARE A STRICT OCR ENGINE. DO NOT DESCRIBE THE IMAGE.
  
  TASK: Transcribe the chat conversation in the image exactly as it appears, from top to bottom.
  
  RULES FOR SPEAKER IDENTIFICATION (CRITICAL):
  - Messages aligned to the RIGHT side = "USER (ME)"
  - Messages aligned to the LEFT side = "THEM"
  - Center messages = "SYSTEM"
  
  OUTPUT FORMAT:
  [Speaker]: [Text content]
  
  Example:
  USER (ME): Hey
  THEM: Hi, how are you?
  USER (ME): I'm good
  
  DO NOT add any commentary. DO NOT describe colors. DO NOT summarize. JUST TRANSCRIBE.
  `;

  const body = {
    contents: [{
      parts: [
        { text: visionPromptText },
        { inline_data: { mime_type: mimeType, data: base64Image } }
      ]
    }]
  };

  let lastError = '';

  for (const modelId of modelIds) {
    try {
        console.log(`[Vision] Trying model: ${modelId}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[Vision] Model ${modelId} failed: ${response.status} ${errText}`);
            lastError = errText;
            continue; // Try next model
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) return text;
        
    } catch (e) {
        console.error(`[Vision] Error with ${modelId}:`, e);
    }
  }
  
  throw new Error(`Vision analysis failed on all models. Last error: ${lastError}`);
}

// ─── CHAT ENDPOINT ───
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, personality, images } = req.body;
    const selectedPersonality = personality || 'balanced';
    
    // 1. Vision Analysis (if images exist)
    let imageContext = "";
    if (images && images.length > 0) {
      console.log(`[Chat] Analyzing ${images.length} image(s)...`);
      
      // Process ALL images in parallel
      const analysisPromises = images.map(async (image: string, index: number) => {
          try {
              const base64 = image.includes(',') ? image.split(',')[1] : image;
              const mime = image.match(/data:(.*?);/)?.[1] || 'image/jpeg';
              const text = await analyzeImageWithGemini(base64, mime);
              return `(IMAGE ${index + 1} CONTENT START)\n${text}\n(IMAGE ${index + 1} CONTENT END)`;
          } catch (e: any) {
              console.error(`[Vision] Failed to analyze image ${index + 1}:`, e.message);
              return `(IMAGE ${index + 1} COULD NOT BE READ)`;
          }
      });

      const results = await Promise.all(analysisPromises);
      imageContext = "\n" + results.join("\n\n") + "\n";
      console.log(`[Chat] Vision Analysis Complete for ${images.length} images.`);
    }

    // 2. Prepare Text Request (StepFun via OpenRouter)
    const systemPrompt = PERSONALITY_PROMPTS[selectedPersonality] || PERSONALITY_PROMPTS.balanced;
    
    // If vision analysis failed but we have text, we should still proceed, just without image context
    if (images && images.length > 0 && !imageContext) {
         console.warn("Proceeding with chat despite vision failure.");
         imageContext = "\n[Image attached but couldn't be read. Just ask what it is naturally.]";
    }

    // Combine user message with image context
    // Simplify the context injection to avoid triggering "summary mode"
    const finalUserMessage = imageContext ? `${imageContext}\n\n${message || ""}` : message;

    // Clean history of undefined/null content and em-dashes
    // AND TRUNCATE to last 6 messages to prevent "bad history" (bullet points) from influencing the model
    const cleanHistory = (history || [])
        .filter((msg: any) => msg && msg.content)
        .slice(-6) 
        .map((msg: any) => ({
            role: msg.role,
            content: msg.content.replace(/—/g, ' - ').replace(/–/g, ' - ')
        }));

    const messages = [
      { role: 'system', content: systemPrompt },
      ...cleanHistory,
      { role: 'user', content: finalUserMessage }
    ];

    console.log(`[Chat] Sending to ${TEXT_MODEL} (max_tokens: 150)...`);
    
            // ─── STRICT MODEL RETRY LOGIC (WITH FALLBACKS) ───
            let response;
            let attempts = 0;
            const MAX_RETRIES = 3;
            // Fallback models to try if the primary one fails/rate-limits
            const FALLBACK_MODELS = [
                'google/gemini-2.0-flash-lite-preview-02-05:free',
                'qwen/qwen-2.5-72b-instruct:free',
                'stepfun/step-3.5-flash:free' // Try original again last
            ];

            let currentModel = TEXT_MODEL;
            let fallbackIndex = -1;

            while (attempts < MAX_RETRIES) {
                attempts++;
                try {
                    console.log(`[Chat] Attempting with model: ${currentModel}...`);
                    
                    const bodyPayload: any = {
                        model: currentModel,
                        messages: messages,
                        temperature: 0.9,
                        top_p: 1,
                        include_reasoning: false,
                        stop: ["\n\n\n", "User:", "System:", "Solace:"] 
                    };
                    
                    if (attempts > 1) {
                        bodyPayload.max_tokens = 600; 
                    }

                    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                            'Content-Type': 'application/json',
                            'HTTP-Referer': 'https://solace-app.com',
                            'X-Title': 'Solace App'
                        },
                        body: JSON.stringify(bodyPayload)
                    });

                    if (response.ok) {
                        // Success! Break loop.
                        break;
                    } else if (response.status === 429 || response.status === 503 || response.status === 502) {
                        console.warn(`[Chat] ${currentModel} failed (${response.status}). Switching to fallback...`);
                        
                        // Switch to next fallback model
                        fallbackIndex++;
                        if (fallbackIndex < FALLBACK_MODELS.length) {
                            currentModel = FALLBACK_MODELS[fallbackIndex];
                            attempts = 0; // Reset attempts for new model
                            continue; // Try immediately with new model
                        } else {
                            // No more fallbacks, wait and retry current
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    } else {
                        const errText = await response.text();
                        throw new Error(`AI Provider Error (${response.status}): ${errText}`);
                    }
                } catch (e: any) {
                    console.error(`[Chat] Error with ${currentModel}: ${e.message}`);
                    if (attempts === MAX_RETRIES && fallbackIndex >= FALLBACK_MODELS.length - 1) throw e;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }

    if (!response || !response.ok) {
        throw new Error(`Failed to get response after ${MAX_RETRIES} attempts.`);
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content;
    
    if (!reply) {
         console.warn(`[Chat] Empty reply received after check passed? Data:`, JSON.stringify(data));
         reply = "I'm having trouble connecting right now.";
    }

    // 3. Post-Processing (Force clean up of dashes, thoughts, and Gemini-isms)
    // Apply to ALL modes since we are enforcing the Gen Z/Claude hybrid everywhere
    if (true) {
        // DeepSeek/StepFun often use <think> tags. We must remove the ENTIRE thought block.
        // Also handle malformed closing tags like "/think>" or orphaned "</think>"
        reply = reply.replace(/<think>[\s\S]*?<\/think>/gi, '') // Remove proper <think>...</think> block
                     .replace(/^[\s\S]*?\/think>/i, '')         // Remove everything up to malformed "/think>"
                     .replace(/^[\s\S]*?<\/think>/i, '')        // Remove everything up to orphaned "</think>"
                     .replace(/<[^>]*>/g, '')                   // Remove any remaining XML tags
                     .replace(/^more\.\s*/i, '') // Remove "more." start
                     .replace(/^\s*[-*•]\s+/gm, '') // Remove bullet points at start of lines
                     .replace(/\n\s*[-*•]\s+/g, ', ') // Replace inline bullets with commas
                     .replace(/(\r\n|\n|\r){2,}/g, '\n') // Remove excessive newlines
                     .trim();

        reply = reply
            .replace(/—/g, ', ')      // Em-dash -> comma
            .replace(/–/g, ', ')      // En-dash -> comma
            //.replace(/\*\*/g, '')     // Remove bold markdown (DISABLED: User wants bolding)
            .replace(/([^*]|^)\*([^*]+)\*([^*]|$)/g, '$1**$2**$3') // Convert *italic* to **bold** (more robust)
            .replace(/^["']|["']$/g, '') // Remove wrapping quotes
            .replace(/…/g, '...');    // Ellipsis normalization
    }

    // Return the reply AND the image context (so frontend can see what happened if needed)
    res.json({ reply, imageContext });

  } catch (error: any) {
    console.error('[Server Error]', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// ─── HEALTH CHECK ───
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        model: TEXT_MODEL, 
        vision: VISION_MODEL,
        timestamp: new Date().toISOString()
    });
});

// ─── JOURNAL (In-Memory) ───
interface JournalEntry { id: string; content: string; mood: string; intensity: number; createdAt: string; }
const entries: JournalEntry[] = [];

app.get('/api/entries', (req, res) => res.json(entries));

app.post('/api/entries', (req, res) => {
  const { content, mood, intensity } = req.body;
  if (!content) { res.status(400).json({ error: 'Content required' }); return; }
  
  const entry = {
    id: crypto.randomUUID(),
    content,
    mood: mood || 'neutral',
    intensity: intensity ?? 3,
    createdAt: new Date().toISOString()
  };
  entries.unshift(entry);
  res.status(201).json(entry);
});

app.delete('/api/entries/:id', (req, res) => {
  const idx = entries.findIndex(e => e.id === req.params.id);
  if (idx !== -1) entries.splice(idx, 1);
  res.status(204).send();
});

app.delete('/api/entries', (req, res) => {
  entries.length = 0;
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Solace Server running on http://localhost:${PORT}`);
});
