
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from './types';
import { laborLawService } from './services/geminiService';
import MessageBubble from './components/MessageBubble';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '안녕하세요! 포근한 마음으로 당신의 권익을 지키는 양띠 노무사입니다. \n\n부당해고, 임금체불, 직장 내 괴롭힘 등 고민이 있으시다면 무엇이든 말씀해 주세요. 구체적인 상황을 말씀해주시면 더 정확한 법률 상담이 가능합니다.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantId = (Date.now() + 1).toString();
      let assistantContent = '';
      
      // Initial placeholder for streaming
      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      }]);

      const stream = laborLawService.sendMessageStream(input);
      for await (const chunk of stream) {
        assistantContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId ? { ...msg, content: assistantContent } : msg
        ));
      }
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.content !== ''),
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 말씀해 주시겠어요?',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-gray-50 border-x border-gray-200 shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <i className="fas fa-sheep text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">양띠 노무사 챗봇</h1>
            <p className="text-xs text-green-500 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              노동법 전문가 실시간 상담 중
            </p>
          </div>
        </div>
        <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <i className="fas fa-ellipsis-v"></i>
        </div>
      </header>

      {/* Chat Area */}
      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && messages[messages.length-1].content === '' && (
            <div className="flex justify-start mb-6 animate-pulse">
              <div className="flex max-w-[70%]">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-300">
                    <i className="fas fa-sheep"></i>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm w-24 flex gap-1 items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></div>
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                   <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-4 md:p-6">
        <form 
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto relative flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="상담 내용을 입력하세요 (예: 연차 수당 계산법이 궁금해요)"
              rows={1}
              className="w-full bg-gray-100 border-none rounded-2xl px-5 py-3.5 pr-14 text-sm focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all resize-none overflow-hidden"
              style={{ minHeight: '52px', maxHeight: '150px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'inherit';
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 bottom-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 hover:bg-orange-600' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <i className="fas fa-paper-plane text-sm"></i>
              )}
            </button>
          </div>
        </form>
        <p className="text-[10px] text-gray-400 text-center mt-3">
          본 상담은 참고용이며 법적 효력을 갖지 않습니다. 중대한 사안은 반드시 대면 상담을 권장합니다.
        </p>
      </footer>
    </div>
  );
};

export default App;
