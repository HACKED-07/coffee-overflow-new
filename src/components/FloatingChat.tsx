import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import ChatInterface from "./ChatInterface";

export const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleChat = () => {
    if (isOpen && isMinimized) {
      setIsMinimized(false);
    } else {
      setIsOpen(!isOpen);
      setIsMinimized(false);
    }
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={toggleChat}
          size="icon"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isMinimized ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                EcoBot
              </span>
            </div>
            <Button
              onClick={toggleChat}
              size="icon"
              variant="ghost"
              className="h-6 w-6"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={closeChat}
              size="icon"
              variant="ghost"
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Sticky Top Bar */}
          <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 p-4 border-b border-green-400 dark:border-green-600 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">EcoBot 🌍</h3>
                  <p className="text-sm text-white/90">Your environmental companion</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={minimizeChat}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white/90 hover:text-white hover:bg-white/10"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={closeChat}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white/90 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Chat Interface - Adjusted height to account for header */}
          <div className="w-96 h-[calc(500px-88px)] overflow-hidden">
            <ChatInterface />
          </div>
        </div>
      )}
    </div>
  );
};
