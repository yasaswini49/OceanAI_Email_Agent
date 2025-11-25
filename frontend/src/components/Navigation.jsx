import React from "react";
import { Home, Inbox, Bot, FileText } from "lucide-react";

export default function Navigation({ currentPage, setCurrentPage }) {
  const items = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "inbox",
      label: "Inbox",
      icon: Inbox,
      color: "from-indigo-500 to-blue-500",
    },
    {
      id: "agent",
      label: "AI Assistant",
      icon: Bot,
      color: "from-purple-500 to-indigo-500",
    },
    {
      id: "drafts",
      label: "Drafts",
      icon: FileText,
      color: "from-pink-500 to-purple-500",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="backdrop-blur-lg bg-gradient-to-r from-slate-800/40 to-slate-900/40 border border-white/10 rounded-xl p-1 shadow-xl">
        <div className="grid grid-cols-4 gap-2 sm:gap-1">
          {items.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setCurrentPage(id)}
              className={`relative group overflow-hidden py-3 px-4 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                currentPage === id
                  ? `bg-gradient-to-r ${color} text-white shadow-lg shadow-blue-500/50 scale-105`
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {/* Hover Background Effect */}
              {currentPage !== id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}

              <div className="relative flex flex-col items-center justify-center space-y-1">
                <Icon
                  className={`transition-transform duration-300 ${
                    currentPage === id ? "scale-125" : "group-hover:scale-110"
                  }`}
                  size={20}
                />
                <span className="text-xs sm:text-sm font-semibold">
                  {label}
                </span>
              </div>

              {/* Active Indicator */}
              {currentPage === id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
