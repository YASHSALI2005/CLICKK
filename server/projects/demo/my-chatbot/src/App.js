import ChatBot from 'react-simple-chatbot';

     const steps = [
       { id: '0', message: 'Hello! How can I help you?', end: true }
     ];

     function App() {
       return (
         <div className="App">
           <h1>Welcome to My Chatbot</h1>
           <ChatBot steps={steps} />
         </div>
       );
     }

     export default App;