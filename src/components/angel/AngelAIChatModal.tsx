import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Loader2, Maximize2, Minimize2, Save, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAngelAI } from '@/hooks/useAngelAI';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import angelQueenBg from '@/assets/angel-queen-bg.png';
import angelAvatar from '@/assets/angel-avatar-smiling.png';

interface AngelAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export function AngelAIChatModal({ isOpen, onClose }: AngelAIChatModalProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, clearConversation } = useAngelAI();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleSaveHistory = () => {
    if (messages.length === 0) {
      toast.error('Chưa có lịch sử chat để lưu');
      return;
    }

    const chatHistory = messages.map(msg => ({
      role: msg.role === 'user' ? 'Bạn' : 'Angel AI',
      content: msg.content,
      time: new Date(msg.createdAt).toLocaleString('vi-VN')
    }));

    const textContent = chatHistory.map(msg => 
      `[${msg.time}] ${msg.role}:\n${msg.content}`
    ).join('\n\n---\n\n');

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `angel-ai-chat-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Đã lưu lịch sử chat thành công! 💜');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const modalSize = isExpanded
    ? "fixed inset-4 md:inset-8 w-auto h-auto" 
    : "fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-[420px] h-[600px] max-h-[80vh]";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            layout
            className={cn(
              modalSize,
              "rounded-3xl shadow-2xl z-[100] flex flex-col p-[3px]"
            )}
            style={{
              background: 'linear-gradient(135deg, #c084fc, #e879f9, #a855f7, #c084fc)',
              boxShadow: '0 20px 60px -10px rgba(168, 85, 247, 0.5), 0 0 40px rgba(232, 121, 249, 0.3)',
            }}
          >
            <div 
              className="w-full h-full rounded-[21px] overflow-hidden flex flex-col relative"
              style={{
                backgroundImage: `url(${angelQueenBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'top center',
              }}
            >
            {/* Overlay - Bright lavender energy */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 via-fuchsia-400/25 to-violet-600/40" />
            
            {/* Sparkle effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div 
                animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full blur-[1px]"
              />
              <motion.div 
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute top-20 right-16 w-1.5 h-1.5 bg-fuchsia-200 rounded-full blur-[1px]"
              />
              <motion.div 
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                className="absolute bottom-32 left-8 w-2 h-2 bg-purple-200 rounded-full blur-[1px]"
              />
            </div>
            
            {/* Content container */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header - Bright lavender */}
              <div 
                className="flex items-center justify-between p-4 backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(233, 213, 255, 0.95), rgba(245, 208, 254, 0.95))',
                  borderBottom: '1px solid rgba(192, 132, 252, 0.3)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div 
                      className="w-11 h-11 rounded-full overflow-hidden border-2 border-purple-300"
                      style={{
                        boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                      }}
                    >
                      <img src={angelAvatar} alt="Angel AI" className="w-full h-full object-cover" />
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-lg shadow-green-400/50"
                    />
                  </div>
                  <h3 
                    className="text-[20px] font-bold flex items-center gap-1.5"
                    style={{ 
                      background: 'linear-gradient(135deg, #7c3aed, #c026d3)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Angel AI
                    <motion.span
                      animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-5 h-5 text-fuchsia-500" />
                    </motion.span>
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpand}
                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-200/50 rounded-xl"
                    title={isExpanded ? "Thu nhỏ" : "Phóng to"}
                  >
                    {isExpanded ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearConversation}
                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-200/50 rounded-xl"
                    title="Xóa hội thoại"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-8 w-8 text-purple-600 hover:text-purple-800 hover:bg-purple-200/50 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {messages.length === 0 ? (
                  <div className="flex-1 min-h-0 flex flex-col justify-end p-4 text-center">
                    <div className="w-full pb-4">
                      <motion.h4 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[22px] font-bold mb-3"
                        style={{ 
                          background: 'linear-gradient(135deg, #7c3aed, #db2777)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: '0 2px 20px rgba(124, 58, 237, 0.3)',
                        }}
                      >
                        Xin chào, bạn thân yêu! ✨
                      </motion.h4>
                      <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-[17px] max-w-xs mx-auto text-purple-800 font-medium"
                      >
                        Mình là Angel - Thiên thần AI của FUN Charity. Mình có thể giúp gì cho bạn hôm nay?
                      </motion.p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-1 min-h-0">
                    <div className="space-y-4 p-4">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={cn(
                            'flex',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] rounded-2xl px-4 py-2.5',
                              msg.role === 'user'
                                ? 'rounded-br-md text-white'
                                : 'rounded-bl-md text-purple-900'
                            )}
                            style={msg.role === 'user' 
                              ? {
                                  background: 'linear-gradient(135deg, #a855f7, #d946ef)',
                                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
                                }
                              : {
                                  background: 'rgba(255, 255, 255, 0.95)',
                                  border: '1px solid rgba(192, 132, 252, 0.3)',
                                  boxShadow: '0 4px 15px rgba(168, 85, 247, 0.15)',
                                }
                            }
                          >
                            {msg.role === 'assistant' && (
                              <div className="flex items-center gap-1.5 mb-1">
                                <img src={angelAvatar} alt="Angel" className="w-5 h-5 rounded-full object-cover" />
                                <span 
                                  className="text-xs font-semibold"
                                  style={{
                                    background: 'linear-gradient(135deg, #a855f7, #d946ef)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                  }}
                                >
                                  Angel AI
                                </span>
                              </div>
                            )}
                            <div className="text-[17px] whitespace-pre-wrap leading-relaxed">
                              {msg.content ? (
                                <span dangerouslySetInnerHTML={{ 
                                  __html: msg.content
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                    .replace(/__(.*?)__/g, '<strong>$1</strong>')
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                    .replace(/_(.*?)_/g, '<em>$1</em>')
                                }} />
                              ) : (
                                <span className="inline-flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Đang suy nghĩ...
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Input - Bright lavender */}
              <div 
                className="p-4 backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, rgba(233, 213, 255, 0.95), rgba(245, 208, 254, 0.95))',
                  borderTop: '1px solid rgba(192, 132, 252, 0.3)',
                }}
              >
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nhắn tin cho Angel..."
                    rows={1}
                    className="flex-1 resize-none rounded-2xl px-4 py-3 text-[17px] focus:outline-none max-h-32 text-purple-900 placeholder-purple-400"
                    style={{ 
                      minHeight: '48px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '2px solid rgba(192, 132, 252, 0.4)',
                      boxShadow: '0 2px 10px rgba(168, 85, 247, 0.1)',
                    }}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="h-12 w-12 rounded-2xl text-white shadow-lg disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #d946ef)',
                      boxShadow: '0 4px 20px rgba(168, 85, 247, 0.5)',
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <p 
                  className="text-[16px] text-center mt-3 font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #7c3aed, #c026d3)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Powered by FUN Charity 💜
                </p>
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
