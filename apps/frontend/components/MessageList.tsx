import React, { useRef, useEffect } from 'react';
import { CoreMessage } from 'ai';

interface MessageListProps {
  messages: CoreMessage[];
  userName: string;
  userProfileImage: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, userName, userProfileImage }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-white border-t border-gray-300 rounded-t-lg shadow-md">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <img className='w-20 h-20 mb-2' src='https://n8n.io/_nuxt/image/928f9a.svg' alt="Welcome Icon" />
          <p>How can I help you today?</p>
        </div>
      ) : (
        messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start p-3 mb-2 rounded-lg ${
              m.role === 'user'
                ? 'bg-blue-500 text-white self-end'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {m.role === 'user' && (
              <img
                src={userProfileImage}
                alt="User"
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            {m.role !== 'user' && (
              <img
                src="https://preview.redd.it/f8fchc9lepx51.jpg?auto=webp&s=17d0cbdb13ac08582b84c41167697859712cfa5b"
                alt="AI"
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <div>
              <strong>{m.role === 'user' ? userName : 'AI'}:</strong> {m.content as string}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
