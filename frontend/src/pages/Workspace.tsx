import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, User, Bot, Settings, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useNavigate } from 'react-router-dom';
import { getConversationsByUser,createMessage } from '@/api/chatApi';
import { setConversations,setSelectedConversation,addMessageToConversation,setLoading,clearChat } from '@/store/slices/chatSlice';
import { setAgents } from '@/store/slices/agentSlice';
import {getActiveSubscriptionsByUser} from '@/api/subscriptionApi';
import { Plus } from "lucide-react";
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';
import Draggable from 'react-draggable';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatedSendingDots } from '@/components/ui/animated-sending-dots';
import { useTranslation } from 'react-i18next';


declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { 'agent-id': string };
    }
  }
}



const Workspace = () => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [activeAgent,setActiveAgent] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
   const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversation } = useAppSelector((state) => state.chat);
  const { agents} = useAppSelector((state) => state.agent);  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { t } = useTranslation();




  // Add this ref for the chat scroll area
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<
    { sender: string; content: string; file?: File | string | null; sentAt: string }[]
  >([]);


  const globalWsRef = useRef<WebSocket | null>(null);      // For user_{userId}_conversations
  const conversationWsRef = useRef<WebSocket | null>(null); // For conversation_{id}

  const API_URL = import.meta.env.VITE_API_URL;

  const getAuthUserAndToken = () => {
    const auth = localStorage.getItem('auth');
    if (!auth) return { userId: null, token: null };
    try {
      const parsed = JSON.parse(auth);
      const userId = parsed?.user?.id ?? null;
      const token = parsed?.user?.token ?? null;
      const initials = parsed?.user?.initials ?? null;
      const fullName = parsed?.user?.firstName +" " + parsed?.user?.lastName;
      const userEmail = parsed?.user?.email ?? null;
      return { userId, token, fullName, initials, userEmail };
    } catch {
      return { userId: null, token: null,fullName: null, initials: null, userEmail:null};
    }
  };

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { userId, token } = getAuthUserAndToken();
        if (!userId || !token) {
          // Handle unauthenticated state
        }
        const conversations = await getConversationsByUser(userId, token);
        console.log('Fetched conversations:', conversations);
        dispatch(setConversations(conversations));
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    const fetchAgents = async () => {
          setLoading(true);
          try {
            // Fetch active agents from the users subscription
            const activeSubscriptions  = await getActiveSubscriptionsByUser();
            const activeSubscription = activeSubscriptions ?.[0] || null;
            dispatch(setAgents(activeSubscription.agents || []));
          } catch (error) {
            // Optionally handle error (toast, etc.)
            dispatch(setAgents([]));
          } finally {
            setLoading(false);
          }
      };

    fetchAgents();
    fetchConversations();

    // 👇 Add WebSocket connection
    const { userId } = getAuthUserAndToken();
    // Connect to the WebSocket room for the selected conversation
    const ws = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws/user_${userId}_conversations`);
    globalWsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected to room:", `user_${userId}_conversations`);
    };

    ws.onmessage = async (event) => {
      try {
        const parsed = JSON.parse(event.data);
        console.log('New message received:', parsed);
        if (parsed.event === "new_conversation") {
          fetchConversations(); // reload conversation list

          // Refresh conversation list SO WE CAN GET the updated messages from the websocket using the dedicated conversation room
          const { userId, token } = getAuthUserAndToken();
          const updatedConversations = await getConversationsByUser(userId, token);
          // const updatedConversations = conversations;

          // try selecting the latest conversation created
          if (updatedConversations.length > 0) {
            const latestConversation = updatedConversations[0]; // You may sort/filter based on created_at
            console.log('Selecting latest conversation:', latestConversation);
            dispatch(setSelectedConversation(latestConversation));
          }

          setMessage('');
          setFile(null);

        } else {
          console.log('Unhandled WebSocket message:');
        }
      } catch {
        // If not JSON, just log
        console.log('Raw message:', event.data);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected from room:",`user_${userId}_conversations`);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // Cleanup on unmount or conversation change
    return () => {
      ws.close();
    };

  }, []);
  
  useEffect(() => {
    if (!selectedConversation) return;

    setMessages(selectedConversation.messages.map(msg => ({
        sender: msg.is_systen ? 'system' : selectedConversation.user_id === getAuthUserAndToken().userId ? 'user' : 'Unknonwn',
        content: msg.content,
        file: msg.file_path ? `${API_URL}/${msg.file_path.replace(/^\/+/, '')}` : null,
        sentAt: format(new Date(msg.sent_at), 'yyyy-MM-dd HH:mm:ss')
      })));

    // Close previous WebSocket if any
    if (conversationWsRef.current) {
      conversationWsRef.current.close();
    }

    // Connect to the WebSocket room for the selected conversation
    const ws = new WebSocket(`${API_URL.replace(/^http/, 'ws')}/ws/conversation_${selectedConversation.id}`);
    conversationWsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected to room:", `conversation_${selectedConversation.id}`);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('New message received:', message);
        dispatch(addMessageToConversation({
          conversationId: message.conversation_id,
          message,
        }));
      } catch {
        // If not JSON, just log
        console.log('Raw message:', event.data);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected from room:", `conversation_${selectedConversation.id}`);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
    };

    // Cleanup on unmount or conversation change
    return () => {
      ws.close();
    };
  // eslint-disable-next-line
  }, [selectedConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(e.target.value)
    const agent = agents.find((a) => a.id === selectedId)
    console.log(agent.name);
    setActiveAgent(agent || null);

    openNewConversation();
  }

  const openNewConversation=()=>{
    setMessage('');
    setMessages([]);
    setFile(null);
    dispatch(setSelectedConversation(null));
  }

  const handleSend = async () => {
    if (message.trim()) {
      setSending(true); // Start loading
      const { userId, token } = getAuthUserAndToken();
      // You need to know the current conversation ID; replace `currentConversationId` accordingly
      const currentConversationId = selectedConversation?.id; // <-- Replace with actual selected conversation ID

      try {
        await createMessage(message, currentConversationId, token, activeAgent.link,file);
      
        // Refresh conversation list SO WE CAN GET the updated messages from the websocket using the dedicated conversation room
        const updated = await getConversationsByUser(userId, token);
        dispatch(setConversations(updated));

        // If no conversation was selected, try selecting the latest one
        if (!selectedConversation) {
          const latestConv = updated[0]; // You may sort/filter based on created_at
          dispatch(setSelectedConversation(latestConv));
        }

        setMessage('');
        setFile(null);
      } catch (error) {
        console.error('Error sending message:', error);
        // Optionally: show a toast or error message to the user
      }finally{
        setSending(false); // Stop loading
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setRecording(!recording);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    // <div className={`min-h-screen overflow-y-auto ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
    <div className={`min-h-screen w-full overflow-x-hidden overflow-y-auto ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>

      {/* Eleven lab widget */}
      {/* <div className="flex justify-center p-4 bg-white shadow-sm">
        <elevenlabs-convai agent-id="3AV2tYqySsT8uWSEV2ay"></elevenlabs-convai>
      </div> */}
      <div >
        <elevenlabs-convai 
          agent-id={activeAgent?.eleven_labs_id}
          dynamic-variables={JSON.stringify({ user_id: getAuthUserAndToken().userId, user_email: getAuthUserAndToken().userEmail })}>
        </elevenlabs-convai>
      </div>

      {/* Workspace Header */}
      <div className={`flex items-center justify-between p-6 border-b ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-orange-100 border border-orange-200'
          }`}>
            <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-orange-600'}`}>F</span>
          </div>
          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Friday</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sun className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-yellow-500'}`} />
            <Switch 
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
              className="data-[state=checked]:bg-gray-600"
            />
            <Moon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>
      
      
      <div className="h-[calc(100vh-88px)] flex">
        {/* Sidebar */}
        <div className={`
          transition-all duration-300
          ${sidebarOpen ? 'w-80' : 'w-0'}
          border-r flex flex-col shadow-sm
          ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}
          relative
        `}>
          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`
              absolute top-4 right-[-16px] z-10 w-8 h-8 flex items-center justify-center
              rounded-full shadow bg-white border border-gray-300
              ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'text-gray-700'}
              hover:bg-orange-100
              transition-all
            `}
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            style={{ outline: 'none' }}
          >
            {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>

          {sidebarOpen && (
            <>
              {/* Sidebar Header */}
              {/* <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-orange-100 border border-orange-200'
                  }`}>
                    <span className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-orange-600'}`}>{getAuthUserAndToken().initials}</span>
                  </div>
                  <div>
                    <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getAuthUserAndToken().fullName}</div>
                    
                  </div>
                </div>
              </div> */}

              {/* AI Assistants */}
              <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('yourAiAssistant')}
                </h3>

                <select
                  value={activeAgent?.id || ""}
                 onChange={handleAgentChange}
                  disabled={agents.length === 0}
                  className={`w-full px-3 py-2 rounded-md border text-sm transition-colors outline-none
                    ${isDarkMode
                      ? 'bg-gray-800 text-white border-gray-600 focus:border-orange-500'
                      : 'bg-white text-gray-900 border-gray-300 focus:border-orange-400'
                    }`}
                >
                  <option value="" disabled>{t("viewYourAssistant")}</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recent Conversations */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t("recentConversations")}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
                    onClick={()=>openNewConversation()}
                    title={t("newChat")}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-3">
                  {conversations.map((conv) => {
                    const lastMessage = conv.messages && conv.messages.length > 0
                      ? conv.messages[conv.messages.length - 1]
                      : null;
                    return (
                      <div
                        key={conv.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation?.id === conv.id
                            ? isDarkMode
                              ? 'bg-orange-900 border border-orange-500 text-white'
                              : 'bg-orange-100 border border-orange-400 text-orange-900'
                            : isDarkMode
                              ? 'hover:bg-gray-800'
                              : 'hover:bg-gray-50'
                        }`}
                        onClick={() => dispatch(setSelectedConversation(conv))}
                      >
                        <div className={`font-medium text-sm mb-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {t("conversationNumber")}{conv.id}
                        </div>
                        <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {lastMessage
                            ? (lastMessage.is_systen ? t("system") : t("user"))
                            : t("noMessages")}
                        </div>
                        <div className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {lastMessage ? lastMessage.content : t("noMessagesYet")}
                        </div>
                        <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {lastMessage ? new Date(lastMessage.sent_at).toLocaleString() : new Date(conv.created_at).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
          
      
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className={`border-b p-6 shadow-sm ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t("aiWorkspace")}</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}></p>
              </div>
              {/* <Button variant="ghost" size="icon" className={`${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Settings className="w-5 h-5" />
              </Button> */}
            </div>
          </div>

          {/* Chat Messages Area */}
          <div 
            ref={chatScrollRef}
            className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} relative overflow-y-auto`}>
            {messages && messages?.length > 0 ? (
            // Chat message display
            <div className="flex flex-col gap-4 p-4">
              {messages.map((msg, index) => {
                const msgDate = format(new Date(msg.sentAt), 'yyyy-MM-dd');
                const prevMsgDate =
                  index > 0 ? format(new Date(messages[index - 1].sentAt), 'yyyy-MM-dd') : null;

                const showDateSeparator = msgDate !== prevMsgDate;

                return (
                  <div key={index} className="flex flex-col items-center gap-1">
                    {showDateSeparator && (
                      <div className="text-xs text-gray-500 py-1 px-2 rounded bg-gray-200 dark:bg-gray-600 dark:text-white my-2">
                        {format(new Date(msg.sentAt), 'PPP')}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm flex flex-col ${
                        msg.sender !== 'system'
                          ? `self-end ${isDarkMode ? 'bg-orange-500 text-white' : 'bg-orange-100 text-gray-900'}`
                          : `self-start ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`
                      }`}
                    >
                      <div>{msg.content}</div>
                      {/* File/Image preview inside the bubble */}
                        {msg.file && (
                          <div className="mt-2 w-full">
                            {typeof msg.file === 'string' && (msg.file as string).match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <a
                                href={msg.file as string}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full max-w-xs"
                                title="Click to view or download"
                              >
                                <img
                                  src={msg.file as string}
                                  alt="attachment"
                                  className="w-full h-32 object-cover rounded border border-gray-300 cursor-pointer"
                                />
                              </a>
                            ) : msg.file instanceof File && msg.file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                              <a
                                href={URL.createObjectURL(msg.file)}
                                download={msg.file.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full max-w-xs"
                                title="Click to view or download"
                              >
                                <img
                                  src={URL.createObjectURL(msg.file)}
                                  alt="attachment"
                                  className="w-full h-32 object-cover rounded border border-gray-300 cursor-pointer"
                                />
                              </a>
                            ) : (
                              <a
                                href={typeof msg.file === 'string' ? msg.file : undefined}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full max-w-xs h-12 flex items-center justify-center bg-gray-200 rounded border border-gray-300 text-xs text-gray-700 hover:bg-gray-300 mt-1"
                              >
                                File
                              </a>
                            )}
                          </div>
                        )}
                      <div className="text-[10px] text-right text-gray-400 mt-1">
                        {format(new Date(msg.sentAt), 'p')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            ) : (
              //  Placeholder for no messages
              <div className="h-full flex flex-col items-center justify-center p-4 sm:p-8 text-center w-full max-w-full overflow-hidden">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 border-4 relative overflow-hidden ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  {/* More discrete animated pulse rings with recording state */}
                  {recording ? (
                    <>
                      <div className="absolute inset-0 rounded-full animate-pulse bg-orange-500 opacity-20"></div>
                      <div className="absolute inset-2 rounded-full animate-pulse bg-orange-400 opacity-15 animation-delay-500"></div>
                      <div className="absolute inset-4 rounded-full animate-pulse bg-orange-300 opacity-10 animation-delay-1000"></div>
                    </>
                  ) : (
                    <>
                      <div className={`absolute inset-0 rounded-full animate-pulse opacity-10 ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute inset-2 rounded-full animate-pulse opacity-5 animation-delay-500 ${
                        isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                      }`}></div>
                    </>
                  )}
                  <Mic className={`w-12 h-12 relative z-10 transition-colors duration-300 ${
                    recording ? 'text-orange-500' : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </div>

                <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t("welcomeAiWorkspace")}</h2>
                <p className={`mb-6 sm:mb-8 text-center w-full px-4 max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {recording ? t("listening") : t("startConversation")}
                </p>

                {/* <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center items-center">
                  <Button 
                    onClick={toggleRecording}
                    className={`w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 transition-all duration-300 ${
                      recording ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {recording ? t("stopRecording") : t("startVoiceChat")}
                  </Button>
                  <Button 
                    variant="outline"
                    className={`w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 ${
                      isDarkMode ? 'bg-gray-800 hover:bg-orange-500' : 'bg-white hover:bg-orange-500'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    {t("typeMessage")}
                  </Button>
                </div> */}
              </div>

            )}
          </div>

          

          {/* Input Area */}
          <div className={`border-t p-6 ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-end gap-3 flex-wrap sm:flex-nowrap max-w-4xl mx-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleFileUpload}
                className={isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              
              <div className="flex-1 relative">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  onKeyPress={handleKeyPress}
                  placeholder={t("typeYourMessage")}
                  className={`min-h-[50px] resize-none border pr-12 focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:ring-orange-500 focus:border-orange-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                />

                {/* Animated sending indicator */}
                {sending && (
                  <div className="absolute left-3 bottom-2 flex items-center text-xs select-none">
                    <span className={isDarkMode ? "text-orange-300" : "text-orange-600"}>{t("searching")}</span>
                    <AnimatedSendingDots isDarkMode={isDarkMode} />
                  </div>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleRecording}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                    recording 
                      ? 'text-red-500' 
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  {recording && (
                    <div className="absolute inset-0 rounded-full border border-red-500 opacity-30 animate-pulse"></div>
                  )}
                </Button>
              </div>
              
              <Button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="h-[50px] px-6 disabled:opacity-50 bg-orange-500 text-white hover:bg-orange-600"
              >
                {sending ? (
                  // You can use any spinner icon here, e.g. a simple CSS spinner or a library spinner
                  <svg className="animate-spin h-4 w-4 mr-1" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {file && (
              <div className="flex flex-col items-center mb-2">
                <div className="relative">
                  {file.type.startsWith('image/') ? (
                    <a
                      href={URL.createObjectURL(file)}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      title="Click to view or download"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-10 h-10 object-cover rounded border border-gray-300 shadow cursor-pointer"
                      />
                    </a>
                  ) : (
                    <a
                      href={URL.createObjectURL(file)}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 flex items-center justify-center bg-gray-200 rounded border border-gray-300 shadow text-[10px] text-gray-700 cursor-pointer"
                      title="Click to download"
                    >
                      <span className="truncate px-1">{file.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
                    </a>
                  )}
                  { !sending && (<Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                    className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full shadow hover:bg-red-100"
                    title="Remove file"
                    style={{ width: 20, height: 20, minWidth: 20, minHeight: 20, padding: 0, fontSize: 14 }}
                  >
                    ×
                  </Button>)}
                </div>
                <span className="mt-1 text-[11px] text-gray-600 max-w-[80px] truncate text-center">{file.name}</span>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-1 mb-2 text-center">
              {t("onlyOneFile")}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFile(file);
                }
              }}
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Workspace;
