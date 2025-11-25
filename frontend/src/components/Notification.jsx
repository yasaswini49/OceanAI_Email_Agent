import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export default function Notification({ notification, onClose }) {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const config = {
    success: {
      bg: "bg-gradient-to-r from-emerald-500/20 to-green-500/20",
      border: "border-emerald-500/50",
      icon: CheckCircle,
      color: "text-emerald-400",
      glow: "shadow-lg shadow-emerald-500/20",
    },
    error: {
      bg: "bg-gradient-to-r from-red-500/20 to-pink-500/20",
      border: "border-red-500/50",
      icon: AlertCircle,
      color: "text-red-400",
      glow: "shadow-lg shadow-red-500/20",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
      border: "border-amber-500/50",
      icon: AlertTriangle,
      color: "text-amber-400",
      glow: "shadow-lg shadow-amber-500/20",
    },
    info: {
      bg: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20",
      border: "border-blue-500/50",
      icon: Info,
      color: "text-blue-400",
      glow: "shadow-lg shadow-blue-500/20",
    },
  };

  const typeConfig = config[notification.type] || config.info;
  const Icon = typeConfig.icon;

  return (
    <div
      className={`fixed top-24 right-6 z-50 animate-slideInUp max-w-sm ${typeConfig.glow}`}
    >
      <div
        className={`backdrop-blur-lg ${typeConfig.bg} border ${typeConfig.border} rounded-lg p-4 flex items-start space-x-3`}
      >
        <Icon
          size={20}
          className={`flex-shrink-0 mt-0.5 ${typeConfig.color}`}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {notification.message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
