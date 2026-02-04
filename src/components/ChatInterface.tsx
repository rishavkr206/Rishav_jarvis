import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface ChatInterfaceProps {
  conversationId: string | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

export function ChatInterface({
  conversationId,
  messages,
  onSendMessage,
  isLoading,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Bot size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Welcome to JARVIS
          </h2>
          <p className="text-slate-600 mb-6">
            Your personal AI assistant powered by self-hosted LLM
          </p>
          <p className="text-sm text-slate-500">
            Select a conversation or start a new one to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Bot size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                Start a conversation
              </h3>
              <p className="text-slate-600">
                Ask me anything! I can help with information retrieval,
                analysis, and more.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Bot size={18} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white'
                      : 'bg-white shadow-sm border border-slate-200 text-slate-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-white shadow-sm border border-slate-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask JARVIS anything..."
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-xl hover:from-cyan-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            >
              <Send size={18} />
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
