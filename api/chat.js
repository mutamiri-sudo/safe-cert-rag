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

const domainWeights = {
  'Introducing SAFe': '6-12%',
  'Forming Agile Teams as Trains': '15-21%',
  'Connect to the Customer': '9-14%',
  'Plan the Work': '21-25%',
  'Deliver Value': '13-18%',
  'Get Feedback': '6-12%',
  'Improve Relentlessly': '13-18%',
};

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const results = search(question.trim(), 5);

    if (!results.length || results[0].score < 0.01) {
      return res.json({
        answer: "I couldn't find a strong match for that question. Try asking about PI Planning, WSJF, ART roles, Scrum, Kanban, or exam domains.",
        sources: [],
      });
    }

    const top = results[0];
    const supporting = results.slice(1).filter((r) => r.score > 0.03);

    let answer = `**${top.title}**\n*(Exam Domain: ${top.domain})*\n\n${top.content}`;

    if (supporting.length > 0) {
      answer += '\n\n---\n\n**Related topics you should also study:**\n';
      supporting.forEach((doc) => {
        answer += `\n- **${doc.title}** *(${doc.domain})*: ${doc.content.substring(0, 150)}...`;
      });
    }

    const weight = domainWeights[top.domain];
    if (weight) {
      answer += `\n\n**Exam Tip:** This topic falls under the *${top.domain}* domain, which accounts for **${weight}** of the exam.`;
      if (weight === '21-25%') {
        answer += ' This is the **highest-weighted domain** — study it thoroughly!';
      } else if (weight === '15-21%' || weight === '13-18%') {
        answer += ' This is a heavily-weighted domain — make sure you know it well.';
      }
    }

    res.json({
      answer,
      sources: results.map(({ content, ...rest }) => rest),
    });
  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: 'Failed to process question' });
  }
};
