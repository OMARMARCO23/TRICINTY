import { GoogleGenAI, Type } from "@google/genai";
import { Reading, Language } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: 'A short, catchy title for the advice.',
        },
        tip: {
          type: Type.STRING,
          description: 'The detailed, actionable energy-saving tip.',
        },
      },
      required: ["title", "tip"]
    },
};

const getLanguageName = (langCode: Language): string => {
    switch(langCode) {
        case 'en': return 'English';
        case 'fr': return 'French';
        case 'ar': return 'Arabic';
        default: return 'English';
    }
}

export const getPersonalizedAdvice = async (readings: Reading[], language: Language): Promise<{title: string, tip: string}[]> => {
    if (readings.length < 2) {
        throw new Error("Not enough data for advice generation.");
    }
    
    const recentReadings = readings.slice(-5);
    const readingSummary = recentReadings.map((r, i) => {
        const prevReading = i > 0 ? recentReadings[i-1] : null;
        const usage = prevReading ? (r.value - prevReading.value).toFixed(2) : 'N/A';
        return `- Reading on ${new Date(r.date).toLocaleString(language)} was ${r.value} kWh. (Usage since previous: ${usage} kWh)`;
    }).join('\n');

    const prompt = `
        You are an expert energy-saving advisor for residents in Morocco.
        Analyze the following recent electricity consumption data for a user.
        The data shows the meter reading at a specific date and time.
        
        Recent Data:
        ${readingSummary}

        Based on this data, provide 3 personalized, actionable, and concise energy-saving tips. 
        Look for patterns like high usage at certain times (if the data suggests it) or overall high consumption.
        The advice should be encouraging and practical for someone living in Morocco.
        
        Please provide the response in ${getLanguageName(language)}.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonStr = response.text.trim();
        const adviceList = JSON.parse(jsonStr);
        return adviceList;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to generate advice from AI.");
    }
};
