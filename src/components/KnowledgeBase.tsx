import { useState } from 'react';
import { Plus, FileText, Trash2, Search, Upload } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  file_type: string;
  created_at: string;
}

interface KnowledgeBaseProps {
  documents: Document[];
  onAddDocument: (title: string, content: string) => void;
  onDeleteDocument: (id: string) => void;
}

export function KnowledgeBase({
  documents,
  onAddDocument,
  onDeleteDocument,
}: KnowledgeBaseProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDocTitle.trim() && newDocContent.trim()) {
      onAddDocument(newDocTitle.trim(), newDocContent.trim());
      setNewDocTitle('');
      setNewDocContent('');
      setShowAddModal(false);
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Knowledge Base
              </h2>
              <p className="text-slate-600 mt-1">
                Manage documents and information for JARVIS to reference
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg hover:from-cyan-700 hover:to-blue-800 transition-all font-medium"
            >
              <Plus size={18} />
              Add Document
            </button>
          </div>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-slate-50"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Upload size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {searchQuery
                  ? 'No documents found'
                  : 'No documents yet'}
              </h3>
              <p className="text-slate-600 mb-6">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add documents to build your knowledge base'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Add Your First Document
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <FileText size={16} className="text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800 truncate">
                        {doc.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                    {doc.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{doc.file_type}</span>
                    <span>
                      {new Date(doc.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                Add New Document
              </h3>
              <p className="text-slate-600 mt-1">
                Add information for JARVIS to reference
              </p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g., Company Overview, Product Specs..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  placeholder="Enter the document content..."
                  rows={10}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                  required
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewDocTitle('');
                    setNewDocContent('');
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg hover:from-cyan-700 hover:to-blue-800 transition-all"
                >
                  Add Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
