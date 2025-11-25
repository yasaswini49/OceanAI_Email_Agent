import React from "react";
import {
  FileText,
  Trash2,
  Save,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DraftsPage({ drafts, setDrafts, sendDraft }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Email Drafts</h2>
        <span className="text-sm text-gray-600">{drafts.length} draft(s)</span>
      </div>

      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FileText size={64} className="mb-4" />
          <p className="text-lg">No drafts yet</p>
          <p className="text-sm mt-2">
            Generate replies from the inbox to create drafts
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">
                    To: {draft.recipient}
                  </p>
                  <p className="font-semibold text-gray-800">{draft.subject}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created: {new Date(draft.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setDrafts(drafts.filter((d) => d.id !== draft.id))
                  }
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="bg-gray-50 p-4 rounded border border-gray-200">
                <textarea
                  value={draft.body}
                  onChange={(e) => {
                    const updated = drafts.map((d) =>
                      d.id === draft.id ? { ...d, body: e.target.value } : d
                    );
                    setDrafts(updated);
                  }}
                  className="w-full border-0 bg-transparent resize-none min-h-[150px] focus:outline-none"
                />
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition flex items-center justify-center space-x-2">
                  <Save size={16} />
                  <span>Save Draft</span>
                </button>
                <button
                  onClick={() => sendDraft(draft)}
                  className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
                >
                  <Send size={16} />
                  <span>Send to Outlook</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
