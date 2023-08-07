"use client";
import { v4 as uuidv4 } from 'uuid';
import {useState,useEffect} from 'react';

export default function Home() {

  const [streamedData,setStreamedData] = useState({});
  const [promptValue, setPromptValue] = useState("");
  const [isInputDisabled, setInputDisabled] = useState(false);
  const [placeholderValue,setPlaceholderValue] = useState('Send a Message');
  
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    //Taking Form updated data
    const formData = new FormData(e.currentTarget);
    const userMessage = formData.get('prompt');
    let animationFlag = true;
    setInputDisabled(true);
    setPromptValue('');

    const startTypingAnimation = async () => {
      while (animationFlag) {
        setPlaceholderValue('.');
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!animationFlag){
          setPlaceholderValue('Send a Message');
          break;
        } 
        
        setPlaceholderValue('. .');
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!animationFlag){
          setPlaceholderValue('Send a Message');
          break;
        } 
        
        setPlaceholderValue('. . .');
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!animationFlag){
          setPlaceholderValue('Send a Message');
          break;
        } 
      }
    };

    //Thinking animation is Activate
    startTypingAnimation();

    // Generate a unique identifier for the new message
    const userMessageID = uuidv4();
    const aiMessageID = uuidv4();

    // Add user's input to messages object
    setStreamedData((prevMessages) => ({...prevMessages,[userMessageID]: { type: 'user', text: userMessage }}));

    const response = await fetch('api/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: userMessage }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    //get response from AI
    const reader = response.body.getReader();
    let receivedMessage = '';

    while(true){
      const {done,value} = await reader.read();

      if(done){
        break;
      }
      
      const text = new TextDecoder().decode(value);
      receivedMessage+=text;
      
      // Add AI's response to messages object
      setStreamedData((prevMessages) => ({...prevMessages,[aiMessageID]: { type: 'ai', text: receivedMessage}}));
    }
    
    setInputDisabled(false);
    animationFlag = false;
    setPlaceholderValue('Send a Message');
  };

  const handleClearChat = () => {
    setStreamedData({});
    setInputDisabled(false);
    setPlaceholderValue('Send a Message');
  }
 
  return (
    <main className="flex max-w-6xl mx-auto item-center justify-center p-24">
      <div className='flex flex-col gap-12'>
      <h1 className="text-gray-200 font-extrabold text-5xl text-center">
        AI Chat Assistant       
      </h1> 
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
      <form onSubmit={handleChatSubmit}>
        <input className='py-2 px-4 rounded-md bg-gray-600 text-white w-full'
        placeholder={placeholderValue}
        name='prompt'
        value={promptValue}
        onChange={(e)=>setPromptValue(e.target.value)}
        required
        disabled={isInputDisabled}
        ></input>

      <div className='flex justify-center gap-4 py-4'>
      {!isInputDisabled && (
      <button 
      type="submit"
      className="py-2 px-4 rounded-md text-sm bg-lime-700 text-white hover:opacity-80 transition-opacity"
      >
        Send Chat
      </button>
      )}
      <button
      type="button"
      onClick={handleClearChat}
      disabled={isInputDisabled}
      className="py-2 px-4 rounded-md text-sm bg-red-700 text-white hover:opacity-80 transition-opacity"
      >
        Clear Chat
      </button>

      </div>
      </form>   
      </div>
      
    </main>
  )
}
