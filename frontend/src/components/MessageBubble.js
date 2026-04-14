import React, { useState } from 'react';

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

function MessageBubble({ message }) {
  const [showSources, setShowSources] = useState(false);
  const { role, content, sources } = message;

  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">{role === 'assistant' ? '🎓' : '👤'}</div>
      <div className="message-content">
        <div
          className="message-bubble"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
        />
        {sources && sources.length > 0 && (
          <div className="sources-section">
            <button
              className="sources-toggle"
              onClick={() => setShowSources(!showSources)}
            >
              {showSources ? '▼' : '▶'} {sources.length} source
              {sources.length !== 1 ? 's' : ''} referenced
            </button>
            {showSources && (
              <div className="sources-list">
                {sources.map((src, i) => (
                  <div key={i} className="source-card">
                    <span className="source-domain">{src.domain}</span>
                    <span className="source-title">{src.title}</span>
                    <span className="source-score">
                      {(src.score * 100).toFixed(0)}% match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;
