import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Assessment from '@/models/Assessment';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDB();
    const decoded = verifyToken(req);
    if (!decoded) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    const { courseId, moduleId, moduleTitle, skillsCovered } = await req.json();
    const user = await User.findById(decoded.id);
    const apiKey = user?.geminiApiKey || process.env.GEMINI_API_KEY;

    let generatedQuiz = null;

    if (apiKey) {
      try {
        const prompt = `Generate a 4-question technical assessment for university module: "${moduleTitle}".
Return valid JSON only:
{
  "title": "On-Demand Mastery Quiz: ${moduleTitle}",
  "description": "Module assessment covering core principles.",
  "skill": "${skillsCovered?.[0] || moduleTitle}",
  "passingScore": 70,
  "timeLimitMinutes": 25,
  "questions": [
    {
      "type": "mcq",
      "question": "question 1",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "why A is correct",
      "points": 25
    },
    {
      "type": "mcq",
      "question": "question 2",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "why B is correct",
      "points": 25
    },
    {
      "type": "conceptual",
      "question": "conceptual explanation question",
      "sampleSolution": "expected keywords",
      "points": 25
    },
    {
      "type": "coding",
      "question": "coding problem",
      "starterCode": "def solve():\\n    pass",
      "sampleSolution": "def solve():\\n    return True",
      "points": 25
    }
  ]
}`;

        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 }
          })
        });

        if (res.ok) {
          const data = await res.json();
          generatedQuiz = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text);
        }
      } catch (e) {
        console.warn('Gemini quiz generation error:', e);
      }
    }

    if (!generatedQuiz) {
      generatedQuiz = {
        title: `Mastery Assessment: ${moduleTitle}`,
        description: `Self-diagnostic assessment targeting fundamentals in ${moduleTitle}.`,
        skill: skillsCovered?.[0] || 'Machine Learning & Systems',
        passingScore: 70,
        timeLimitMinutes: 20,
        questions: [
          {
            type: 'mcq',
            question: `In ${moduleTitle}, what is the primary operational trade-off?`,
            options: [
              'Throughput vs. memory bandwidth limits',
              'Pure disk I/O vs. network latency exclusively',
              'Synchronous execution vs. complete non-determinism',
              'Single precision floats vs. half precision underflow'
            ],
            correctAnswer: 0,
            explanation: 'Throughput versus memory bandwidth is the primary operational bottleneck.',
            points: 25
          },
          {
            type: 'mcq',
            question: `Which algorithmic invariant is fundamental to ${moduleTitle}?`,
            options: [
              'Gradient vanishing prevention through normalized residuals',
              'O(1) random memory access on distributed NVRAM',
              'Strict monotonicity without asymptotic convergence',
              'Deterministic hash collision resolution'
            ],
            correctAnswer: 0,
            explanation: 'Normalized residual connections preserve gradient propagation depth.',
            points: 25
          },
          {
            type: 'conceptual',
            question: `Explain how the underlying mechanics of ${moduleTitle} address architectural bottlenecks in large-scale deployments.`,
            sampleSolution: 'Should highlight distributed caching/matrix parallelization, memory layout cache locality, and asynchronous non-blocking dispatch.',
            points: 25
          },
          {
            type: 'coding',
            question: `Implement a Python utility function 'process_batch(items, threshold)' that filters items strictly above threshold and computes the relative variance.`,
            starterCode: 'def process_batch(items: list[float], threshold: float) -> float:\n    # Implement here\n    pass',
            sampleSolution: 'def process_batch(items, threshold):\n    filtered = [x for x in items if x > threshold]\n    return sum(filtered)',
            points: 25
          }
        ]
      };
    }

    const created = await Assessment.create({
      ...generatedQuiz,
      category: 'module-self-quiz',
      courseId: courseId || null,
      moduleId: moduleId || '',
      createdBy: decoded.id
    });

    const clientPayload = created.toObject();
    clientPayload.questions = clientPayload.questions.map(q => {
      const { correctAnswer, sampleSolution, ...rest } = q;
      return rest;
    });

    return NextResponse.json({
      message: 'Assessment generated dynamically',
      assessment: clientPayload
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
