
import { GoogleGenAI, Type } from "@google/genai";
import { QuizResult, Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates 10 unique professional admin questions
 */
export const generateQuestions = async (): Promise<Question[]> => {
  const prompt = `
    Generate 10 unique, professional Discord management questions for a "VenusAR" admin recruitment test.
    The user is applying for a Junior Admin role. 
    Requirements:
    - Language: Arabic (Modern/Professional).
    - Difficulty: Progressive (3 Easy, 4 Medium, 3 Hard).
    - Style: Realistic scenarios, psychological management, technical crises, and social intelligence.
    - Options: 4 options per question. They must be very similar and tricky (skill-based).
    - Explanation: Provide a brief "Why" this is the correct choice in a professional tone.
    - Diversity: DO NOT repeat questions from previous patterns. Every generation must feel fresh.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9, // Higher temperature for more variety
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              difficulty: { type: Type.STRING, description: "سهل, متوسط, or صعب" },
              text: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctAnswer: { type: Type.INTEGER, description: "Index 0-3" },
              explanation: { type: Type.STRING }
            },
            required: ["id", "difficulty", "text", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const jsonStr = response.text.trim();
    const questions = JSON.parse(jsonStr) as Question[];
    return questions;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const evaluateQuiz = async (result: QuizResult): Promise<string> => {
  const prompt = `
    Analyze a VenusAR Management Quiz result. 
    User scored ${result.score} out of ${result.totalQuestions}.
    Provide a professional, motivating summary in ARABIC about their management skills as if you are a head of staff.
    Include a tip for improvement. Keep it concise, high-end, and inspiring.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return response.text || "أداء ملفت! استمر في تطوير مهاراتك الإدارية لتصبح جزءاً من نخبة VenusAR.";
  } catch (error) {
    return "أداء ممتاز! مهاراتك في التعامل مع المواقف تظهر إمكانات كبيرة كإداري واعد.";
  }
};
