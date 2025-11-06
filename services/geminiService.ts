import { GoogleGenAI } from "@google/genai";

/**
 * Generates a YARA rule by calling the Gemini API directly.
 * This function is intended for use in a local development environment.
 */
const generateRuleWithGemini = async (description: string): Promise<string> => {
    // The API key must be available as process.env.API_KEY.
    // The GoogleGenAI constructor will throw an error if the key is missing or invalid.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Construct the prompt for the AI model.
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

    // Call the Gemini API.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let text = response.text.trim();

    // Clean up the response to extract only the YARA rule code.
    if (text.startsWith('```yara')) {
      text = text.substring(7);
    } else if (text.startsWith('```')) {
      text = text.substring(3);
    }
    if (text.endsWith('```')) {
      text = text.slice(0, -3);
    }

    return text.trim();
};


/**
 * Generates a YARA rule by calling the secure backend proxy.
 * This function is intended for use in the production environment.
 */
const generateRuleWithProxy = async (description: string): Promise<string> => {
    const response = await fetch('/api/generate-rule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
        // Handle non-ok responses from the proxy
        try {
            const errorData = await response.json();
            throw new Error(errorData.error || `Request failed with status ${response.status}`);
        } catch (jsonError) {
            // Fallback if the error response is not JSON
            throw new Error(`Request failed with status ${response.status}. The server may have timed out or returned an unexpected error.`);
        }
    }

    const data = await response.json();
    return data.rule;
};


/**
 * Generates a YARA rule based on a natural language description.
 * It conditionally uses a direct API call in development or a secure proxy in production.
 */
export const generateYaraRule = async (description: string): Promise<string> => {
  try {
    // Vite exposes `import.meta.env.DEV` to distinguish between environments.
    // Cast to 'any' to bypass TypeScript error for this Vite-specific feature.
    if ((import.meta as any).env.DEV) {
      // In development, call the Gemini API directly from the client.
      return await generateRuleWithGemini(description);
    } else {
      // In production, use the secure backend proxy to protect the API key.
      return await generateRuleWithProxy(description);
    }
  } catch (error) {
    console.error("Error generating YARA rule:", error);
    if (error instanceof Error) {
        // Provide more user-friendly error messages
        if (error.message.includes('API key not valid')) {
             throw new Error('The API key is invalid. Please check your environment configuration.');
        }
        throw new Error(`Failed to generate rule: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the YARA rule.");
  }
};
