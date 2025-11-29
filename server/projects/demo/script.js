// script.js

// Select DOM elements
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-box');
const input = document.getElementById('user-input');

// Handle sending message on button click
sendBtn.addEventListener('click', sendMessage);

// Allow pressing "Enter" to send message
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// Function to send user message
function sendMessage() {
  const userText = input.value.trim();
  if (userText === '') return;

  appendMessage('user', userText);
  input.value = '';

  // Simulate a short delay before bot reply
  setTimeout(() => {
    generateReply(userText);
  }, 600);
}

// Function to append a message to chat box
function appendMessage(sender, text) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add(sender === 'user' ? 'user-msg' : 'bot-msg');

  const msgText = document.createElement('div');
  msgText.classList.add('msg-text');
  msgText.textContent = text;

  msgDiv.appendChild(msgText);
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to generate bot reply
function generateReply(userText) {
  let response = '';
  const text = userText.toLowerCase();

  if (text.includes('hello') || text.includes('hi')) {
    response = 'Hey there! 👋 How can I help you today?';
  } else if (text.includes('time')) {
    response = '⏰ The current time is ' + new Date().toLocaleTimeString();
  } else if (text.includes('date')) {
    response = '📅 Today’s date is ' + new Date().toLocaleDateString();
  } else if (text.includes('your name')) {
    response = "I'm your friendly AI chatbot 🤖";
  } else if (text.includes('thank')) {
    response = "You're very welcome! 😊";
  } else {
    response = "I'm not sure about that, but I'm learning every day! 💡";
  }

  appendMessage('bot', response);
}
