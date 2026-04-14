const fs = require('fs');
const path = require('path');

const KNOWLEDGE_PATH = path.join(__dirname, '..', 'data', 'safe-knowledge.json');

let knowledge = null;
let tfidfIndex = null;

function loadKnowledge() {
  if (knowledge) return knowledge;
  knowledge = JSON.parse(fs.readFileSync(KNOWLEDGE_PATH, 'utf-8'));
  return knowledge;
}

function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .filter((w) => !STOP_WORDS.has(w));
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
  'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'some', 'them',
  'than', 'its', 'over', 'such', 'that', 'this', 'with', 'will', 'each',
  'from', 'they', 'were', 'which', 'their', 'what', 'about', 'would',
  'there', 'could', 'other', 'into', 'more', 'these', 'those', 'then',
  'when', 'where', 'who', 'how', 'also', 'after', 'should', 'well',
  'just', 'being', 'does', 'very',
]);

function buildIndex() {
  if (tfidfIndex) return tfidfIndex;
  const docs = loadKnowledge();

  const docTokens = docs.map((doc) => {
    const text = `${doc.domain} ${doc.title} ${doc.content}`;
    return tokenize(text);
  });

  // Document frequency for each term
  const df = {};
  docTokens.forEach((tokens) => {
    const unique = new Set(tokens);
    unique.forEach((t) => {
      df[t] = (df[t] || 0) + 1;
    });
  });

  const N = docs.length;

  // TF-IDF vectors for each doc
  const vectors = docTokens.map((tokens) => {
    const tf = {};
    tokens.forEach((t) => {
      tf[t] = (tf[t] || 0) + 1;
    });

    const vector = {};
    Object.entries(tf).forEach(([term, count]) => {
      const idf = Math.log(N / (df[term] || 1));
      vector[term] = (count / tokens.length) * idf;
    });
    return vector;
  });

  tfidfIndex = { docs, vectors, df, N };
  return tfidfIndex;
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
  const { docs, vectors, df, N } = buildIndex();
  const queryTokens = tokenize(query);

  // Build query TF-IDF vector
  const qtf = {};
  queryTokens.forEach((t) => {
    qtf[t] = (qtf[t] || 0) + 1;
  });
  const queryVector = {};
  Object.entries(qtf).forEach(([term, count]) => {
    const idf = Math.log(N / (df[term] || 1));
    queryVector[term] = (count / queryTokens.length) * idf;
  });

  // Score each doc
  const scored = docs.map((doc, i) => ({
    id: doc.id,
    domain: doc.domain,
    title: doc.title,
    content: doc.content,
    score: cosineSim(queryVector, vectors[i]),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

module.exports = { search, loadKnowledge };
