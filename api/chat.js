const { GoogleGenerativeAI } = require('@google/generative-ai');

const knowledge = require('../backend/data/safe-knowledge.json');

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'some', 'them',
  'than', 'its', 'over', 'such', 'that', 'this', 'with', 'will', 'each',
  'from', 'they', 'were', 'which', 'their', 'what', 'about', 'would',
  'there', 'could', 'other', 'into', 'more', 'these', 'those', 'then',
  'when', 'where', 'who', 'how', 'also', 'after', 'should', 'well',
  'just', 'being', 'does', 'very',
]);

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter((w) => !STOP_WORDS.has(w));
}

let cachedIndex = null;

function buildIndex() {
  if (cachedIndex) return cachedIndex;
  const docTokens = knowledge.map((doc) =>
    tokenize(`${doc.domain} ${doc.title} ${doc.content}`)
  );
  const df = {};
  docTokens.forEach((tokens) => {
    new Set(tokens).forEach((t) => { df[t] = (df[t] || 0) + 1; });
  });
  const N = knowledge.length;
  const vectors = docTokens.map((tokens) => {
    const tf = {};
    tokens.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
    const vector = {};
    Object.entries(tf).forEach(([term, count]) => {
      vector[term] = (count / tokens.length) * Math.log(N / (df[term] || 1));
    });
    return vector;
  });
  cachedIndex = { vectors, df, N };
  return cachedIndex;
}

function cosineSim(a, b) {
  let dot = 0, normA = 0, normB = 0;
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  allKeys.forEach((k) => {
    const va = a[k] || 0;
    const vb = b[k] || 0;
    dot += va * vb;
    normA += va * va;
    normB += vb * vb;
  });
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function search(query, topK = 5) {
  const { vectors, df, N } = buildIndex();
  const queryTokens = tokenize(query);
  const qtf = {};
  queryTokens.forEach((t) => { qtf[t] = (qtf[t] || 0) + 1; });
  const queryVector = {};
  Object.entries(qtf).forEach(([term, count]) => {
    queryVector[term] = (count / queryTokens.length) * Math.log(N / (df[term] || 1));
  });
  const scored = knowledge.map((doc, i) => ({
    id: doc.id,
    domain: doc.domain,
    title: doc.title,
    content: doc.content,
    score: cosineSim(queryVector, vectors[i]),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

const SYSTEM_PROMPT = `You are a SAFe Practitioner 6.0 Certification Study Assistant. Your role is to help aspiring SAFe Practitioners prepare for and pass the SP 6.0 exam.

INSTRUCTIONS:
- Answer questions based ONLY on the provided context documents.
- If the context doesn't contain enough information, say so honestly.
- When relevant, mention which exam domain the topic falls under and its weighting.
- Provide practical exam tips when appropriate.
- Use clear, concise language. Format answers with bullet points or numbered lists when helpful.
- If asked a practice question, create a realistic multiple-choice question with 4 options, reveal the correct answer, and explain WHY it's correct referencing SAFe concepts.

EXAM QUICK FACTS:
- 45 questions, 90 minutes, 80% passing score (36/45 correct)
- Closed book, web-based, multiple-choice single-select
- 7 domains with varying weights (Plan the Work is heaviest at 21-25%)`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question, chatHistory } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const relevantDocs = search(question.trim(), 5);

    const context = relevantDocs
      .map((doc) => `[Domain: ${doc.domain}] ${doc.title}\n${doc.content}`)
      .join('\n\n---\n\n');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    });

    const chatMessages = (chatHistory || []).slice(-10).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: chatMessages });
    const prompt = `Context documents:\n\n${context}\n\n---\n\nUser question: ${question}`;
    const result = await chat.sendMessage(prompt);
    const response = result.response;

    res.json({
      answer: response.text(),
      sources: relevantDocs.map(({ content, ...rest }) => rest),
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to process question' });
  }
};
