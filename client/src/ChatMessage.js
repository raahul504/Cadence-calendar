// Chat Message Component
// client/src/components/ChatMessage.js

import React from 'react';

function ChatMessage({ message, isUser }) {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`chat-message ${isUser ? 'chat-message-user' : 'chat-message-ai'}`}>
      <div className="chat-message-header">
        <span className="chat-message-sender">
          {isUser ? '👤 You' : '🤖 Cadence'}
        </span>
        <span className="chat-message-time">
          {formatTime(message.created_at || new Date())}
        </span>
      </div>
      <div className="chat-message-content">
        {message.content}
      </div>
    </div>
  );
}

export default ChatMessage;