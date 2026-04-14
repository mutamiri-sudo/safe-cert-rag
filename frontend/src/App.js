import React, { useState, useEffect } from 'react';
import ChatInterface from './components/ChatInterface';
import DomainSidebar from './components/DomainSidebar';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api'
    : '/api');

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Welcome to the **SAFe Practitioner 6.0 Certification Study Assistant**!\n\nI'm here to help you prepare for and pass the SP 6.0 exam. Ask me anything about:\n\n- **Exam format** (45 questions, 90 min, 80% to pass)\n- **7 exam domains** and what to study\n- **SAFe concepts** like PI Planning, ARTs, Scrum, Kanban\n- **Practice questions** and explanations\n- **Study strategies** and tips\n\nWhat would you like to know?",
      sources: [],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/domains`)
      .then((res) => res.json())
      .then(setDomains)
      .catch(() => {});
  }, []);

  const sendMessage = async (question) => {
    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const chatHistory = messages
        .filter((m) => !m.sources)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, chatHistory }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error: ${err.message}. Make sure the backend is running on port 3001.`,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDomainClick = (domain) => {
    sendMessage(
      `Tell me about the "${domain.name}" exam domain (${domain.weight} of the exam). What are the key topics I should study?`
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>SAFe Practitioner 6.0</h1>
          <p>Certification Study Assistant</p>
        </div>
        <div className="header-badge">RAG-Powered AI</div>
      </header>
      <div className="app-body">
        <DomainSidebar domains={domains} onDomainClick={handleDomainClick} />
        <ChatInterface
          messages={messages}
          onSend={sendMessage}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;
