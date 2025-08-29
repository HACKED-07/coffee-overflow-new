import { User, Leaf } from "lucide-react";

interface MessageProps {
  message: {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
  };
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderBasicMarkdown(text: string): string {
  // Escape HTML first to avoid XSS
  let html = escapeHtml(text);

  // Basic Markdown replacements (order matters)
  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  html = html.replace(/(^|\s)\*(?!\*)([^*]+?)\*(?=\s|$)/g, '$1<em>$2</em>');
  // Inline code: `code`
  html = html.replace(/`([^`]+?)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-foreground/90">$1</code>');
  // Links: [text](url)
  html = html.replace(/\[([^\]]+?)\]\((https?:[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline text-primary hover:opacity-80">$1</a>');
  // Line breaks for single newlines
  html = html.replace(/\n/g, '<br/>');

  return html;
}

export const Message = ({ message }: MessageProps) => {
  const isBot = message.sender === "bot";
  const formattedHtml = renderBasicMarkdown(message.content);
  
  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isBot ? "" : "flex-row-reverse"}`}>
      {/* Avatar */}
      <div className={`p-2 rounded-full ${isBot ? "bg-primary" : "gradient-eco-primary"}`}>
        {isBot ? (
          <Leaf className="h-4 w-4 text-white" />
        ) : (
          <User className="h-4 w-4 text-white" />
        )}
      </div>
      
      {/* Message bubble */}
      <div
        className={`p-4 rounded-2xl max-w-xs md:max-w-md lg:max-w-lg ${
          isBot
            ? "bg-chat-bot-bg text-chat-bot-fg rounded-bl-md"
            : "bg-chat-user-bg text-chat-user-fg rounded-br-md"
        }`}
      >
        <div className="text-sm leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formattedHtml }} />
        <p className={`text-xs mt-2 opacity-70 ${isBot ? "text-muted-foreground" : "text-white/70"}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};
