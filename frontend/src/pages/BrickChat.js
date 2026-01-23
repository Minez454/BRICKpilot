import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu, Send, LogOut, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BrickChat() {
  const { user, token, logout } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/chat/message`,
        { message: input, session_id: sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSessionId(res.data.session_id);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: res.data.response }
      ]);

      if (res.data.dossier_updated) {
        toast.success("Your dossier has been updated!");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{background: 'linear-gradient(135deg, #f0fdf4 0%, #fef3c7 100%)'}} data-testid="brick-chat-page">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b-2 border-emerald-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-emerald-700" data-testid="menu-button">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetTitle className="text-2xl font-bold text-emerald-700 mb-6">BRICK Menu</SheetTitle>
              <div className="space-y-3">
                <Button 
                  onClick={() => navigate("/brick")} 
                  variant="ghost" 
                  className="w-full justify-start text-lg hover:bg-emerald-50"
                  data-testid="menu-brick"
                >
                  <Sparkles className="mr-2 h-5 w-5 text-emerald-600" />
                  BRICK AI
                </Button>
                <Button 
                  onClick={() => navigate("/resources")} 
                  variant="ghost" 
                  className="w-full justify-start text-lg hover:bg-rose-50"
                  data-testid="menu-resources"
                >
                  Resources Map
                </Button>
                <Button 
                  onClick={() => navigate("/vault")} 
                  variant="ghost" 
                  className="w-full justify-start text-lg hover:bg-purple-50"
                  data-testid="menu-vault"
                >
                  The Vault
                </Button>
                <Button 
                  onClick={() => navigate("/workbook")} 
                  variant="ghost" 
                  className="w-full justify-start text-lg hover:bg-blue-50"
                  data-testid="menu-workbook"
                >
                  My Workbook
                </Button>
                <Button 
                  onClick={() => navigate("/legal")} 
                  variant="ghost" 
                  className="w-full justify-start text-lg hover:bg-amber-50"
                  data-testid="menu-legal"
                >
                  Legal Aid
                </Button>
                <Button 
                  onClick={() => navigate("/dossier")} 
                  variant="ghost" 
                  className="w-full justify-start text-lg hover:bg-pink-50"
                  data-testid="menu-dossier"
                >
                  My Dossier
                </Button>
                {user?.role === "caseworker" && (
                  <Button 
                    onClick={() => navigate("/caseworker")} 
                    variant="ghost" 
                    className="w-full justify-start text-lg hover:bg-indigo-50"
                    data-testid="menu-caseworker"
                  >
                    Dashboard
                  </Button>
                )}
                <hr className="my-4" />
                <Button 
                  onClick={logout} 
                  variant="ghost" 
                  className="w-full justify-start text-lg text-red-600 hover:bg-red-50"
                  data-testid="menu-logout"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <h1 className="text-2xl font-bold text-emerald-700" data-testid="header-title">BRICK</h1>
            <p className="text-xs text-emerald-600">Your AI Caseworker</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700" data-testid="user-name">{user?.full_name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4 py-6" ref={scrollRef} data-testid="chat-messages-area">
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto text-center py-12">
              <div className="inline-block p-6 rounded-full bg-emerald-100 mb-6">
                <Sparkles className="w-16 h-16 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4" data-testid="welcome-title">
                Welcome back, {user?.full_name?.split(' ')[0]}!
              </h2>
              <p className="text-lg text-gray-600 mb-2">
                I'm BRICK, your AI caseworker here to support you.
              </p>
              <p className="text-base text-gray-500 max-w-2xl mx-auto">
                I'm trauma-responsive and knowledgeable about Las Vegas resources and Clark County law. 
                I'll help you navigate housing, legal issues, healthcare, and benefits. 
                As we talk, I'll automatically build your Dossier and create personalized Workbook tasks.
              </p>
              <div className="mt-8 grid gap-3 max-w-xl mx-auto">
                <Card className="p-4 text-left border-emerald-200 hover:border-emerald-400 cursor-pointer transition-all" onClick={() => setInput("I need help finding a shelter tonight")}>
                  <p className="text-sm font-medium">💚 "I need help finding a shelter tonight"</p>
                </Card>
                <Card className="p-4 text-left border-rose-200 hover:border-rose-400 cursor-pointer transition-all" onClick={() => setInput("I received an eviction notice, what should I do?")}>
                  <p className="text-sm font-medium">💗 "I received an eviction notice, what should I do?"</p>
                </Card>
                <Card className="p-4 text-left border-blue-200 hover:border-blue-400 cursor-pointer transition-all" onClick={() => setInput("I'm a veteran, what services are available for me?")}>
                  <p className="text-sm font-medium">💙 "I'm a veteran, what services are available for me?"</p>
                </Card>
              </div>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-assistant'}`}
                data-testid={`message-${msg.role}-${idx}`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            ))}
            {loading && (
              <div className="message-bubble message-assistant" data-testid="loading-indicator">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse">BRICK is thinking...</div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="border-t-2 border-emerald-200 bg-white/90 backdrop-blur-md p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message to BRICK..."
            className="flex-1 border-2 border-emerald-300 focus:border-emerald-500 rounded-full px-6"
            disabled={loading}
            data-testid="chat-input"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn-emerald rounded-full px-8"
            data-testid="send-message-btn"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
