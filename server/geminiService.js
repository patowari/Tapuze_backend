const { GoogleGenAI, Type } = require("@google/genai");

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set in server/.env");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GRADING_PROMPT = `You are an expert math teacher's assistant specializing in grading handwritten math homework. Your analysis must be anchored to the curriculum and problem style found in "פתרון-מלא-35381.pdf — Math B 35381, Summer 2022 solutions, Yoel Geva".

Analyze the provided image containing a student's work. Identify each distinct problem and provide a detailed breakdown. The output MUST be a single JSON object.

**CRITICAL REQUIREMENT: All text fields must be bilingual, containing both an English ('en') and Hebrew ('he') translation.**

The JSON object must contain two keys:
1.  "overall_score": An integer representing the final calculated grade for the entire test, out of 100.
2.  "problem_breakdown": An array of objects, where each object represents the analysis of a single problem.

Each object in the "problem_breakdown" array must contain:
1.  "problem_description": A bilingual object describing the problem (e.g., {en: "Question 1: Solving a linear equation", he: "שאלה 1: פתרון משוואה לינארית"}).
2.  "score": The student's score for this specific problem.
3.  "max_score": The maximum possible score for this problem (e.g., 25).
4.  "feedback": A bilingual object with a general summary for the **student**. This should explain *why* they received their score and offer constructive advice for improvement.
5.  "teacher_recommendation": A bilingual object with a summary for the **teacher**. This should offer insights into the student's understanding, point out where they struggled, and suggest what concepts to reinforce.
6.  "errors": An array of objects, one for each mistake found. If the problem is solved perfectly, this must be an empty array.

Each error object in the "errors" array must contain:
1.  "error_type": A string categorizing the error. Must be one of: "minor_slip", "procedural_error", "conceptual_error".
2.  "deduction": A positive integer representing the points deducted.
3.  "explanation": A clear, constructive bilingual explanation of the mistake. **This should include a specific example of the incorrect step or concept from the student's work.** For example, "The student incorrectly calculated 5 * 8 as 35 instead of 40."
4.  "hint": A bilingual, actionable hint for the student on how to correct this type of mistake in the future. For example, "Remember to double-check your multiplication tables for accuracy."
5.  "boundingBox": An object with normalized coordinates ("x", "y", "width", "height") for the error's location on the image.

Rubric and Deduction Guidelines:
- "minor_slip": For arithmetic mistakes, copy errors, or sign errors. Deduction: 1-3 points.
- "procedural_error": For incorrect application of a known procedure (e.g., errors in distributing terms, incorrect order of operations). Deduction: 4-7 points.
- "conceptual_error": For fundamental misunderstandings of a mathematical concept (e.g., using the wrong formula, incorrect logic). These are the most severe. Deduction: 8-15 points.

Ensure all bounding boxes are accurate and normalized. Every string meant for display MUST be in the bilingual {en: "...", he: "..."} format.`;

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
        explanation: { ...bilingualTextSchema, description: "Bilingual explanation of the error, with specific examples from the student's work." },
        hint: { ...bilingualTextSchema, description: "Bilingual, actionable hint for the student on how to correct the mistake." },
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
    required: ["error_type", "deduction", "explanation", "hint", "boundingBox"],
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

const gradeHomework = async (imageBase64) => {
    try {
        const imagePart = {
             inlineData: { data: imageBase64, mimeType: 'image/jpeg' },
        };
        const textPart = {
            text: "Analyze the student's work in the provided image and provide a detailed breakdown according to the instructions. The user has provided a detailed system instruction for you to follow."
        };

        const response = await ai.models.generateContent({
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

        // Clean potential markdown formatting from the response
        const cleanedText = response.text.trim().replace(/^```json|```$/g, '').trim();
        const parsedJson = JSON.parse(cleanedText);
        
        // Basic validation before casting. The schema should handle most of this.
        if (
            typeof parsedJson.overall_score !== 'number' ||
            !Array.isArray(parsedJson.problem_breakdown)
        ) {
            throw new Error('Invalid JSON structure from API. Missing or malformed top-level keys.');
        }

        return parsedJson;

    } catch (error) {
        console.error("Error grading homework:", error);
        if (error instanceof Error) {
          throw new Error(`Failed to get a grade from the AI. It's possible the image is unclear or the AI service is temporarily unavailable. Details: ${error.message}`);
        }
        throw new Error("An unknown error occurred while grading.");
    }
};

module.exports = { gradeHomework };