import { GoogleGenAI } from "@google/genai";

export const generateYaraRule = async (description: string): Promise<string> => {
  // Fix: Per Gemini API guidelines, API key must be from process.env.API_KEY and used directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    
    let text = response.text.trim();
    
    // Clean up the response to get only the code
    if (text.startsWith('```yara')) {
      text = text.substring(7);
    } else if (text.startsWith('```')) {
        text = text.substring(3);
    }

    if (text.endsWith('```')) {
      text = text.slice(0, -3);
    }

    return text.trim();
  } catch (error) {
    console.error("Error generating YARA rule:", error);
    if (error instanceof Error) {
        // Fix: Updated error message to reflect use of process.env.API_KEY.
        if (error.message.includes('API key not valid')) {
            throw new Error('Invalid Gemini API key. Please check the API_KEY environment variable.');
        }
        throw new Error(`Failed to generate rule from Gemini API: ${error.message}`);
    }
    throw new Error("Failed to generate YARA rule from Gemini API.");
  }
};
