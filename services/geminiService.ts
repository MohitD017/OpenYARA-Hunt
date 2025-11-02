import { GoogleGenAI } from "@google/genai";

// Fix: Initialize GoogleGenAI with process.env.API_KEY directly as per coding guidelines.
// The API key's availability is assumed to be handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateYaraRule = async (description: string): Promise<string> => {
  // Fix: Removed explicit API key check, as its presence is a hard requirement handled externally.
  
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
      model: 'gemini-2.5-flash',
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
    throw new Error("Failed to generate YARA rule from Gemini API.");
  }
};