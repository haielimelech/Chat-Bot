"use client";
import { v4 as uuidv4 } from 'uuid';
import {useState,useEffect} from 'react';

export default function Home() {

  const [streamedData,setStreamedData] = useState({});
  const [promptValue, setPromptValue] = useState("");
  const [isInputDisabled, setInputDisabled] = useState(false);
  const [placeholderValue,setPlaceholderValue] = useState('מה תרצה לשאול?');
  const [showTooltip, setShowTooltip] = useState(false);
  
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
          setPlaceholderValue('מה תרצה לשאול?');
          break;
        } 
        
        setPlaceholderValue('. .');
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!animationFlag){
          setPlaceholderValue('מה תרצה לשאול?');
          break;
        } 
        
        setPlaceholderValue('. . .');
        await new Promise((resolve) => setTimeout(resolve, 500));
        if (!animationFlag){
          setPlaceholderValue('מה תרצה לשאול?');
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

      //const {done,value} = await reader.read();
      const text = new TextDecoder().decode(value);
      receivedMessage+=text;
      
      // Add AI's response to messages object
      setStreamedData((prevMessages) => ({...prevMessages,[aiMessageID]: { type: 'ai', text: receivedMessage}}));
    }
    
    setInputDisabled(false);
    animationFlag = false;
    setPlaceholderValue('מה תרצה לשאול?');
  };

  const handleClearChat = () => {
    setStreamedData({});
    setInputDisabled(false);
    setPlaceholderValue('מה תרצה לשאול?');
  }
 
  return (
    <div className="flex flex-col min-h-screen">
    <main className="flex max-w-6xl mx-auto item-center justify-center p-24">
      <div className='logo'>
      <a href="https://tevel-campers.co.il/">
          <img src="https://i.ibb.co/whkBFkN/logo.jpg" alt="Logo"/>
          </a>
        </div>
      
      <div className='flex flex-col gap-12'>
      
        <h1 className="text-[#963B45] font-extrabold text-5xl text-center">
          AI Chat Assistant 🚍🌍 
        </h1>
    
        {Object.keys(streamedData).map((messageId) => {
          const message = streamedData[messageId];
          return (
            <div key={messageId}>
              <h3 dir="rtl"
                className={`text-2xl ${message.type === 'user' ? 'text-[#FFAC00]' : 'text-[#FFAC00]'}`}>
                {message.type === 'user' ? 'You' : 'AI Assistant'}
              </h3>
              <p
                className={`text-gray-200 rounded-md bg-[#563532] p-4 ${
                  message.type === 'user' ? 'bg-[#563532]' : ''
                }`}
                dir="rtl"
              >
                {message.text}
              </p>
            </div>
          );
        })}
        <form onSubmit={handleChatSubmit}>
          <div style={{ position: 'relative' }}>
            <input
              className='py-2 px-4 rounded-md bg-[#854E49] text-white w-full'
              placeholder={placeholderValue}
              name='prompt'
              dir="rtl"
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              required
              disabled={isInputDisabled}
            />
          <div className='flex justify-center gap-3 py-5'>
          <div
              className="tooltip-icon"
              title="Tip"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <span 
              className="text-white flex justify-center text-2xl">
              &#x1F4A1;
              </span>
          </div>
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
            {showTooltip && (
                <div className="text-[854E49] flex justify-center gap-4 py-4 ">
                  נסה/י להיות יותר ספציפי בשאלה שלך כדי לקבל תשובה טובה יותר
                </div>
              )}
            </div>
        </form>
      </div>
    </main>
      {/* <a href='https://www.linkedin.com/in/hai-elimelech-b18326213/' className="copyright">
        © Hai Elimelech
      </a> */}
    
  </div>
  );
}
