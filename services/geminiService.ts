
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends frames from a video to the Gemini API to get a text description.
 * @param base64Frames An array of base64 encoded image strings.
 * @returns A promise that resolves to the AI-generated description string.
 */
export async function describeVideoFrames(base64Frames: string[]): Promise<string> {
  try {
    const imageParts = base64Frames.map(frame => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frame,
      },
    }));

    const textPart = {
      text: "Analyze these frames extracted sequentially from a video. Provide a detailed, comprehensive description of what is happening in the video. Describe the setting, any people or objects, their actions, and the overall narrative or sequence of events.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, ...imageParts] },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get description from the AI model.");
  }
}
