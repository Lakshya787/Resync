/**
 * Generates the prompt to ask Gemini for a 5-question MCQ based on a video transcript.
 * 
 * @param {string} transcript - The raw transcript from the video
 * @param {string} difficulty - The difficulty level (Easy, Medium, Hard)
 * @returns {string} The formatted prompt
 */
export const generateQuizPrompt = (transcript, difficulty) => {
  // Slice transcript to first 4000 characters to stay within reasonable token bounds
  const safeTranscript = transcript ? transcript.slice(0, 4000) : "";

  return `
You are an expert educational AI. Based on the transcript provided below, generate exactly 5 multiple choice questions at a "${difficulty}" difficulty level.

Respond ONLY with a valid, pure JSON array. Do NOT include markdown blocks (like \`\`\`json). 
Each object in the array must strictly follow this exact format:
{
  "id": "A unique string or number for the question",
  "question": "The question text",
  "options": [
    "A) First option",
    "B) Second option",
    "C) Third option",
    "D) Fourth option"
  ],
  "answer": "The exact string from the options array that is correct (e.g., 'B) Second option')",
  "topic": "A 1-2 word topic tag for the question",
  "explanation": "A brief 1-2 sentence explanation of why the answer is correct"
}

TRANSCRIPT:
${safeTranscript}
  `.trim();
};

/**
 * Generates the prompt to ask Gemini for a weakness analysis coaching summary.
 * 
 * @param {string|object} summary - A summary string or object of the user's quiz history and weak topics
 * @returns {string} The formatted prompt
 */
export const weaknessAnalysisPrompt = (summary) => {
  const summaryText = typeof summary === 'string' ? summary : JSON.stringify(summary);

  return `
You are a "Resync learning coach", a highly encouraging and analytical educational mentor.
Analyze the following summary of a user's recent quiz history and identified weak topics.

Respond with exactly 4-5 encouraging and actionable sentences. Your goal is to gently highlight where they are struggling, motivate them to review those specific topics, and give them a brief, actionable strategy for improvement. Keep the tone uplifting and focused on growth.

QUIZ HISTORY SUMMARY:
${summaryText}
  `.trim();
};
