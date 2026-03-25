import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, Bot, User, Trash2, Edit2, X, Check, ArrowRight, BookOpen, Play } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editInput, setEditInput] = useState('');
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/chat');
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch chat history');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempId = Date.now();
    const userMsg = { id: tempId, sender: 'user', message: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/chat/send', { message: userMsg.message });
      setMessages((prev) => prev.map(m => m.id === tempId ? { ...m, id: data.user_message.id } : m));
      
      setMessages((prev) => [...prev, { 
        id: data.bot_response.id || Date.now() + 1, 
        sender: 'bot', 
        message: data.bot_response.message,
        emotion: data.bot_response.emotion,
        intensity: data.bot_response.intensity,
        suggestions: data.bot_response.suggestions
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'bot', message: "Sorry, I'm experiencing some trouble right now." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to delete all chat history? This cannot be undone.")) return;
    try {
      await api.delete('/chat/clear');
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history');
    }
  };

  const handleDeleteMessage = async (id) => {
    try {
      await api.delete(`/chat/${id}`);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to delete message');
    }
  };

  const startEditing = (msg) => {
    setEditingId(msg.id);
    setEditInput(msg.message);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditInput('');
  };

  const saveEdit = async (id) => {
    if (!editInput.trim()) return;
    try {
      await api.put(`/chat/${id}`, { message: editInput });
      setMessages(prev => prev.map(m => m.id === id ? { ...m, message: editInput } : m));
      setEditingId(null);
    } catch (err) {
      console.error('Failed to edit message');
    }
  };

  const renderSuggestionCard = (suggestionText, index) => {
    const text = suggestionText.toLowerCase();
    
    // Interactive Exercise Card Match
    if (text.includes('breath') || text.includes('meditat') || text.includes('exercise') || text.includes('relax')) {
       return (
          <div key={index} className="mt-4 bg-gradient-to-br from-[#f0f6ff] to-[#f8fbff] border border-[#d1e0ff]/70 rounded-[24px] p-5 relative overflow-hidden group shadow-[0_4px_20px_rgba(90,139,241,0.05)] transition-all hover:shadow-[0_8px_30px_rgba(90,139,241,0.1)] hover:-translate-y-0.5 cursor-pointer">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/60 rounded-full filter blur-xl -mr-10 -mt-10 mix-blend-overlay pointer-events-none"></div>
             <div className="relative z-10 flex gap-4 items-center">
               <div className="w-16 h-16 bg-white rounded-[20px] flex items-center justify-center shadow-sm text-[#5a8bf1] flex-shrink-0 group-hover:scale-105 transition-transform">
                 <span className="text-3xl">{text.includes('breath') ? '🌬️' : '🧘‍♀️'}</span>
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-gray-800 text-[15.5px] leading-tight">
                   {text.includes('breath') ? 'Relaxing Breathing Exercise' : 'Guided Meditation Session'}
                 </h4>
                 <p className="text-[13px] text-gray-500 mt-1.5 leading-snug line-clamp-2 pr-2">{suggestionText}</p>
               </div>
             </div>
             <button className="relative z-10 mt-5 w-full bg-white border border-[#A0C4FF]/50 hover:bg-[#5a8bf1] text-[#5a8bf1] hover:text-white py-3 rounded-xl font-semibold text-[14px] transition-all flex items-center justify-center gap-2 group-hover:border-transparent">
               Start Exercise <Play size={15} fill="currentColor" />
             </button>
          </div>
       )
    }
    
    // Journaling / Article
    if (text.includes('journal') || text.includes('write') || text.includes('read') || text.includes('article') || text.includes('tip')) {
       return (
          <div key={index} className="mt-3 bg-white border border-gray-100 rounded-[20px] p-3.5 flex gap-3.5 items-center hover:border-[#A0C4FF]/60 hover:shadow-sm transition-all cursor-pointer group">
            <div className="w-11 h-11 bg-[#f4f7fe] rounded-full flex items-center justify-center text-[#5a8bf1] flex-shrink-0 group-hover:bg-[#5a8bf1] group-hover:text-white transition-colors">
              <BookOpen size={18} />
            </div>
            <p className="text-[13.5px] text-gray-600 leading-snug font-medium group-hover:text-gray-900 transition-colors line-clamp-2 pr-2">{suggestionText}</p>
          </div>
       )
    }
  
    // Default Pill
    return (
      <div key={index} className="flex gap-3 items-start bg-gray-50 rounded-2xl p-3.5 border border-gray-100 transition-all hover:bg-white hover:border-[#A0C4FF]/40 hover:shadow-sm">
        <span className="text-[15px] leading-none mt-0.5 opacity-80">💡</span>
        <span className="text-[13.5px] text-gray-600 font-medium leading-relaxed">{suggestionText}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-40px)] bg-white md:bg-transparent md:p-6 max-w-4xl mx-auto pt-4 md:pt-6 pb-20 md:pb-6 font-sans">
      <div className="bg-white md:rounded-[32px] shadow-[0_2px_20px_rgba(0,0,0,0.02)] border-t md:border border-gray-100 flex flex-col h-full overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Bot className="text-primary w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-[16px]">Support Assistant</h2>
              <p className="text-[11px] font-bold text-[#4ca642] uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#4ca642] block animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <button 
              onClick={handleClearHistory}
              title="Clear Chat History"
              className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
            >
              <Trash2 className="w-[22px] h-[22px]" />
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#fafcfb]">
          {messages.length === 0 && !isTyping && (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-sm border border-gray-50 mb-5 relative">
                <div className="absolute inset-0 bg-primary/5 rounded-[32px] mix-blend-multiply"></div>
                <Bot className="w-10 h-10 text-primary relative z-10" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg">How are you feeling today?</h3>
              <p className="text-[15px] mt-1.5 font-medium text-gray-400">I'm here to listen and help you unpack your thoughts.</p>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.sender === 'user';
            const showAvatar = idx === 0 || messages[idx - 1].sender !== msg.sender;
            const isEditing = editingId === msg.id;
            
            return (
              <div key={msg.id || idx} className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up group`}>
                <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center flex-shrink-0 ${showAvatar ? (isUser ? 'bg-gray-100 border border-gray-200' : 'bg-[#e8f1ff] border border-[#d1e0ff]') : 'opacity-0'}`}>
                   {isUser ? <User className="w-[18px] h-[18px] text-gray-500" /> : <Bot className="w-[18px] h-[18px] text-[#5a8bf1]" />}
                </div>
                
                <div className={`relative max-w-[85%] md:max-w-[75%] ${isEditing ? 'w-full' : ''}`}>
                  
                  {/* Action buttons on hover for user messages */}
                  {isUser && !isEditing && (
                    <div className="absolute top-1 -left-16 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEditing(msg)} className="p-1.5 bg-white shadow-sm rounded-full text-gray-400 hover:text-[#5a8bf1] border border-gray-100"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 bg-white shadow-sm rounded-full text-gray-400 hover:text-red-500 border border-gray-100"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  )}

                  <div className={`px-5 py-3.5 rounded-3xl ${
                    isUser 
                      ? 'bg-primary text-white rounded-tr-md shadow-[0_4px_15px_rgba(90,139,241,0.25)]' 
                      : 'bg-white text-gray-700 rounded-tl-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100'
                  }`}>
                    
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={editInput}
                          onChange={(e) => setEditInput(e.target.value)}
                          className="w-full bg-white/10 text-white placeholder-white/50 resize-none outline-none border-b border-white/30 focus:border-white transition-colors"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2 mt-1">
                          <button onClick={cancelEditing} className="p-1 hover:bg-white/20 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                          <button onClick={() => saveEdit(msg.id)} className="p-1 hover:bg-white/20 rounded-full transition-colors"><Check className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ) : (
                      <p className="leading-relaxed text-[15.5px] whitespace-pre-wrap">{msg.message}</p>
                    )}
                    
                    {/* Bot Actions */}
                    {!isUser && !isEditing && (
                       <div className="absolute top-1 -right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => handleDeleteMessage(msg.id)} className="p-1.5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-full text-gray-400 hover:text-red-500 border border-gray-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    )}

                    {/* AI Structured Data Rendering */}
                    {!isUser && (msg.emotion || (msg.suggestions && msg.suggestions.length > 0)) && (
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-3">
                        {msg.emotion && msg.emotion !== "Neutral" && (
                           <div className="flex items-center">
                             <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full bg-[#5a8bf1]/10 text-[#5a8bf1] border border-[#5a8bf1]/20 shadow-sm">
                               {msg.emotion} {msg.intensity && msg.intensity !== "Unknown" ? `• ${msg.intensity}` : ''}
                             </span>
                           </div>
                        )}
                        
                        {msg.suggestions && msg.suggestions.length > 0 && (
                          <div className="space-y-2 mt-1 -ml-1">
                             {msg.suggestions.map((s, i) => renderSuggestionCard(s, i))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex gap-4 animate-fade-in-up">
              <div className="w-[38px] h-[38px] rounded-full bg-[#e8f1ff] border border-[#d1e0ff] flex items-center justify-center flex-shrink-0">
                 <Bot className="w-[18px] h-[18px] text-[#5a8bf1]" />
              </div>
              <div className="bg-white text-gray-700 px-5 py-4 rounded-3xl rounded-tl-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-1.5 h-[48px]">
                <div className="w-1.5 h-1.5 bg-[#A0C4FF] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[#A0C4FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 bg-[#A0C4FF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-1" />
        </div>

        {/* Input Area */}
        <div className="p-3 md:p-5 bg-white border-t border-gray-100 shadow-[0_-15px_30px_-3px_rgb(0,0,0,0.02)] z-10">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type how you're feeling..."
              className="w-full bg-gray-50/50 md:bg-gray-50 border border-gray-100 group-hover:border-gray-200 text-gray-800 text-[15px] rounded-full pl-6 pr-14 py-4 md:py-4.5 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#5a8bf1]/20 focus:border-[#5a8bf1]/30 transition-all font-medium placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || editingId !== null}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-11 h-11 flex justify-center items-center bg-primary text-white rounded-full hover:bg-blue-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-[0_4px_12px_rgba(90,139,241,0.25)] cursor-pointer"
            >
              <Send className="w-5 h-5 ml-0.5" strokeWidth={2.5}/>
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
