import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  RefreshCw,
  LogIn,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Header from "../components/Header";
import Navigation from "../components/Navigation";
import Notification from "../components/Notification";
import InboxPage from "./InboxPage";
import AgentPage from "./AgentPage";
import DraftsPage from "./DraftsPage";
import { getCategoryColor, calculateStats } from "../utils/helpers";

const API_BASE_URL = "http://localhost:5000/api";

const OceanAIEmailAgent = () => {
  const [currentPage, setCurrentPage] = useState("home");
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [prompts, setPrompts] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    important: 0,
    spam: 0,
    todos: 0,
  });

  useEffect(() => {
    checkAuthStatus();
    loadPrompts();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`);
      const data = await response.json();
      setIsAuthenticated(data.authenticated);
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const loadPrompts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/prompts`);
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error("Failed to load prompts:", error);
    }
  };

  const handleMSGraphAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success && data.verification_uri && data.user_code) {
        // Open Microsoft device login page
        window.open(data.verification_uri, "_blank");
        showNotification(
          "info",
          `Enter code ${data.user_code} in the opened Microsoft page (expires in ${data.expires_in}s)`
        );
        // Begin polling for completion
        pollAuthCompletion();
      } else if (!data.success) {
        showNotification(
          "error",
          data.error || "Authentication initiation failed"
        );
      } else {
        showNotification("error", "Unexpected authentication response");
      }
    } catch (error) {
      showNotification("error", "Authentication failed");
    }
  };

  const pollAuthCompletion = () => {
    let attempts = 0;
    const maxAttempts = 120; // ~10 minutes @5s
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/login/status`);
        const statusData = await res.json();
        if (statusData.status === "authenticated") {
          clearInterval(interval);
          setIsAuthenticated(true);
          showNotification(
            "success",
            "Microsoft account connected successfully"
          );
        } else if (statusData.status === "error") {
          clearInterval(interval);
          showNotification(
            "error",
            statusData.message || "Authentication error"
          );
        } else if (attempts % 6 === 0) {
          // periodic reminder every 30s
          showNotification(
            "info",
            "Waiting for you to complete Microsoft authentication..."
          );
        }
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          showNotification(
            "error",
            "Authentication timed out. Please try again."
          );
        }
      } catch (e) {
        clearInterval(interval);
        showNotification("error", "Failed to poll authentication status");
      }
    }, 5000);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(false);
        setEmails([]);
        setSelectedEmail(null);
        setDrafts([]);
        setChatMessages([]);
        showNotification(
          "success",
          "Successfully logged out. You can now login with a different account."
        );
      }
    } catch (error) {
      showNotification("error", "Logout failed");
    }
  };

  const fetchEmails = async () => {
    if (!isAuthenticated) {
      showNotification("error", "Please authenticate with Microsoft first");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/emails/fetch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 20 }),
      });

      const data = await response.json();
      if (data.success) {
        setEmails(data.emails);
        showNotification("success", "Fetched emails from Outlook");
        setStats(calculateStats(data.emails));
      }
    } catch (error) {
      showNotification("error", "Failed to fetch emails");
    } finally {
      setIsProcessing(false);
    }
  };

  const processEmails = async () => {
    if (emails.length === 0) {
      showNotification(
        "error",
        "No emails to process. Please fetch emails first."
      );
      return;
    }

    setIsProcessing(true);
    showNotification("info", "Processing emails with Cohere AI...");

    try {
      const response = await fetch(`${API_BASE_URL}/emails/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      const data = await response.json();
      if (data.success) {
        setEmails(data.processed_emails);
        setStats(calculateStats(data.processed_emails));
        showNotification("success", "All emails processed successfully!");
      }
    } catch (error) {
      showNotification("error", "Processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const generateDraft = async (email) => {
    if (email.category === "Spam") {
      showNotification("info", "Reply generation skipped for spam emails");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/emails/generate-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        setDrafts([...drafts, data.draft]);
        showNotification("success", "Draft generated successfully!");
        setCurrentPage("drafts");
      }
    } catch (error) {
      showNotification("error", "Failed to generate draft");
    } finally {
      setIsProcessing(false);
    }
  };

  const sendDraft = async (draft) => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/send-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      const data = await response.json();
      if (data.success) {
        showNotification("success", "Reply sent successfully via Outlook");
        // Remove draft after sending
        setDrafts((prev) => prev.filter((d) => d.id !== draft.id));
      } else {
        showNotification("error", data.error || "Failed to send reply");
      }
    } catch (e) {
      showNotification("error", "Network error while sending reply");
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    const inputValue = chatInput;
    setChatInput("");

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputValue,
          context: {
            emails,
            selectedEmail,
            stats,
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        const assistantMessage = { role: "assistant", content: data.response };
        setChatMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      showNotification("error", "Chat failed");
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const HomePage = () => (
    <div className="space-y-12">
      {/* Hero Section - Marine Theme */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-blue-900/10 to-transparent pointer-events-none"></div>
        <div className="relative backdrop-blur-lg bg-gradient-to-br from-blue-900/30 via-slate-900/20 to-indigo-900/30 border border-cyan-400/20 rounded-3xl p-12 md:p-16">
          <div className="text-center">
            <div className="inline-block mb-6 px-4 py-2 bg-cyan-500/20 border border-cyan-400/50 rounded-full">
              <p className="text-sm font-semibold text-cyan-300">
                🌊 Welcome Aboard
              </p>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent mb-4">
              OceanAI Email Agent
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Navigate your inbox with intelligent precision
            </p>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Harness the power of advanced AI to classify, organize, and
              respond to your emails with ease
            </p>
          </div>
        </div>
      </div>

      {!isAuthenticated && (
        <div className="mb-8 animate-slideInUp">
          <div className="relative overflow-hidden backdrop-blur-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent pointer-events-none"></div>
            <div className="relative flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-amber-500/20">
                  <AlertCircle className="text-amber-400" size={24} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-amber-300">
                  Authorization Required
                </h3>
                <p className="text-sm text-amber-200 mt-1">
                  Connect your Microsoft Outlook account to unlock the power of
                  OceanAI's intelligent email management
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Dashboard - Marine Theme */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Emails Card */}
        <div className="group relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-400/30 rounded-2xl p-8 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-blue-600/0 group-hover:from-cyan-500/5 group-hover:to-blue-600/5 transition-all duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-cyan-300 uppercase tracking-wide">
                Total Emails
              </h3>
              <div className="p-3 bg-cyan-500/20 rounded-xl">
                <Mail className="text-cyan-400" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold text-cyan-300 font-mono">
              {stats.total}
            </p>
            <div className="mt-4 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full w-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Important Card */}
        <div className="group relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-rose-500/10 to-red-600/10 border border-rose-400/30 rounded-2xl p-8 hover:border-rose-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 via-transparent to-red-600/0 group-hover:from-rose-500/5 group-hover:to-red-600/5 transition-all duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wide">
                Important
              </h3>
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <AlertCircle className="text-rose-400" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold text-rose-300 font-mono">
              {stats.important}
            </p>
            <div className="mt-4 h-1 bg-gradient-to-r from-rose-500 to-red-600 rounded-full w-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Action Items Card */}
        <div className="group relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-400/30 rounded-2xl p-8 hover:border-emerald-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-teal-600/0 group-hover:from-emerald-500/5 group-hover:to-teal-600/5 transition-all duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wide">
                Action Items
              </h3>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <CheckCircle className="text-emerald-400" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold text-emerald-300 font-mono">
              {stats.todos}
            </p>
            <div className="mt-4 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full w-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        {/* Spam Blocked Card */}
        <div className="group relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-slate-500/10 to-gray-600/10 border border-slate-400/30 rounded-2xl p-8 hover:border-slate-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-slate-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/0 via-transparent to-gray-600/0 group-hover:from-slate-500/5 group-hover:to-gray-600/5 transition-all duration-300"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">
                Spam Blocked
              </h3>
              <div className="p-3 bg-slate-500/20 rounded-xl">
                <AlertCircle className="text-slate-400" size={24} />
              </div>
            </div>
            <p className="text-4xl font-bold text-slate-300 font-mono">
              {stats.spam}
            </p>
            <div className="mt-4 h-1 bg-gradient-to-r from-slate-500 to-gray-600 rounded-full w-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="backdrop-blur-lg bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-white/10 rounded-2xl p-8">
        <div className="mb-8">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent mb-2">
            Quick Actions
          </h3>
          <p className="text-slate-400 text-sm">
            Manage your emails with ease using intelligent tools
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isAuthenticated ? (
            <button
              onClick={handleMSGraphAuth}
              className="group relative overflow-hidden py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/50 flex items-center justify-center space-x-2"
            >
              <LogIn
                size={20}
                className="group-hover:rotate-12 transition-transform"
              />
              <span>Connect Outlook</span>
            </button>
          ) : (
            <>
              <button
                onClick={fetchEmails}
                disabled={isProcessing}
                className="group relative overflow-hidden py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 flex items-center justify-center space-x-2"
              >
                <RefreshCw
                  size={20}
                  className={
                    isProcessing
                      ? "animate-spin"
                      : "group-hover:rotate-180 transition-transform duration-300"
                  }
                />
                <span>{isProcessing ? "Fetching..." : "Fetch Emails"}</span>
              </button>
              <button
                onClick={processEmails}
                disabled={isProcessing || emails.length === 0}
                className="group relative overflow-hidden py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 flex items-center justify-center space-x-2"
              >
                <Settings
                  size={20}
                  className={
                    isProcessing
                      ? "animate-spin"
                      : "group-hover:rotate-90 transition-transform duration-300"
                  }
                />
                <span>{isProcessing ? "Processing..." : "Process Emails"}</span>
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentPage("inbox")}
            className="group relative overflow-hidden py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 flex items-center justify-center space-x-2"
          >
            <Mail size={20} className="group-hover:bounce transition-all" />
            <span>View Inbox</span>
          </button>
          <button
            onClick={() => setCurrentPage("agent")}
            className="group relative overflow-hidden py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg hover:shadow-xl hover:shadow-orange-500/50 flex items-center justify-center space-x-2"
          >
            <AlertCircle
              size={20}
              className="group-hover:scale-125 transition-transform"
            />
            <span>AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Features Showcase - Marine Theme */}
      <div className="backdrop-blur-lg bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-cyan-400/20 rounded-2xl p-12">
        <div className="mb-12">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent mb-2">
            Intelligent Features
          </h3>
          <p className="text-slate-400">
            Powered by advanced AI and marine-inspired design
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group relative overflow-hidden p-8 backdrop-blur-lg bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-400/30 rounded-2xl hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-blue-600/0 group-hover:from-cyan-500/10 group-hover:to-blue-600/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-cyan-500/20 rounded-xl">
                <Mail
                  className="text-cyan-400 group-hover:scale-125 transition-transform duration-300"
                  size={32}
                />
              </div>
              <h4 className="text-xl font-bold text-cyan-300 mb-2">
                Email Classification
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Intelligent AI-powered categorization of emails into organized
                buckets for effortless management
              </p>
              <div className="mt-4 h-1 w-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="group relative overflow-hidden p-8 backdrop-blur-lg bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-400/30 rounded-2xl hover:border-emerald-400/60 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-teal-600/0 group-hover:from-emerald-500/10 group-hover:to-teal-600/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-emerald-500/20 rounded-xl">
                <Send
                  className="text-emerald-400 group-hover:scale-125 transition-transform duration-300"
                  size={32}
                />
              </div>
              <h4 className="text-xl font-bold text-emerald-300 mb-2">
                Smart Replies
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                AI-generated professional responses that match your tone and
                context automatically
              </p>
              <div className="mt-4 h-1 w-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="group relative overflow-hidden p-8 backdrop-blur-lg bg-gradient-to-br from-purple-500/10 to-pink-600/10 border border-purple-400/30 rounded-2xl hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-transparent to-pink-600/0 group-hover:from-purple-500/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
            <div className="relative">
              <div className="mb-4 inline-block p-4 bg-purple-500/20 rounded-xl">
                <AlertCircle
                  className="text-purple-400 group-hover:scale-125 transition-transform duration-300"
                  size={32}
                />
              </div>
              <h4 className="text-xl font-bold text-purple-300 mb-2">
                AI Assistant
              </h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                Interactive chat with your intelligent email agent for questions
                and assistance
              </p>
              <div className="mt-4 h-1 w-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full group-hover:w-full transition-all duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Notification notification={notification} />
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="max-w-7xl mx-auto px-6 pb-6">
        {currentPage === "home" && <HomePage />}
        {currentPage === "inbox" && (
          <InboxPage
            emails={emails}
            selectedEmail={selectedEmail}
            setSelectedEmail={setSelectedEmail}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            getCategoryColor={getCategoryColor}
            formatDate={formatDate}
            generateDraft={generateDraft}
            isProcessing={isProcessing}
            setCurrentPage={setCurrentPage}
            setChatMessages={setChatMessages}
          />
        )}
        {currentPage === "agent" && (
          <AgentPage
            selectedEmail={selectedEmail}
            chatMessages={chatMessages}
            setChatMessages={setChatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            handleChat={handleChat}
          />
        )}
        {currentPage === "drafts" && (
          <DraftsPage
            drafts={drafts}
            setDrafts={setDrafts}
            sendDraft={sendDraft}
          />
        )}
      </div>
    </div>
  );
};

export default OceanAIEmailAgent;
