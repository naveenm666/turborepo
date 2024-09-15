'use client'
import React, { useState, useEffect } from 'react';
import { CoreMessage } from 'ai';
import { continueConversation } from './actions';
import { readStreamableValue } from 'ai/rsc';
import MessageList from '@/components/MessageList';
import MessageInputForm from '@/components/MessageInputForm';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Chat() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState('');
  const [data, setData] = useState<any>();
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
      const result = await continueConversation(newMessages);
      setData(result.data);

      for await (const content of readStreamableValue(result.message)) {
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: content as string,
          },
        ]);
      }
    } catch (error) {
      console.error('Error during conversation:', error);
      // Handle error appropriately (e.g., show a message to the user)
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
          />
        </>
      ) : (
        <p>Please sign in to access the chat.</p>
      )}
    </div>
  );
}
