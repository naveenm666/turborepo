'use client'
import React, { useState, useEffect } from 'react';
import { CoreMessage } from 'ai';
import { continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';
import MessageList from '@/components/MessageList';
import MessageInputForm from '@/components/MessageInputForm';
import { useSession, signIn, signOut } from 'next-auth/react';
import axios from 'axios';

export default function Chat() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      signIn(); // Redirects to the sign-in page if not authenticated
    }
  }, [status]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isSpeechRecognitionSupported =
        'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

      if (isSpeechRecognitionSupported) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.onstart = () => setIsListening(true);
        recognitionInstance.onend = () => setIsListening(false);
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };

        setRecognition(recognitionInstance);

        return () => {
          recognitionInstance.stop();
        };
      }
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newMessages: CoreMessage[] = [
      ...messages,
      { content: input, role: 'user' },
    ];

    setMessages(newMessages);
    setInput('');

    try {
      const response = await axios.post('http://localhost:3001/api/query', { query: input });
      setMessages([
        ...newMessages,
        { role: 'assistant', content: response.data.answer },
      ]);

      // if (response.data.matches.length > 0) {
      //   setMessages([
      //     ...newMessages,
      //     { role: 'assistant', content: `Found ${response.data.answer} matching documents.` },
      //   ]);
      // }
    } catch (error) {
      console.error('Error during conversation:', error);
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Error processing your query. Please try again later.' },
      ]);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post('http://localhost:3001/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setMessages([
        ...messages,
        { content: `File ${file.name} uploaded and processed successfully`, role: 'system' },
      ]);
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessages([
        ...messages,
        { content: `Error uploading file ${file.name}`, role: 'system' },
      ]);
    }
  };

  const userName = session?.user?.name;
  const userProfileImage = session?.user?.image || 'https://example.com/default-profile.png';
  const lastName = userName?.split(' ').slice(-1).join(' ') || 'User'; // Extract last name

  return (
    <div className="flex flex-col w-full max-w-md h-screen mx-auto bg-gray-50">
      {session ? (
        <>
          <header className="p-4 bg-green-500 text-white">
            <h1 className="text-xl font-bold">Welcome, {lastName}!</h1>
            <button
              onClick={() => signOut()}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded-md"
            >
              Logout
            </button>
          </header>
          <MessageList
            messages={messages}
            userName={lastName} // Pass the last name
            userProfileImage={userProfileImage} // Pass the user profile image URL
          />
          <MessageInputForm
            input={input}
            setInput={setInput}
            isListening={isListening}
            startListening={startListening}
            stopListening={stopListening}
            onSubmit={handleSubmit}
            onFileUpload={handleFileUpload}
          />
        </>
      ) : (
        <p>Please sign in to access the chat.</p>
      )}
    </div>
  );
}
