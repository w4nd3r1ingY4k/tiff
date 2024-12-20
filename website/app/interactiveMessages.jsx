'use client';

import React, { useState } from 'react';
import Card from '@components/Card';
import TextArea from '@components/TextArea';
import MessageViewer from '@root/components/MessageViewer';
import Message from '@components/Message';
import Button from '@components/Button';

function InteractiveMessages() {
  // messages: array of { text: string, from: 'user' | 'server' }
  const [messages, setMessages] = useState([]);

  const [inputMessage, setInputMessage] = useState('');
  const [serverResponse, setServerResponse] = useState(null);

  const handleSend = async () => {
    if (inputMessage.trim() === '') return;

    // Add the user message
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: inputMessage, from: 'user' },
    ]);

    try {
      const response = await fetch('http://localhost:10001/process-context', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message to the server.');
      }

      const data = await response.json();
      setServerResponse(data.result);

      // Add the server response
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: data.result, from: 'server' },
      ]);
    } catch (error) {
      console.error('Error sending message to server:', error);
    }

    setInputMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Display Messages */}
      <div style={{ overflowY: 'auto', maxHeight: '60vh' }}>
      <Message autoPlay>
        <TextArea readOnly={true} autoPlay="Hi there! I’m Tiff, your personal assistant designed to make life a little easier. Think of me as your extra pair of hands for handling tasks, navigating platforms, and getting things done. Need to create an account, post a listing, or manage your online presence? I’ve got it covered! I break down your requests into simple steps and handle them efficiently, so you can focus on what matters most. Let’s get started—just tell me what you need, and I’ll take care of the rest!" autoPlaySpeedMS={5} />
      </Message>
        {messages.map((msg, index) => {
          if (msg.from === 'user') {
            return (
              <MessageViewer key={index} style={{ marginBottom: '0.5rem' }}>
                {msg.text}
              </MessageViewer>
            );
          } else {
            return (
              <Message key={index} style={{ marginBottom: '0.5rem' }}>
                 <TextArea readOnly={true} autoPlay={msg.text} autoPlaySpeedMS={5} />
              </Message>
            );
          }
        })}
      </div>

      {/* Input and Send Button */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ minWidth: 1350 }}>
          <Card style={{ flex: 1 }}>
            <TextArea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              autoPlay={false}
            />
          </Card>
        </div>
        <div>
          <Button onClick={handleSend}>
            <div style={{ height: 10 }} />Send<div style={{ height: 10 }} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InteractiveMessages;