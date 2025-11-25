import React from "react";
import { Mail, Star, AlertCircle } from "lucide-react";

export default function EmailList({
  emails = [],
  selectedEmail,
  onSelect,
  filterCategory,
  getCategoryColor,
  formatDate,
}) {
  const filtered =
    filterCategory === "all"
      ? emails
      : emails.filter((e) => e.category === filterCategory);

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Mail size={40} className="opacity-50 mb-3" />
          <p className="text-sm font-medium">No emails found</p>
          <p className="text-xs opacity-75">Try adjusting your filters</p>
        </div>
      ) : (
        filtered.map((email) => (
          <div
            key={email.id}
            onClick={() => onSelect(email)}
            className={`group relative p-4 backdrop-blur-lg rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-102 overflow-hidden ${
              selectedEmail?.id === email.id
                ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 border border-blue-400/50 shadow-lg shadow-blue-500/20 scale-102"
                : "bg-slate-800/30 border border-white/10 hover:bg-slate-800/50 hover:border-blue-400/30 shadow-md hover:shadow-lg hover:shadow-blue-500/10"
            }`}
          >
            {/* Hover Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-indigo-600/0 group-hover:from-blue-600/10 group-hover:to-indigo-600/10 transition-all duration-300 pointer-events-none"></div>

            <div className="relative">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                      <Mail size={18} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-white truncate">
                      {email.from || "Unknown Sender"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap ml-2 font-medium">
                  {formatDate(email.receivedDateTime).split(",")[0]}
                </span>
              </div>

              <p className="text-sm font-medium text-slate-200 truncate-2 mb-3 leading-tight">
                {email.subject}
              </p>

              <div className="flex items-center justify-between">
                {email.category && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm ${getCategoryColor(
                      email.category
                    )}`}
                  >
                    {email.category}
                  </span>
                )}
                {email.importance === "high" && (
                  <AlertCircle size={14} className="text-red-400" />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
