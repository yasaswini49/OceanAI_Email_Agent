import React from "react";
import { Bot, MessageSquare, Send } from "lucide-react";

export default function AgentPage({
  selectedEmail,
  chatMessages,
  setChatMessages,
  chatInput,
  setChatInput,
  handleChat,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Bot className="mr-2 text-indigo-600" size={28} />
        AI Email Assistant (Powered by Cohere)
      </h2>

      <div className="border border-gray-200 rounded-lg mb-4 p-4 bg-gray-50">
        <p className="text-sm text-gray-600">
          {selectedEmail
            ? `Currently discussing: "${selectedEmail.subject}"`
            : "Ask me anything about your emails, get summaries, or request actions."}
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg mb-4 h-[450px] overflow-y-auto p-4 bg-gray-50">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare size={48} className="mb-3" />
            <p>Start a conversation with your AI assistant</p>
            <p className="text-sm mt-2">
              Try: "Summarize my inbox" or "Show urgent emails"
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-white border border-gray-200 text-gray-800"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleChat()}
          placeholder="Ask about your emails..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
        />
        <button
          onClick={handleChat}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
