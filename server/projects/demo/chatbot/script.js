const chatbox = document.getElementById('chatbox');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');

// Simple QnA pairs
const qna = {
  "what is your name?": "I'm a simple chatbot.",
  "hi":"hello",
  "how are you?": "I'm just code, but I'm running fine!",
  "what can you do?": "I can answer simple questions. Try asking about my name or how I work.",
  "who made you?": "I was created by a developer as a demo.",
  "bye": "Goodbye! Have a nice day!"
};

function addMessage(message, sender) {
  const li = document.createElement('li');
  li.className = sender === 'bot' ? 'bot-message' : 'user-message';
  li.textContent = message;
  chatbox.appendChild(li);
  chatbox.scrollTop = chatbox.scrollHeight;
}

chatForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const question = userInput.value.trim();
  if (!question) return;
  addMessage(question, 'user');

  // QnA matching (case-insensitive)
  const answer = qna[question.toLowerCase()] || "Sorry, I don't understand that question.";
  setTimeout(() => addMessage(answer, 'bot'), 400);
  userInput.value = '';
});
