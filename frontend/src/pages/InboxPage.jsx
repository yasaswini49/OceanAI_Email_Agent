import React from "react";
import {
  Mail,
  Send,
  MessageSquare,
  User,
  Clock,
  Tag,
  AlertCircle,
} from "lucide-react";
import EmailList from "../components/EmailList";

export default function InboxPage({
  emails = [],
  selectedEmail,
  setSelectedEmail,
  filterCategory,
  setFilterCategory,
  getCategoryColor,
  formatDate,
  generateDraft,
  isProcessing,
  setCurrentPage,
  setChatMessages,
}) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 bg-white rounded-lg shadow-md p-4">
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">Filter by Category</h2>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Emails ({emails.length})</option>
            <option value="Work">Work</option>
            <option value="Meetings">Meetings</option>
            <option value="Clients">Clients</option>
            <option value="Newsletters">Newsletters</option>
            <option value="HR">HR</option>
            <option value="Financial">Financial</option>
            <option value="Alerts">Alerts</option>
            <option value="Spam">Spam</option>
          </select>
        </div>
        <EmailList
          emails={emails}
          selectedEmail={selectedEmail}
          onSelect={setSelectedEmail}
          filterCategory={filterCategory}
          getCategoryColor={getCategoryColor}
          formatDate={formatDate}
        />
      </div>
      <div className="col-span-2 bg-white rounded-lg shadow-md p-6">
        {selectedEmail ? (
          <>
            <div className="mb-6 pb-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User size={16} />
                      <span>{selectedEmail.from}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{formatDate(selectedEmail.receivedDateTime)}</span>
                    </div>
                  </div>
                </div>
                {selectedEmail.category && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                      selectedEmail.category
                    )}`}
                  >
                    <Tag size={14} className="inline mr-1" />
                    {selectedEmail.category}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed max-h-96 overflow-y-auto">
                {selectedEmail.body}
              </p>
            </div>
            {selectedEmail.actionItems &&
              selectedEmail.actionItems.length > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                    <AlertCircle size={18} className="mr-2" />
                    Action Items
                  </h3>
                  <div className="space-y-2">
                    {selectedEmail.actionItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded border border-yellow-200"
                      >
                        <p className="font-medium text-gray-800">{item.task}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-gray-600">
                            Deadline: {item.deadline}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              item.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : item.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
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
            <div className="flex space-x-3">
              {selectedEmail.category !== "Spam" && (
                <button
                  onClick={() => generateDraft(selectedEmail)}
                  disabled={isProcessing}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Send size={18} />
                  <span>Generate Reply</span>
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
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center space-x-2"
              >
                <MessageSquare size={18} />
                <span>Ask Agent</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Mail size={64} className="mb-4" />
            <p className="text-lg">Select an email to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
