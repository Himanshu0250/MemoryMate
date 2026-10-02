import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Paperclip,
  Image as ImageIcon,
  X,
  Plus,
  MessageSquare,
  Edit2,
  Search,
  PanelLeftClose,
  PanelLeft,
  AlertCircle,
  Heart,
  Calendar,
  Layers,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Modal } from '../components/common/Modal';
import { MarkdownRenderer } from '../components/common/MarkdownRenderer';
import { aiService } from '../services/aiService';
import { memoryService } from '../services/memoryService';
import { useNotify } from '../context/NotificationContext';

export const AIChatPage = () => {
  // Chat state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeTitle, setActiveTitle] = useState('New Chat');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorState, setErrorState] = useState(null); // { lastQuestion, errorMsg }

  // Media & Voice state
  const [attachedImage, setAttachedImage] = useState(null); // { file, previewUrl, base64 }
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Sidebar / Drawer & Search
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchConvQuery, setSearchConvQuery] = useState('');

  // Modals
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [memoryToSave, setMemoryToSave] = useState({
    title: '',
    description: '',
    category: 'Conversation',
    tags: 'ai_assistant, memory',
    importance: 'medium',
    mood: 'happy'
  });
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [convToRename, setConvToRename] = useState({ id: '', title: '' });

  // Refs
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const { showToast } = useNotify();

  const suggestedQuestions = [
    "What does Rahul like?",
    "When is Rahul's birthday?",
    "What gift should I give Rahul?",
    "What did Priya tell me about her trip?",
    "Tell me something about my memories.",
    "What promises have I made?"
  ];

  // Auto scroll to bottom
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputMessage]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    // Initialize speech synthesis cancellation on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const loadConversations = async () => {
    try {
      const list = await aiService.listConversations();
      setConversations(list || []);
      if (list && list.length > 0 && !activeConversationId) {
        // Load the most recent conversation
        loadSingleConversation(list[0].id);
      } else if (!activeConversationId) {
        // Start fresh welcome message
        initWelcomeMessage();
      }
    } catch (err) {
      console.warn('Failed to load conversations:', err);
      initWelcomeMessage();
    }
  };

  const initWelcomeMessage = () => {
    setActiveConversationId(null);
    setActiveTitle('New Chat');
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Hello! I am your **MemoryMate AI Assistant** powered by Gemma.\n\nI can help you remember:\n* 🎁 **Preferences & Interests** (e.g. *'What does Rahul like?'*)\n* 🎂 **Birthdays & Dates** (e.g. *'When is Rahul's birthday?'*)\n* 💡 **Gift Ideas** (e.g. *'What gift should I give Rahul?'*)\n* ✈️ **Travel & Stories** (e.g. *'What did Priya tell me about her trip?'*)\n* 🤝 **Promises & Commitments** (e.g. *'What promises have I made?'*)\n\nAsk me anything from your memory vault!",
        source_memories: [],
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const loadSingleConversation = async (convId) => {
    try {
      setLoading(true);
      setErrorState(null);
      const conv = await aiService.getConversation(convId);
      setActiveConversationId(conv.id);
      setActiveTitle(conv.title || 'Chat');

      if (conv.messages && conv.messages.length > 0) {
        const formatted = conv.messages.map((m, idx) => ({
          id: m.id || `msg-${idx}`,
          sender: m.sender,
          text: m.text,
          image_data: m.image_data || null,
          source_memories: m.source_memories || [],
          timestamp: m.timestamp || new Date().toISOString()
        }));
        setMessages(formatted);
      } else {
        initWelcomeMessage();
        setActiveConversationId(conv.id);
      }
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Could not load conversation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewChat = async () => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMessageId(null);
      setErrorState(null);
      const newConv = await aiService.createConversation();
      setConversations((prev) => [
        {
          id: newConv.id,
          title: 'New Chat',
          last_message: 'Started new conversation',
          message_count: 0,
          updated_at: new Date().toISOString()
        },
        ...prev
      ]);
      setActiveConversationId(newConv.id);
      setActiveTitle('New Chat');
      setMessages([
        {
          id: 'welcome',
          sender: 'assistant',
          text: "Starting a new conversation! Ask me anything about your friends, promises, gifts, or stored memories.",
          source_memories: [],
          timestamp: new Date().toISOString()
        }
      ]);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
      setTimeout(() => textareaRef.current?.focus(), 100);
    } catch (err) {
      console.error(err);
      showToast('Failed to create new chat', 'error');
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;
    try {
      await aiService.deleteConversation(convId);
      const remaining = conversations.filter((c) => c.id !== convId);
      setConversations(remaining);
      showToast('Conversation deleted', 'info');

      if (activeConversationId === convId) {
        if (remaining.length > 0) {
          loadSingleConversation(remaining[0].id);
        } else {
          initWelcomeMessage();
        }
      }
    } catch (err) {
      showToast('Failed to delete conversation', 'error');
    }
  };

  const handleOpenRename = (conv, e) => {
    e?.stopPropagation();
    setConvToRename({ id: conv.id, title: conv.title || 'Chat' });
    setRenameModalOpen(true);
  };

  const handleSaveRename = async () => {
    if (!convToRename.title.trim()) return;
    try {
      await aiService.renameConversation(convToRename.id, convToRename.title.trim());
      setConversations((prev) =>
        prev.map((c) => (c.id === convToRename.id ? { ...c, title: convToRename.title.trim() } : c))
      );
      if (activeConversationId === convToRename.id) {
        setActiveTitle(convToRename.title.trim());
      }
      setRenameModalOpen(false);
      showToast('Conversation renamed', 'success');
    } catch (err) {
      showToast('Failed to rename conversation', 'error');
    }
  };

  // Image attachment handler
  const handleSelectImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be under 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage({
        file,
        previewUrl: URL.createObjectURL(file),
        base64: reader.result
      });
      showToast('Image attached', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (attachedImage?.previewUrl) {
      URL.revokeObjectURL(attachedImage.previewUrl);
    }
    setAttachedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Voice Speech Recognition (STT)
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast('Speech recognition is not supported in this browser.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      showToast('Listening... Speak now', 'info');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      showToast(`Voice error: ${event.error}`, 'error');
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Text to Speech (TTS)
  const handleToggleSpeak = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-speech is not supported on your browser', 'warning');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for clearer speech
    const cleanSpeech = text
      .replace(/[#*`_~[\]]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/•/g, ', ');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Send Message Logic
  const handleSend = async (textToSend) => {
    const text = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if ((!text && !attachedImage) || loading) return;

    // Reset speech & error
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setErrorState(null);

    const userMsgId = `user-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: text || 'Analyzed attached image',
      image_data: attachedImage?.base64 || null,
      timestamp: new Date().toISOString()
    };

    // Update UI immediately
    setMessages((prev) => [...prev, userMsg]);
    const currentAttachedImage = attachedImage?.base64 || null;
    setInputMessage('');
    handleRemoveImage();
    setLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          sender: m.sender,
          text: m.text
        }));

      const res = await aiService.chat(
        text,
        activeConversationId,
        historyPayload,
        currentAttachedImage
      );

      // If backend generated or returned conversation_id
      if (res.conversation_id && res.conversation_id !== activeConversationId) {
        setActiveConversationId(res.conversation_id);
      }

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: res.message,
        source_memories: res.source_memories || [],
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);
      loadConversations(); // refresh history list
    } catch (err) {
      console.error('AI chat failed:', err);
      setErrorState({
        lastQuestion: text,
        errorMsg: err?.response?.data?.detail || 'Something went wrong. Please try again.'
      });
      showToast('AI response failed. You can retry below.', 'error');
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  // Regenerate last response
  const handleRegenerate = async () => {
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (!lastUserMsg) return;

    // Remove the trailing assistant message if present
    setMessages((prev) => {
      const copy = [...prev];
      if (copy[copy.length - 1].sender === 'assistant') {
        copy.pop();
      }
      return copy;
    });

    await handleSend(lastUserMsg.text);
  };

  // Copy text to clipboard
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Save as Memory Dialog
  const handleOpenSaveModal = (text) => {
    setMemoryToSave({
      title: `Note: ${text.slice(0, 35).replace(/[#*`_~]/g, '')}...`,
      description: text,
      category: 'Conversation',
      tags: 'ai_assistant, memory',
      importance: 'medium',
      mood: 'happy'
    });
    setSaveModalOpen(true);
  };

  const handleConfirmSaveMemory = async () => {
    if (!memoryToSave.title.trim() || !memoryToSave.description.trim()) {
      showToast('Title and description are required', 'error');
      return;
    }

    try {
      const tagList = memoryToSave.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await memoryService.create({
        title: memoryToSave.title.trim(),
        description: memoryToSave.description.trim(),
        category: memoryToSave.category,
        tags: tagList,
        importance: memoryToSave.importance,
        mood: memoryToSave.mood,
        is_favorite: false
      });

      setSaveModalOpen(false);
      showToast('Memory successfully saved to your vault! ❤️', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save memory to vault', 'error');
    }
  };

  // Format timestamp nicely
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    return isNaN(d.getTime())
      ? ''
      : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(searchConvQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100dvh-12.5rem)] lg:h-[calc(100vh-8rem)] max-w-7xl mx-auto w-full text-left gap-4 overflow-hidden relative">
      {/* ------------------------------------------------------------- */}
      {/* 1. Sidebar (Desktop) / Drawer (Mobile) */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 1024) && (
          <>
            {/* Mobile Backdrop */}
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
              />
            )}

            <motion.aside
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`
                fixed lg:static top-16 bottom-0 left-0 z-40
                w-72 sm:w-80 h-full
                bg-white/95 dark:bg-dark-900/95 lg:bg-white/70 lg:dark:bg-dark-900/70
                backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80
                rounded-none lg:rounded-3xl p-4 flex flex-col shadow-xl lg:shadow-none
              `}
            >
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800/70">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Conversations</h2>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">History & Vault Sessions</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* New Chat Button */}
              <div className="pt-3 pb-2">
                <Button
                  variant="glow"
                  onClick={handleCreateNewChat}
                  icon={Plus}
                  className="w-full justify-center rounded-2xl py-2.5 text-xs font-bold shadow-md"
                >
                  New Conversation
                </Button>
              </div>

              {/* Search History */}
              <div className="py-2 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchConvQuery}
                  onChange={(e) => setSearchConvQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-dark-800 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 border border-slate-200/60 dark:border-slate-700/60 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 mt-1 scrollbar-thin">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30" />
                    <p>No conversations found</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => loadSingleConversation(conv.id)}
                        className={`
                          group relative flex items-center justify-between p-2.5 rounded-2xl cursor-pointer text-left transition-all
                          ${
                            isActive
                              ? 'bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/30 text-brand-700 dark:text-brand-300 shadow-sm'
                              : 'hover:bg-slate-100 dark:hover:bg-dark-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                          }
                        `}
                      >
                        <div className="flex items-start gap-2.5 min-w-0 pr-2">
                          <MessageSquare
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isActive ? 'text-brand-500' : 'text-slate-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate">
                              {conv.title || 'Untitled Chat'}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {conv.last_message || 'No messages'}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons on hover */}
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
                          <button
                            title="Rename chat"
                            onClick={(e) => handleOpenRename(conv, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-dark-700"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            title="Delete chat"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Chat Area */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col h-full bg-white/70 dark:bg-dark-900/70 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-3 sm:p-5 shadow-xl relative overflow-hidden">
        {/* Chat Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-dark-800 hover:bg-slate-200 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
              title={sidebarOpen ? 'Close sidebar' : 'Open conversations'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>

            {/* Glowing AI Avatar in Header */}
            <div className="relative shrink-0">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md ${
                  loading ? 'shadow-glow-pulse animate-pulse ring-2 ring-brand-400' : 'shadow-glow-sm'
                }`}
              >
                <Bot className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              {loading && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-dark-900 animate-ping" />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate flex items-center gap-1.5">
                {activeTitle}
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span>Gemma AI · Grounded on personal vault</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewChat}
              icon={Plus}
              className="text-xs py-1.5 px-2.5 rounded-xl hidden sm:flex"
            >
              New Chat
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={initWelcomeMessage}
              icon={Trash2}
              className="text-xs py-1.5 px-2.5 rounded-xl text-slate-500 hover:text-rose-500"
              title="Clear current view"
            >
              <span className="hidden md:inline">Clear</span>
            </Button>
          </div>
        </div>

        {/* Messages Scroll Feed */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 sm:pr-2 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSpeaking = speakingMessageId === msg.id;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 sm:gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="relative shrink-0 mt-0.5">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md ${
                        loading ? 'ring-2 ring-brand-400/50 shadow-glow-sm' : ''
                      }`}
                    >
                      <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </div>
                  </div>
                )}

                {/* Message Content Bubble */}
                <div className={`max-w-[88%] sm:max-w-[78%] space-y-2 ${isUser ? 'text-right' : 'text-left'}`}>
                  <div
                    className={`p-3.5 sm:p-4 rounded-3xl text-xs sm:text-sm leading-relaxed transition-all ${
                      isUser
                        ? 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-glow-sm rounded-tr-none'
                        : 'bg-white/80 dark:bg-dark-800/80 border border-slate-200/90 dark:border-slate-800/90 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm'
                    }`}
                  >
                    {/* User Image Attachment in Message */}
                    {msg.image_data && (
                      <div className="mb-2.5 rounded-2xl overflow-hidden border border-white/20 max-w-xs">
                        <img
                          src={msg.image_data}
                          alt="Attachment"
                          className="w-full max-h-56 object-cover rounded-xl"
                        />
                      </div>
                    )}

                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <MarkdownRenderer content={msg.text} />
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-[9px] sm:text-[10px] mt-1.5 ${
                        isUser ? 'text-white/70' : 'text-slate-400'
                      }`}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>

                  {/* Grounded Memory Sources (Citations) */}
                  {!isUser && msg.source_memories && msg.source_memories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 text-left space-y-1.5"
                    >
                      <span className="text-[10px] sm:text-[11px] font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
                        Grounded Sources ({msg.source_memories.length}):
                      </span>
                      <div className="space-y-1">
                        {msg.source_memories.map((src, sIdx) => (
                          <div
                            key={src.id || sIdx}
                            className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5"
                          >
                            <span className="text-brand-500 font-bold">•</span>
                            <div>
                              <strong>{src.title}</strong>
                              {src.date ? ` (Added: ${src.date})` : ''}
                              {src.person_name ? ` · Friend: ${src.person_name}` : ''}
                              {src.description ? `: ${src.description.slice(0, 100)}...` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* AI Response Action Buttons */}
                  {!isUser && msg.id !== 'welcome' && (
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-slate-400 pt-0.5">
                      {/* Read aloud (TTS) */}
                      <button
                        onClick={() => handleToggleSpeak(msg.id, msg.text)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${
                          isSpeaking
                            ? 'bg-brand-500/20 text-brand-600 dark:text-brand-300 font-semibold'
                            : 'hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-dark-800'
                        }`}
                        title={isSpeaking ? 'Stop speech' : 'Read aloud'}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      <span>·</span>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <span>·</span>

                      {/* Save as Memory */}
                      <button
                        onClick={() => handleOpenSaveModal(msg.text)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                        title="Save as Memory to Vault"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        <span>Save as Memory</span>
                      </button>

                      <span>·</span>

                      {/* Regenerate */}
                      <button
                        onClick={handleRegenerate}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                        title="Regenerate response"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-slate-200 dark:bg-dark-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Glowing Animated Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 text-slate-500 text-xs py-2"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center animate-pulse shadow-glow shadow-brand-500/40">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-3xl bg-white/80 dark:bg-dark-800/80 border border-slate-200 dark:border-slate-800 rounded-tl-none space-y-1">
                <div className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold text-xs">
                  <Sparkle className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemma AI is reasoning over your memories...</span>
                </div>
                <div className="flex items-center gap-1 pt-1">
                  <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message with Retry */}
          {errorState && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 max-w-lg"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorState.errorMsg}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSend(errorState.lastQuestion)}
                icon={RefreshCw}
                className="text-xs py-1 px-2.5 rounded-xl border-rose-400 text-rose-500 hover:bg-rose-500/10"
              >
                Retry
              </Button>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. Suggested Quick Prompts */}
        {/* ------------------------------------------------------------- */}
        <div className="py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-t border-slate-200/60 dark:border-slate-800/60">
          <span className="text-[11px] sm:text-xs text-slate-400 shrink-0 flex items-center gap-1 font-medium">
            <HelpCircle className="w-3 h-3 text-brand-500" /> Suggestions:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-dark-800 hover:bg-brand-500/10 dark:hover:bg-brand-500/20 hover:border-brand-500/40 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-medium whitespace-nowrap border border-slate-200 dark:border-slate-700 transition-all shrink-0 active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. Bottom Chat Composer */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2 shrink-0">
          {/* Attached Image Preview */}
          {attachedImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-2 flex items-center gap-2 p-1.5 pl-2.5 bg-slate-100 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-fit"
            >
              <img
                src={attachedImage.previewUrl}
                alt="Preview"
                className="w-9 h-9 object-cover rounded-xl border border-slate-300 dark:border-slate-600"
              />
              <span className="text-xs text-slate-600 dark:text-slate-300 max-w-[150px] truncate font-medium">
                {attachedImage.file.name}
              </span>
              <button
                onClick={handleRemoveImage}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-dark-700 transition-colors"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Input Box */}
          <div className="relative flex items-end gap-1.5 sm:gap-2 bg-slate-100/90 dark:bg-dark-800/90 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-1.5 sm:p-2 focus-within:ring-2 focus-within:ring-brand-500/40 focus-within:border-brand-500 transition-all shadow-inner">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSelectImage}
              accept="image/*"
              className="hidden"
            />

            {/* Voice Input (Microphone) */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-2xl transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30 ring-2 ring-rose-300'
                  : 'text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200/70 dark:hover:bg-dark-700'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Voice input (Speech to text)'}
            >
              {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-2xl text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-200/70 dark:hover:bg-dark-700 transition-colors"
              title="Attach an image"
            >
              <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Auto-expanding Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                isListening
                  ? 'Listening to your voice...'
                  : 'Ask about birthdays, foods, gifts, promises... (Enter to send, Shift+Enter for newline)'
              }
              className="flex-1 bg-transparent border-0 resize-none py-2 px-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none max-h-[140px] leading-relaxed"
            />

            {/* Send Button */}
            <Button
              variant="glow"
              onClick={() => handleSend()}
              disabled={(!inputMessage.trim() && !attachedImage) || loading}
              icon={Send}
              className="rounded-2xl py-2.5 px-3.5 sm:px-5 font-bold shrink-0 min-h-[42px] shadow-md"
            >
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. Save as Memory Confirmation Modal */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        title="Save AI Note to Vault"
        subtitle="Confirm and customize this memory before adding it to your personal vault."
      >
        <div className="space-y-4 text-left pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Memory Title
            </label>
            <input
              type="text"
              value={memoryToSave.title}
              onChange={(e) => setMemoryToSave({ ...memoryToSave, title: e.target.value })}
              className="w-full glass-input rounded-xl p-2.5 text-xs sm:text-sm"
              placeholder="e.g. Rahul's Favorite Dark Chocolate"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={4}
              value={memoryToSave.description}
              onChange={(e) => setMemoryToSave({ ...memoryToSave, description: e.target.value })}
              className="w-full glass-input rounded-xl p-2.5 text-xs sm:text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={memoryToSave.category}
                onChange={(e) => setMemoryToSave({ ...memoryToSave, category: e.target.value })}
                className="w-full glass-input rounded-xl p-2.5 text-xs sm:text-sm"
              >
                <option value="Conversation">Conversation</option>
                <option value="Gift Idea">Gift Idea</option>
                <option value="Food & Dining">Food & Dining</option>
                <option value="Travel">Travel</option>
                <option value="Promise">Promise</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={memoryToSave.tags}
                onChange={(e) => setMemoryToSave({ ...memoryToSave, tags: e.target.value })}
                className="w-full glass-input rounded-xl p-2.5 text-xs sm:text-sm"
                placeholder="ai_note, gift, friend"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setSaveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleConfirmSaveMemory} icon={Heart}>
              Save to Memory Vault
            </Button>
          </div>
        </div>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 6. Rename Conversation Modal */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        title="Rename Conversation"
        subtitle="Give this chat session a meaningful title."
      >
        <div className="space-y-4 text-left pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Chat Title
            </label>
            <input
              type="text"
              value={convToRename.title}
              onChange={(e) => setConvToRename({ ...convToRename, title: e.target.value })}
              className="w-full glass-input rounded-xl p-2.5 text-xs sm:text-sm"
              placeholder="e.g. Rahul Birthday Planning"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button variant="ghost" onClick={() => setRenameModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="glow" onClick={handleSaveRename}>
              Save Title
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
