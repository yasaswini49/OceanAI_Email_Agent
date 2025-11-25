import React from "react";
import { Mail, CheckCircle, LogOut, Sparkles } from "lucide-react";

export default function Header({ isAuthenticated, onLogout }) {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-lg bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 border-b border-blue-500/20 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg">
                <Mail className="text-white" size={32} strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  OceanAI
                </h1>
                <Sparkles className="text-yellow-400" size={20} />
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Email Intelligence Platform
              </p>
            </div>
          </div>

          {/* Status Section */}
          <div className="flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-fadeIn">
                  <div className="flex items-center space-x-1">
                    <CheckCircle size={16} className="text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">
                      Connected
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>

                <button
                  onClick={onLogout}
                  className="group relative flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 text-red-300 rounded-lg hover:from-red-600/40 hover:to-pink-600/40 hover:border-red-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
                  title="Logout and link a different account"
                >
                  <LogOut
                    size={16}
                    className="group-hover:rotate-90 transition-transform duration-300"
                  />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="text-sm text-slate-400">Not authenticated</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
