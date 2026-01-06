import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAngelAI } from '@/hooks/useAngelAI';
import { useAngelTheme } from './AngelThemeContext';
import { AngelThemePicker } from './AngelThemePicker';
import { cn } from '@/lib/utils';

interface AngelAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const quickActions = [
  { label: '🎯 Gợi ý chiến dịch cho tôi', prompt: 'Gợi ý những chiến dịch từ thiện phù hợp với tôi' },
  { label: '💎 Hướng dẫn crypto', prompt: 'Làm sao để quyên góp bằng crypto?' },
  { label: '🏆 Giải thích NFT từ thiện', prompt: 'Giải thích về NFT từ thiện và huy hiệu' },
  { label: '🤝 Làm tình nguyện viên', prompt: 'Tôi muốn đăng ký làm tình nguyện viên' },
  { label: '💰 Rút tiền từ ví', prompt: 'Hướng dẫn rút tiền từ ví' },
];

export function AngelAIChatModal({ isOpen, onClose }: AngelAIChatModalProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, clearConversation } = useAngelAI();
  const { theme } = useAngelTheme();

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

  const isDarkTheme = theme.id === 'violet';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 w-[calc(100%-2rem)] md:w-[420px] h-[600px] max-h-[80vh] rounded-2xl shadow-2xl z-[100] flex flex-col overflow-hidden"
          style={{
            backgroundImage: `url(${theme.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Overlay for readability */}
          <div className={cn("absolute inset-0", theme.bodyBg)} />
          
          {/* Content container */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between p-4 border-b backdrop-blur-sm",
              theme.headerBg,
              theme.borderColor
            )}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-amber-500/30">
                    👼
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                  />
                </div>
                <div>
                  <h3 className={cn("font-bold flex items-center gap-1", theme.textPrimary)}>
                    Angel AI
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </h3>
                  <p className={cn("text-xs", theme.textSecondary)}>Thiên thần trợ lý của bạn</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <AngelThemePicker />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearConversation}
                  className={cn(
                    "h-8 w-8",
                    isDarkTheme 
                      ? "text-purple-300 hover:text-white hover:bg-purple-800/50" 
                      : "text-purple-600 hover:text-purple-900 hover:bg-purple-200/50"
                  )}
                  title="Xóa hội thoại"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className={cn(
                    "h-8 w-8",
                    isDarkTheme 
                      ? "text-purple-300 hover:text-white hover:bg-purple-800/50" 
                      : "text-purple-600 hover:text-purple-900 hover:bg-purple-200/50"
                  )}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-6xl mb-4"
                  >
                    👼
                  </motion.div>
                  <h4 className={cn("text-lg font-semibold mb-2", theme.textPrimary)}>
                    Xin chào, bạn thân yêu! ✨
                  </h4>
                  <p className={cn("text-sm mb-6 max-w-xs", theme.textSecondary)}>
                    Mình là Angel - Thiên thần AI của FUN Charity. Mình có thể giúp gì cho bạn hôm nay?
                  </p>
                  
                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.map((action, i) => (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickAction(action.prompt)}
                        className={cn(
                          "px-3 py-1.5 text-xs rounded-full transition-colors",
                          isDarkTheme 
                            ? "bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 border border-purple-500/30"
                            : "bg-white/70 hover:bg-white/90 text-purple-700 border border-purple-300/50 shadow-sm"
                        )}
                      >
                        {action.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
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
                            ? cn(theme.userMsgBg, 'text-white rounded-br-md')
                            : cn(theme.assistantMsgBg, theme.textPrimary, 'rounded-bl-md border', theme.borderColor)
                        )}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-sm">👼</span>
                            <span className="text-xs text-amber-500 font-medium">Angel</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content || (
                            <span className="inline-flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Đang suy nghĩ...
                            </span>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className={cn("p-4 border-t backdrop-blur-sm", theme.borderColor, theme.headerBg)}>
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhắn tin cho Angel..."
                  rows={1}
                  className={cn(
                    "flex-1 resize-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 max-h-32 border",
                    theme.inputBg,
                    theme.borderColor,
                    theme.textPrimary,
                    isDarkTheme ? "placeholder-purple-400" : "placeholder-purple-400"
                  )}
                  style={{ minHeight: '44px' }}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    "h-11 w-11 rounded-xl text-white shadow-lg disabled:opacity-50",
                    `bg-gradient-to-r ${theme.buttonGradient}`,
                    `hover:opacity-90`
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className={cn("text-xs text-center mt-2", theme.textSecondary)}>
                Powered by FUN Charity 💜
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
