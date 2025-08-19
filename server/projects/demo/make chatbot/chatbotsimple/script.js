document.getElementById('send-btn').onclick = function() {
  var input = document.getElementById('user-input');
  var message = input.value.trim();
  if (message) {
    var chatBody = document.getElementById('chat-body');
    var userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.textContent = message;
    chatBody.appendChild(userDiv);
    input.value = '';
    // Simple bot reply
    setTimeout(function() {
      var botDiv = document.createElement('div');
      botDiv.className = 'bot-message';
      botDiv.textContent = "You said: " + message;
      chatBody.appendChild(botDiv);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 500);
    chatBody.scrollTop = chatBody.scrollHeight;
  }
};
