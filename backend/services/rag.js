const { GoogleGenerativeAI } = require('@google/generative-ai');
const { search } = require('./tfidfSearch');

const SYSTEM_PROMPT = `You are a SAFe Practitioner 6.0 Certification Study Assistant. Your role is to help aspiring SAFe Practitioners prepare for and pass the SP 6.0 exam.

INSTRUCTIONS:
- Answer questions based ONLY on the provided context documents.
- If the context doesn't contain enough information, say so honestly.
- When relevant, mention which exam domain the topic falls under and its weighting.
- Provide practical exam tips when appropriate (e.g., "This topic is worth 21-25% of the exam, so study it thoroughly").
- Use clear, concise language. Format answers with bullet points or numbered lists when helpful.
- If asked a practice question, create a realistic multiple-choice question with 4 options, reveal the correct answer, and explain WHY it's correct referencing SAFe concepts.
- Always encourage the user and remind them that consistent study leads to success.

EXAM QUICK FACTS:
- 45 questions, 90 minutes, 80% passing score (36/45 correct)
- Closed book, web-based, multiple-choice single-select
- 7 domains with varying weights (Plan the Work is heaviest at 21-25%)`;

async function askQuestion(question, chatHistory = []) {
  const relevantDocs = search(question, 5);

  const context = relevantDocs
    .map(
      (doc) =>
        `[Domain: ${doc.domain}] ${doc.title}\n${doc.content}`
    )
    .join('\n\n---\n\n');

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
  });

  const chatMessages = chatHistory.slice(-10).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history: chatMessages });

  const prompt = `Context documents:\n\n${context}\n\n---\n\nUser question: ${question}`;
  const result = await chat.sendMessage(prompt);
  const response = result.response;

  return {
    answer: response.text(),
    sources: relevantDocs.map((doc) => ({
      id: doc.id,
      domain: doc.domain,
      title: doc.title,
      score: doc.score,
    })),
  };
}

module.exports = { askQuestion };
