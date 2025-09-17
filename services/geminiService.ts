
import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available from environment variables
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface VideoDescription {
  summary: string;
  setting: string;
  keyElements: string[];
  sequenceOfEvents: string[];
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise, one-to-two sentence summary of the entire video's content and narrative."
    },
    setting: {
        type: Type.STRING,
        description: "A description of the setting, location, and environment where the video takes place."
    },
    keyElements: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "A list of the key people, animals, or objects present in the video."
    },
    sequenceOfEvents: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING
      },
      description: "A step-by-step list describing the sequence of actions and events that occur in the video from beginning to end."
    },
  },
  required: ["summary", "setting", "keyElements", "sequenceOfEvents"],
};


/**
 * Sends frames from a video to the Gemini API to get a structured text description.
 * @param base64Frames An array of base64 encoded image strings.
 * @returns A promise that resolves to the AI-generated structured description object.
 */
export async function describeVideoFrames(base64Frames: string[]): Promise<VideoDescription> {
  try {
    const imageParts = base64Frames.map(frame => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: frame,
      },
    }));

    const textPart = {
      text: "Analyze these frames extracted sequentially from a video. Provide a structured analysis of the video's content in JSON format. Follow the provided schema precisely.",
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [textPart, ...imageParts] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const jsonText = response.text.trim();
    // In case the model returns the JSON wrapped in markdown
    const cleanedJsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');

    return JSON.parse(cleanedJsonText) as VideoDescription;

  } catch (error)
   {
    console.error("Error calling Gemini API or parsing response:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the AI's response. The format was invalid.");
    }
    throw new Error("Failed to get description from the AI model.");
  }
}
