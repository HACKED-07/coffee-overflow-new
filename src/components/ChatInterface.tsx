import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Leaf } from "lucide-react";
import { Message } from "@/components/Message";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatInterface = () => {
  // Always start with a fresh welcome message
  const getInitialMessages = (): ChatMessage[] => {
    return [{
      id: "welcome",
      content: "🌍 Hello! I'm your environment-friendly assistant. How can I help you make our planet greener today? 🌱",
      sender: "bot",
      timestamp: new Date(),
    }];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // API call to your Python backend
  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling backend:', error);
      throw new Error('🌱 Sorry, I\'m having trouble connecting right now. Make sure your Python backend is running on http://localhost:8000! 🌿');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      // Call your Python backend
      const botResponseText = await getBotResponse(messageToSend);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponseText,
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : "🌱 Something went wrong. Please try again! 🌿",
        sender: "bot",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex items-start gap-3 animate-slide-up">
            <div className="p-2 bg-primary rounded-full">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <div className="bg-chat-bot-bg text-chat-bot-fg p-4 rounded-2xl rounded-bl-md max-w-xs">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-gentle"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-gentle" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-gentle" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
        <div className="flex gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about eco-friendly tips... 🌱"
            className="flex-1 rounded-full border-primary/20 focus:border-primary bg-background/50"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="rounded-full gradient-eco-primary hover:shadow-eco transition-all duration-200 hover:scale-105"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
