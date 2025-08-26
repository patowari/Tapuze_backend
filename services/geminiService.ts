
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GRADING_PROMPT } from '../constants';
import type { GradingResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const bilingualTextSchema = {
    type: Type.OBJECT,
    properties: {
        en: { type: Type.STRING },
        he: { type: Type.STRING },
    },
    required: ["en", "he"],
};

const errorAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        error_type: { type: Type.STRING, enum: ["minor_slip", "procedural_error", "conceptual_error"] },
        deduction: { type: Type.INTEGER, description: "Points deducted for the error." },
        explanation: { ...bilingualTextSchema, description: "Bilingual explanation of the error." },
        boundingBox: {
            type: Type.OBJECT,
            properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
            },
            required: ["x", "y", "width", "height"],
        },
    },
    required: ["error_type", "deduction", "explanation", "boundingBox"],
};

const problemAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        problem_description: { ...bilingualTextSchema, description: "Bilingual description of the problem." },
        score: { type: Type.INTEGER },
        max_score: { type: Type.INTEGER },
        feedback: { ...bilingualTextSchema, description: "Bilingual overall feedback for the student." },
        teacher_recommendation: { ...bilingualTextSchema, description: "Bilingual recommendations for the teacher." },
        errors: {
            type: Type.ARRAY,
            description: "A list of errors found in this problem.",
            items: errorAnalysisSchema,
        },
    },
    required: ["problem_description", "score", "max_score", "feedback", "teacher_recommendation", "errors"],
};

const gradingSchema = {
  type: Type.OBJECT,
  properties: {
    overall_score: {
      type: Type.INTEGER,
      description: "An integer overall grade from 0 to 100.",
    },
    problem_breakdown: {
      type: Type.ARRAY,
      description: "An array of detailed bilingual analyses for each problem.",
      items: problemAnalysisSchema,
    },
  },
  required: ["overall_score", "problem_breakdown"],
};

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            }
        };
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const gradeHomework = async (imageFile: File): Promise<GradingResponse> => {
    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = {
            text: "Analyze the student's work in the provided image and provide a detailed breakdown according to the instructions. The user has provided a detailed system instruction for you to follow."
        };

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [imagePart, textPart]
            },
            config: {
                systemInstruction: GRADING_PROMPT,
                responseMimeType: "application/json",
                responseSchema: gradingSchema,
                temperature: 0.2,
            }
        });

        const text = response.text;
        const parsedJson = JSON.parse(text);
        
        // Basic validation before casting. The schema should handle most of this.
        if (
            typeof parsedJson.overall_score !== 'number' ||
            !Array.isArray(parsedJson.problem_breakdown)
        ) {
            throw new Error('Invalid JSON structure from API. Missing or malformed top-level keys.');
        }

        return parsedJson as GradingResponse;

    } catch (error) {
        console.error("Error grading homework:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to get a grade from the AI. Reason: ${error.message}`);
        }
        throw new Error("An unknown error occurred while grading.");
    }
};