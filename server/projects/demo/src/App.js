import React from 'react';
import ChatBot from 'react-simple-chatbot';

const steps = [
  {
    id: '0',
    message: 'Hello! How can I help you today?',
    end: true,
  },
];

function App() {
  return (
    <div className="App">
      <h1>Welcome to the React Chatbot</h1>
      <ChatBot steps={steps} />
    </div>
  );
}

export default App;
