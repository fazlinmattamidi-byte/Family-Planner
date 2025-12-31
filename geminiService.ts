
import { GoogleGenAI, Type } from "@google/genai";
import { FamilyEvent, FamilyMember } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMorningSummary = async (events: FamilyEvent[], family: FamilyMember[]) => {
  const eventList = events
    .filter(e => {
        const today = new Date().setHours(0,0,0,0);
        const eDate = new Date(e.date).setHours(0,0,0,0);
        return eDate === today;
    })
    .map(e => {
        const member = family.find(f => f.id === e.assigneeId);
        return `- ${e.type}: ${e.title} for ${member?.name} at ${e.time || 'All Day'}`;
    })
    .join('\n');

  const prompt = `
    You are "The Family Brain", a cute AI assistant for a busy household.
    Review today's schedule and write a WhatsApp-style morning summary.
    Keep it cheerful, encouraging, and clear. 
    Use emojis!
    
    Today's Events:
    ${eventList.length > 0 ? eventList : "No specific events today - a rare peaceful day!"}
    
    Format the output as a JSON object with:
    - message: The full text of the summary.
    - reminders: A list of 2-3 specific "don't forget" items based on the data.
    - vibe: A one-word "mood" for the day (e.g., "Productive", "Chill", "Adventure").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            reminders: { type: Type.ARRAY, items: { type: Type.STRING } },
            vibe: { type: Type.STRING }
          },
          required: ["message", "reminders", "vibe"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini failed:", error);
    return {
      message: "Good morning! Something went wrong with my AI brain, but have a wonderful day anyway! ☀️",
      reminders: ["Check the calendar manually", "Stay awesome"],
      vibe: "Mysterious"
    };
  }
};
