import React from 'react';

const domainIcons = {
  'Introducing SAFe': '📘',
  'Forming Agile Teams as Trains': '🚂',
  'Connect to the Customer': '🤝',
  'Plan the Work': '📋',
  'Deliver Value': '🚀',
  'Get Feedback': '💬',
  'Improve Relentlessly': '📈',
};

function DomainSidebar({ domains, onDomainClick }) {
  return (
    <aside className="sidebar">
      <h3>Exam Domains</h3>
      <div className="domain-list">
        {domains.map((d, i) => (
          <button
            key={i}
            className="domain-card"
            onClick={() => onDomainClick(d)}
          >
            <span className="domain-icon">{domainIcons[d.name] || '📄'}</span>
            <div className="domain-info">
              <span className="domain-name">{d.name}</span>
              <span className="domain-weight">{d.weight}</span>
            </div>
          </button>
        ))}
      </div>
      <div className="sidebar-footer">
        <div className="exam-quick-facts">
          <h4>Exam Quick Facts</h4>
          <ul>
            <li>45 questions</li>
            <li>90 minutes</li>
            <li>80% to pass (36/45)</li>
            <li>Closed book</li>
            <li>2 free attempts</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}

export default DomainSidebar;
