import React, { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

function ChatInterface({ messages, onSend, loading }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const quickQuestions = [
    'What is PI Planning?',
    'How is the exam structured?',
    'Explain WSJF',
    'What are the SAFe Core Values?',
    'Give me a practice question',
  ];

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">🎓</div>
            <div className="message-content">
              <div className="message-bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 1 && (
        <div className="quick-questions">
          {quickQuestions.map((q, i) => (
            <button key={i} onClick={() => onSend(q)} disabled={loading}>
              {q}
            </button>
          ))}
        </div>
      )}

      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about SAFe Practitioner 6.0 certification..."
          disabled={loading}
        />
        <button type="submit" disabled={!input.trim() || loading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatInterface;
