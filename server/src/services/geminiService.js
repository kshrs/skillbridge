/**
 * Gemini AI Quiz Generation Service
 * Uses Google Gemini Flash (gemini-1.5-flash / gemini-2.0-flash / gemini-2.5-flash)
 * Evaluates course modules, syllabus, and lecture concepts into structured self-assessment quizzes.
 */

const generateQuizWithGemini = async ({ courseTitle, moduleTitle, lectures = [], skills = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  const lectureTitles = lectures.map(l => l.title || l).join(', ');
  const skillsList = Array.isArray(skills) ? skills.join(', ') : '';

  // Prompt requesting strict JSON format
  const prompt = `You are a computer science professor creating a rigorous self-assessment quiz to test student comprehension of a specific course module.

Course Title: "${courseTitle || 'Computer Science'}"
Module Title: "${moduleTitle || 'Core Concepts'}"
Lectures Covered: ${lectureTitles || 'Module foundational topics'}
Core Skills / Competencies: ${skillsList || 'Technical reasoning'}

Task: Generate exactly 4 high-quality multiple choice questions (MCQs) testing deep conceptual and practical understanding of this module.
Requirements:
1. Each question must have 4 distinct, plausible options.
2. Only 1 option must be correct.
3. Include an insightful explanation justifying why the correct answer is right and why the core engineering principle matters.
4. "correctAnswer" MUST be the 0-based integer index of the correct option (0, 1, 2, or 3).
5. Output MUST be ONLY valid JSON matching this schema, without markdown formatting or code fences:

{
  "title": "${courseTitle}: ${moduleTitle} Quiz",
  "description": "AI-generated diagnostic quiz testing key architectural, algorithmic, and engineering principles taught in ${moduleTitle}.",
  "questions": [
    {
      "type": "mcq",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation here.",
      "points": 25
    }
  ]
}`;

  if (!apiKey) {
    console.warn('[Gemini AI Service]: No GEMINI_API_KEY found in process.env. Falling back to heuristic generator.');
    return null;
  }

  // Model preference list: latest flash models first
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Gemini API Error with ${model}]: Status ${response.status} - ${errorText}`);
        lastError = new Error(`Gemini status ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) continue;

      // Clean any potential markdown fences
      const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[Gemini Request Exception with ${model}]:`, err.message);
      lastError = err;
    }
  }

  console.warn('[Gemini AI Service]: Could not complete generation with API key. Falling back to heuristic questions.', lastError);
  return null;
};

module.exports = { generateQuizWithGemini };
