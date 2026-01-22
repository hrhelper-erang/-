
import React from 'react';
import { Message } from '../types';
import { SHEEP_AVATAR, USER_AVATAR } from '../constants';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex w-full mb-6 ${isAssistant ? 'justify-start' : 'justify-end animate-in fade-in slide-in-from-right-4 duration-300'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 mt-1 ${isAssistant ? 'mr-3' : 'ml-3'}`}>
          {isAssistant ? SHEEP_AVATAR : USER_AVATAR}
        </div>
        
        <div className="flex flex-col">
          <span className={`text-xs text-gray-500 mb-1 px-1 ${isAssistant ? 'text-left' : 'text-right'}`}>
            {isAssistant ? '양띠 노무사' : '상담인'} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div 
            className={`
              p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap
              ${isAssistant 
                ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none' 
                : 'bg-orange-500 text-white rounded-tr-none'
              }
            `}
          >
            {message.content}
          </div>
          
          {isAssistant && (
            <div className="mt-2 flex gap-2">
              <button 
                onClick={() => navigator.clipboard.writeText(message.content)}
                className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-wider"
              >
                <i className="fas fa-copy mr-1"></i> 복사하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
