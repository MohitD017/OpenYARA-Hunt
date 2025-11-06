// This file defines a serverless function that acts as a secure backend proxy.
// It is designed for platforms like Cloudflare Pages, Vercel, or Netlify.
// The file path `functions/api/generate-rule.ts` typically maps to the `/api/generate-rule` endpoint.

import { GoogleGenAI } from "@google/genai";

// Define the expected structure of the request body from the frontend.
interface RequestBody {
  description?: string;
}

// Define the structure of the context object provided by the serverless environment.
// This example is tailored for Cloudflare Pages.
interface Env {
  GEMINI_API_KEY: string;
}

interface FunctionContext {
  request: Request;
  env: Env;
}

// This is the main function that handles POST requests to the endpoint.
export const onRequestPost = async (context: FunctionContext) => {
  try {
    const { request, env } = context;
    const { GEMINI_API_KEY } = env;

    // 1. Check for the API key on the server.
    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured on the server.");
      return new Response(
        JSON.stringify({ error: "Server configuration error: Missing API key." }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Parse the request body from the frontend.
    const { description } = (await request.json()) as RequestBody;
    if (!description || typeof description !== 'string' || description.trim() === '') {
      return new Response(
        JSON.stringify({ error: "Invalid request: 'description' is required." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // 3. Initialize the Gemini AI SDK securely on the server.
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // 4. Construct the prompt, same as the original client-side version.
    const prompt = `
You are a senior cybersecurity engineer specializing in YARA rule creation.
Based on the following threat description, generate a valid YARA rule.

The rule should include:
- A 'meta' section with a description, author set to "AI Assistant", and the current date.
- A 'strings' section with relevant indicators of compromise (IOCs).
- A 'condition' section to define the match logic.

The rule name should be descriptive and start with a capital letter, followed by lowercase letters or numbers and underscores.

Threat Description:
"${description}"

Output *only* the YARA rule code block, enclosed in \`\`\`yara ... \`\`\`. Do not include any other text, explanation, or markdown formatting outside the code block.
    `;

    // 5. Call the Gemini API from the server.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text.trim();

    // 6. Clean up the response to get only the code.
    if (text.startsWith('```yara')) {
      text = text.substring(7);
    } else if (text.startsWith('```')) {
      text = text.substring(3);
    }
    if (text.endsWith('```')) {
      text = text.slice(0, -3);
    }

    // 7. Send the successful response back to the frontend.
    return new Response(
        JSON.stringify({ rule: text.trim() }), 
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in serverless function:", error);
    let errorMessage = "An internal server error occurred.";
    if (error instanceof Error && error.message.includes('API key not valid')) {
        errorMessage = "The server-side API key is invalid or has expired.";
    }
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
