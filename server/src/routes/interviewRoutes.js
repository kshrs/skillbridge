import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Evaluate student response using Google Gemini 2.5 Flash / Flash Lite (or rule-based fallback if no key)
router.post('/evaluate', protect, async (req, res) => {
  try {
    const { question, userAnswer, type, rubric, title, level, module } = req.body;
    
    // Check if user has configured custom Gemini API key or server has default
    const user = await User.findById(req.user._id);
    const apiKey = user.geminiApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Intelligent rule-based evaluation fallback when no API key configured yet
      const wordCount = (userAnswer || '').trim().split(/\s+/).filter(Boolean).length;
      let score = 75;
      let feedback = 'Good attempt! Add your Gemini API Key in the Profile tab to enable automated neural AI grading and targeted critique.';

      if (wordCount < 10) {
        score = 45;
        feedback = 'Response is very brief. Provide more technical depth and mention core mechanics.';
      } else if (wordCount > 35) {
        score = 88;
        feedback = 'Comprehensive response covering key technical aspects.';
      }

      return res.json({
        success: true,
        modelUsed: 'heuristic-evaluator',
        score,
        verdict: score >= 70 ? 'Satisfactory' : 'Needs Work',
        feedback,
        improvements: [
          'Add your Google Gemini API key in Profile to unlock full AI evaluations.',
          'Consider detailing underlying hardware and memory bandwidth considerations.'
        ]
      });
    }

    // Call Gemini 2.5 Flash / Flash Lite API
    const prompt = `You are a Principal AI / Machine Learning Interviewer at a top tech company evaluating a candidate's response to an interview question.
Target Track: ${module} (${level} Level)
Question: ${question}
Expected Rubric / Key points: ${rubric || 'Evaluate technical accuracy, clarity, and depth.'}
Candidate's Answer:
"""${userAnswer}"""

Provide your assessment in strictly valid JSON format with keys:
- score: integer between 0 and 100
- verdict: string ("Strong Pass", "Pass", "Borderline", or "Needs Improvement")
- feedback: string containing 2-3 sentences of direct feedback
- strengths: array of 1-2 points done well
- improvements: array of 1-2 concrete missing details or corrections

JSON response only:`;

    // Attempt Gemini 2.5 Flash or Flash-lite endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Gemini API call failed, attempting gemini-2.5-flash-lite fallback:', errText);

      // Fallback to flash-lite
      const liteEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`;
      const liteRes = await fetch(liteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
        })
      });

      if (!liteRes.ok) {
        throw new Error(`Gemini evaluation error: ${liteRes.statusText}`);
      }

      const liteData = await liteRes.json();
      const rawJson = liteData.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(rawJson);
      return res.json({ success: true, modelUsed: 'gemini-2.5-flash-lite', ...parsed });
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = JSON.parse(rawJson);

    res.json({
      success: true,
      modelUsed: 'gemini-2.5-flash',
      ...parsed
    });
  } catch (err) {
    console.error('AI Eval Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
