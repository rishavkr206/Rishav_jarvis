import { MessageSquare, BookOpen, Settings, Plus, Trash2 } from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface SidebarProps {
  activeView: 'chat' | 'knowledge' | 'settings';
  setActiveView: (view: 'chat' | 'knowledge' | 'settings') => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  activeView,
  setActiveView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}: SidebarProps) {
  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          JARVIS
        </h1>
        <p className="text-xs text-slate-400 mt-1">Your AI Assistant</p>
      </div>

      <nav className="flex flex-col gap-1 p-3 border-b border-slate-800">
        <button
          onClick={() => setActiveView('chat')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeView === 'chat'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <MessageSquare size={18} />
          <span className="text-sm font-medium">Chat</span>
        </button>
        <button
          onClick={() => setActiveView('knowledge')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeView === 'knowledge'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <BookOpen size={18} />
          <span className="text-sm font-medium">Knowledge Base</span>
        </button>
        <button
          onClick={() => setActiveView('settings')}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
            activeView === 'settings'
              ? 'bg-cyan-600 text-white'
              : 'text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </nav>

      {activeView === 'chat' && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-800">
            <button
              onClick={onNewConversation}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-4">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-slate-800'
                        : 'hover:bg-slate-800/50'
                    }`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <p className="text-sm text-slate-200 truncate pr-6">
                      {conv.title}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-3 border-t border-slate-800">
        <div className="text-xs text-slate-500">
          <p>Powered by LLaMA</p>
          <p className="mt-1">Self-hosted AI</p>
        </div>
      </div>
    </div>
  );
}
