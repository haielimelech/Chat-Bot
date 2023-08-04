"use client";
import { v4 as uuidv4 } from 'uuid';
import {useState} from 'react';

export default function Home() {

  const [streamedData,setStreamedData] = useState({});
  const [promptValue, setPromptValue] = useState("");

  const handleChatSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const userMessage = formData.get('prompt');
    setPromptValue('');

    // Generate a unique identifier for the new message
    const messageId = uuidv4();

    // Add user's input to messages object
    setStreamedData((prevMessages) => ({
      ...prevMessages,
      [messageId]: { type: 'user', text: userMessage },
    }));

    const response = await fetch('api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: userMessage }),
      headers: { 'Content-Type': 'application/json' },
    });

    const reader = response.body.getReader();
    let receivedMessage = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      const text = new TextDecoder().decode(value);
      receivedMessage += text;
    }

    // Add AI's response to messages object
    setStreamedData((prevMessages) => ({
      ...prevMessages,
      [uuidv4()]: { type: 'ai', text: receivedMessage },
    }));
    console.log(setStreamedData);
  };


  
  const handleClearChat = () => {
    setStreamedData({});
  }
 
  return (
    <main className="flex max-w-6xl mx-auto item-center justify-center p-24">
      <div className='flex flex-col gap-12'>
      <h1 className="text-gray-200 font-extrabold text-5xl text-center">
        Chat Demo 🦜🔗
      </h1>

      <form onSubmit={handleChatSubmit}>
        <input className='py-2 px-4 rounded-md bg-gray-600 text-white w-full'
        placeholder='Enter Prompt'
        name='prompt'
        value={promptValue}
        onChange={(e)=>setPromptValue(e.target.value)}
        required
        ></input>

      <div className='flex justify-center gap-4 py-4'>
      <button 
      type="submit"
      className="py-2 px-4 rounded-md text-sm bg-lime-700 text-white hover:opacity-80 transition-opacity"
      >
        Send Chat
      </button>

      <button 
      type="button"
      onClick={handleClearChat}
      className="py-2 px-4 rounded-md text-sm bg-red-700 text-white hover:opacity-80 transition-opacity"
      >
        Clear Chat
      </button>

      </div>
      </form>
    
      {Object.keys(streamedData).map((messageId) => {
          const message = streamedData[messageId];
          return (
            <div key={messageId}>
              <h3 className={`text-2xl ${message.type === 'user' ? 'text-blue-500' : 'text-gray-400'}`}>
                {message.type === 'user' ? 'You' : 'AI Assistant'}
              </h3>
              <p
                className={`text-gray-200 rounded-md bg-gray-700 p-4 ${
                  message.type === 'user' ? 'bg-blue-500' : ''
                }`}
              >
                {message.text}
              </p>
            </div>
          );
        })}
       
      </div>
      
    </main>
  )
}
