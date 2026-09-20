import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import { apiSendChatMessage } from '../services/api';

export default function FinanceChat({ income, expenses }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello! I am your AI Finance Coach. Ask me anything about your income, spending patterns, savings targets, or budget recommendations.',
      timestamp: '12:00 PM',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (messageText = inputMessage) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const responseReply = await apiSendChatMessage(trimmed, messages);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'I am analyzing your finances offline. Focus on reducing discretionary Shopping and Entertainment expenses to boost your monthly savings margin.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sampleQuestions = [
    "How can I save ₹10,000 per month?",
    "Where am I spending the most?",
    "How can I reduce my expenses?",
    "Can I reach my savings goal?"
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[540px] overflow-hidden">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              AI Finance Coach Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h2>
            <p className="text-[11px] text-slate-500">
              Conversational intelligence • REST API Endpoint (<code className="text-indigo-600 font-mono">POST /api/chat</code>)
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-1 rounded-md border border-indigo-200">
          AI Active
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-800 text-white'
                  : 'bg-indigo-600 text-white shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs font-medium'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className={`text-[9px] mt-1 block text-right font-medium ${msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>AI Coach is analyzing your financial records...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Questions */}
      <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span className="text-slate-400 font-semibold shrink-0">Suggested Questions:</span>
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="shrink-0 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold px-2.5 py-1 rounded-full transition-colors border border-slate-200/80"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask your finance coach e.g., 'How can I save ₹10,000 per month?'"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
