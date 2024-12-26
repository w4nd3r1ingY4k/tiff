'use client';

import React, { useState } from 'react';
import Card from '@components/Card';
import TextArea from '@components/TextArea';
import MessageViewer from '@root/components/MessageViewer';
import Message from '@components/Message';
import Button from '@components/Button';

function InteractiveMessages() {
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
  
      console.log('Full response data:', data);
  
      // Parse the string in `result` into a JSON object
      const parsedResult = JSON.parse(data.result);
      console.log('Parsed result:', parsedResult);
  
      const struct = parsedResult?.tasks?.[0]?.params?.struct || 'No struct available';
      console.log('Struct field:', struct);
  
      // Add the server response to the message list
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: struct, from: 'server' },
      ]);
  
      // Check if the struct response is "create_depop"
      if (struct === 'create_depop') {
        console.log('Triggering headless test for create_depop...');
  
        // Send a request to the headless-test endpoint
        const headlessResponse = await fetch('http://localhost:10001/headless-test', {
          method: 'POST',
        });
  
        if (!headlessResponse.ok) {
          throw new Error('Failed to execute headless test.');
        }
  
        const headlessData = await headlessResponse.json();
        console.log('Headless test response:', headlessData);
  
        // Add the headless test result to the message list
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: `Headless Test: ${headlessData.message}`, from: 'server' },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
  
      // Add error feedback to the message list
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: 'Error: Unable to process your request.', from: 'server' },
      ]);
    }
  
    setInputMessage('');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Full viewport height
        maxHeight: '100vh',
      }}
    >
      {/* Display Messages */}
      <div
        style={{
          overflowY: 'auto',
          flexGrow: 1,
          padding: '1rem',
          background: '#f9f9f9',
          borderRadius: '8px',
        }}
      >
        <Message autoPlay>
          <TextArea
            readOnly
            autoPlay="Hi there! I’m Tiff, your personal assistant designed to make life a little easier. Think of me as your extra pair of hands for handling tasks, navigating platforms, and getting things done. Need to create an account, post a listing, or manage your online presence? I’ve got it covered! I break down your requests into simple steps and handle them efficiently, so you can focus on what matters most. Let’s get started—just tell me what you need, and I’ll take care of the rest!"
            autoPlaySpeedMS={5}
          />
        </Message>
        {messages.map((msg, index) => (
          msg.from === 'user' ? (
            <MessageViewer key={index} style={{ marginBottom: '0.5rem' }}>
              {msg.text}
            </MessageViewer>
          ) : (
            <Message key={index} style={{ marginBottom: '0.5rem' }}>
              <TextArea
                readOnly
                autoPlay={msg.text}
                autoPlaySpeedMS={5}
              />
            </Message>
          )
        ))}
      </div>

      {/* Input and Send Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          borderTop: '1px solid #ddd',
          background: '#fff',
          position: 'sticky', // Keeps it visible at the bottom
          bottom: 0,
        }}
      >
        <Card style={{ flexGrow: 1 }}>
          <TextArea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            style={{ width: '100%', resize: 'none', padding: '0.5rem' }}
          />
        </Card>
        <Button
          onClick={handleSend}
          style={{
            width: '10%',
            flexShrink: 0,
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default InteractiveMessages;