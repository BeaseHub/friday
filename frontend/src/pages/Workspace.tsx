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
import { getActiveAgents } from '@/api/agentApi';
import { format } from 'date-fns';
import { io, Socket } from 'socket.io-client';



const Workspace = () => {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [selectedAgent, setSelectedAgent] = useState('Creative Canvas');
  const [recording, setRecording] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { conversations, selectedConversation } = useAppSelector((state) => state.chat);
  const { agents,filteredAgents, selectedAgents} = useAppSelector((state) => state.agent);  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<
    { sender: string; content: string; file?: File | null, sentAt:string }[]
  >([]);

  const socketRef = useRef<Socket | null>(null);

  const getAuthUserAndToken = () => {
    const auth = localStorage.getItem('auth');
    if (!auth) return { userId: null, token: null };
    try {
      const parsed = JSON.parse(auth);
      const userId = parsed?.user?.id ?? null;
      const token = parsed?.user?.token ?? null;
      const initials = parsed?.user?.initials ?? null;
      const fullName = parsed?.user?.firstName +" " + parsed?.user?.lastName;
      return { userId, token, fullName, initials };
    } catch {
      return { userId: null, token: null,fullName: null, initials: null};
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
            // Fetch active agents from the API
            const agents = await getActiveAgents();
            dispatch(setAgents(agents || []));
  
          } catch (error) {
            // Optionally handle error (toast, etc.)
            dispatch(setAgents([]));
          } finally {
            setLoading(false);
          }
      };

    fetchAgents();
    fetchConversations();
  }, []);

  useEffect(() => {
    const { token } = getAuthUserAndToken();
    if (!token) return;

    // Connect to Socket.IO server
    socketRef.current = io(import.meta.env.VITE_API_URL, {
      auth: { token }
    });

    // Listen for new messages
    socketRef.current.on('new_message', (message) => {
      dispatch(addMessageToConversation({
        conversationId: message.conversation_id,
        message,
      }));
    });

    // Cleanup on unmount
    return () => {
      socketRef.current?.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  //update the messages in the view when a new conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      setMessages(selectedConversation.messages.map(msg => ({
        sender: msg.is_systen ? 'system' : selectedConversation.user_id === getAuthUserAndToken().userId ? 'user' : 'Unknonwn',
        content: msg.content,
        file: msg.file_path ? new File([], msg.file_path) : null,
        sentAt: format(new Date(msg.sent_at), 'yyyy-MM-dd HH:mm:ss')
      })));
    }
  }, [selectedConversation]);

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleSend = async () => {
    if (message.trim()) {
      const { userId, token } = getAuthUserAndToken();
      // You need to know the current conversation ID; replace `currentConversationId` accordingly
      const currentConversationId = selectedConversation?.id; // <-- Replace with actual selected conversation ID

      try {
        await createMessage(message, currentConversationId, token);
        // Optionally: refresh messages or update UI here
        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        // Optionally: show a toast or error message to the user
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
    <div className={`h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Workspace Header */}
      <div className={`flex items-center justify-between p-6 border-b ${
        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center space-x-2">
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
          <Button 
            onClick={() => navigate('/')}
            variant="ghost"
            className={`${isDarkMode ? 'text-gray-300 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
      
      <div className="h-[calc(100vh-88px)] flex">
        {/* Sidebar */}
        <div className={`w-80 border-r flex flex-col shadow-sm ${
          isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Sidebar Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
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
          </div>

          {/* AI Assistants */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Your AI Assistant
            </h3>

            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className={`w-full px-3 py-2 rounded-md border text-sm transition-colors outline-none
                ${isDarkMode
                  ? 'bg-gray-800 text-white border-gray-600 focus:border-orange-500'
                  : 'bg-white text-gray-900 border-gray-300 focus:border-orange-400'
                }`}
            >
              <option value="" disabled>View your assistant...</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.name}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Recent Conversations */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Recent Conversations</h3>
              <Settings className={`w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`} />
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
                      Conversation #{conv.id}
                    </div>
                    <div className={`text-xs mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {lastMessage ? (lastMessage.is_systen ? 'System' : 'User') : 'No messages'}
                    </div>
                    <div className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {lastMessage ? lastMessage.content : 'No messages yet'}
                    </div>
                    <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                      {lastMessage ? new Date(lastMessage.sent_at).toLocaleString() : new Date(conv.created_at).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className={`border-b p-6 shadow-sm ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>AI Workspace</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Currently chatting with {selectedAgent}</p>
              </div>
              <Button variant="ghost" size="icon" className={`${
                isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {messages && messages?.length > 0 ? (
              //  Chat message display
              <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
                {messages.map((msg, index) => {
                  const msgDate = format(new Date(msg.sentAt), 'yyyy-MM-dd'); // Adjust based on your timestamp format
                  const prevMsgDate =
                    index > 0 ? format(new Date(messages[index - 1].sentAt), 'yyyy-MM-dd') : null;

                  const showDateSeparator = msgDate !== prevMsgDate;

                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
                      {showDateSeparator && (
                        <div className="text-xs text-gray-500 py-1 px-2 rounded bg-gray-200 dark:bg-gray-600 dark:text-white my-2">
                          {format(new Date(msg.sentAt), 'PPP')} {/* e.g. Jan 1, 2025 */}
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-lg shadow text-sm ${
                          msg.sender !== 'user'
                            ? `self-end ${isDarkMode ? 'bg-orange-500 text-white' : 'bg-orange-100 text-gray-900'}`
                            : `self-start ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'}`
                        }`}
                      >
                        <div>{msg.content}</div>
                        <div className="text-[10px] text-right text-gray-400 mt-1">
                          {format(new Date(msg.sentAt), 'p')} {/* e.g. 10:25 AM */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              //  Placeholder for no messages
              <div className="h-full flex flex-col items-center justify-center p-8">
                <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 border-4 relative overflow-hidden ${
                  isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  {/* More discrete animated pulse rings with recording state */}
                  {recording ? (
                    <>
                      {/* Subtle recording rings with reduced opacity */}
                      <div className="absolute inset-0 rounded-full animate-pulse bg-orange-500 opacity-20"></div>
                      <div className="absolute inset-2 rounded-full animate-pulse bg-orange-400 opacity-15 animation-delay-500"></div>
                      <div className="absolute inset-4 rounded-full animate-pulse bg-orange-300 opacity-10 animation-delay-1000"></div>
                    </>
                  ) : (
                    <>
                      {/* Idle state rings */}
                      <div className={`absolute inset-0 rounded-full animate-pulse opacity-10 ${
                        isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                      }`}></div>
                      <div className={`absolute inset-2 rounded-full animate-pulse opacity-5 animation-delay-500 ${
                        isDarkMode ? 'bg-gray-500' : 'bg-gray-400'
                      }`}></div>
                    </>
                  )}
                  <Mic className={`w-12 h-12 relative z-10 transition-colors duration-300 ${
                    recording 
                      ? 'text-orange-500' 
                      : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                  }`} />
                </div>
                
                <h2 className={`text-2xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Welcome to your AI Workspace</h2>
                <p className={`mb-8 text-center max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {recording ? 'Listening... Speak now!' : `Start a conversation with ${selectedAgent} using voice or text`}
                </p>

                <div className="flex gap-4">
                  <Button 
                    onClick={toggleRecording}
                    className={`px-6 py-3 flex items-center gap-2 transition-all duration-300 ${
                      recording 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                    {recording ? 'Stop Recording' : 'Start Voice Chat'}
                  </Button>
                  <Button 
                    variant="outline"
                    className={`px-6 py-3 flex items-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-gray-800 hover:bg-orange-500' 
                        : 'bg-white hover:bg-orange-500'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    Type Message
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className={`border-t p-6 ${
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-end gap-3 max-w-4xl mx-auto">
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
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your message to ${selectedAgent}...`}
                  className={`min-h-[50px] resize-none border pr-12 focus:ring-2 ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:ring-orange-500 focus:border-orange-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-orange-500 focus:border-orange-500'
                  }`}
                />
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
                disabled={!message.trim()}
                className="h-[50px] px-6 disabled:opacity-50 bg-orange-500 text-white hover:bg-orange-600"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log('File selected:', file.name);
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
