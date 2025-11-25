import React from "react";
import {
  User,
  Clock,
  Tag,
  AlertCircle,
  Send,
  MessageSquare,
  Zap,
} from "lucide-react";

export default function EmailDetail({
  selectedEmail,
  getCategoryColor,
  formatDate,
  generateDraft,
  isProcessing,
  setCurrentPage,
  setChatMessages,
}) {
  if (!selectedEmail) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Section */}
      <div className="backdrop-blur-lg bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-white/10 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent mb-4">
              {selectedEmail.subject}
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-slate-300">
              <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <User size={16} className="text-blue-400" />
                <span className="font-medium">{selectedEmail.from}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg border border-white/10">
                <Clock size={16} className="text-amber-400" />
                <span className="font-medium">
                  {formatDate(selectedEmail.receivedDateTime)}
                </span>
              </div>
            </div>
          </div>
          {selectedEmail.category && (
            <div
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 backdrop-blur-sm ${getCategoryColor(
                selectedEmail.category
              )}`}
            >
              <Tag size={16} />
              <span>{selectedEmail.category}</span>
            </div>
          )}
        </div>
      </div>

      {/* Email Body */}
      <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-white/10 rounded-xl p-6">
        <p className="text-slate-200 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto custom-scrollbar text-justify">
          {selectedEmail.body}
        </p>
      </div>

      {/* Action Items Section */}
      {selectedEmail.actionItems && selectedEmail.actionItems.length > 0 && (
        <div className="backdrop-blur-lg bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
          <h3 className="font-bold text-amber-300 mb-4 flex items-center space-x-2 text-lg">
            <Zap size={20} />
            <span>Action Items</span>
          </h3>
          <div className="space-y-3">
            {selectedEmail.actionItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-amber-500/20 rounded-lg p-4 hover:bg-white/10 transition-all duration-300"
              >
                <p className="font-semibold text-white mb-3">{item.task}</p>
                <div className="flex flex-wrap gap-3 items-center text-sm">
                  <span className="text-slate-400">
                    Deadline:{" "}
                    <span className="text-slate-200 font-medium">
                      {item.deadline}
                    </span>
                  </span>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${
                      item.priority === "High"
                        ? "bg-red-500/20 border border-red-500/50 text-red-300"
                        : item.priority === "Medium"
                        ? "bg-amber-500/20 border border-amber-500/50 text-amber-300"
                        : "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {selectedEmail.category !== "Spam" && (
          <button
            onClick={() => generateDraft(selectedEmail)}
            disabled={isProcessing}
            className="flex-1 relative group overflow-hidden py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50"
          >
            {isProcessing ? (
              <>
                <div className="inline-block animate-spin mr-2">⚡</div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Send size={18} className="inline mr-2" />
                <span>Generate Reply</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={() => {
            setCurrentPage("agent");
            setChatMessages([
              {
                role: "assistant",
                content: `I can help you with "${selectedEmail.subject}". What would you like to know?`,
              },
            ]);
          }}
          className="flex-1 relative group overflow-hidden py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50"
        >
          <MessageSquare size={18} className="inline mr-2" />
          <span>Ask Agent</span>
        </button>
      </div>
    </div>
  );
}
