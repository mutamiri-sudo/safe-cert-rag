const { search } = require('./tfidfSearch');

function formatAnswer(question, results) {
  if (!results.length || results[0].score < 0.01) {
    return {
      answer:
        "I couldn't find a strong match for that question in the SAFe 6.0 knowledge base. Try rephrasing or ask about a specific topic like PI Planning, WSJF, ART roles, or exam domains.",
      sources: [],
    };
  }

  const topResult = results[0];
  const supporting = results.slice(1).filter((r) => r.score > 0.03);

  let answer = `**${topResult.title}**\n*(Exam Domain: ${topResult.domain})*\n\n${topResult.content}`;

  if (supporting.length > 0) {
    answer += '\n\n---\n\n**Related topics you should also study:**\n';
    supporting.forEach((doc) => {
      answer += `\n- **${doc.title}** *(${doc.domain})*: ${doc.content.substring(0, 150)}...`;
    });
  }

  // Add exam tip based on domain
  const domainWeights = {
    'Introducing SAFe': '6-12%',
    'Forming Agile Teams as Trains': '15-21%',
    'Connect to the Customer': '9-14%',
    'Plan the Work': '21-25%',
    'Deliver Value': '13-18%',
    'Get Feedback': '6-12%',
    'Improve Relentlessly': '13-18%',
    'Exam Info': null,
  };

  const weight = domainWeights[topResult.domain];
  if (weight) {
    answer += `\n\n**Exam Tip:** This topic falls under the *${topResult.domain}* domain, which accounts for **${weight}** of the exam.`;
    if (weight === '21-25%') {
      answer += ' This is the **highest-weighted domain** — study it thoroughly!';
    } else if (weight === '15-21%' || weight === '13-18%') {
      answer += ' This is a heavily-weighted domain — make sure you know it well.';
    }
  }

  return {
    answer,
    sources: results.map((doc) => ({
      id: doc.id,
      domain: doc.domain,
      title: doc.title,
      score: doc.score,
    })),
  };
}

async function askQuestion(question) {
  const results = search(question, 5);
  return formatAnswer(question, results);
}

module.exports = { askQuestion };
