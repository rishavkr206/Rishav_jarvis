import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { KnowledgeBase } from './components/KnowledgeBase';
import { Settings } from './components/Settings';

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  file_type: string;
  created_at: string;
}

interface SettingsData {
  model_name: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
}

function App() {
  const [activeView, setActiveView] = useState<'chat' | 'knowledge' | 'settings'>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState('demo-user-id');

  useEffect(() => {
    loadConversations();
    loadDocuments();
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (data) {
      setConversations(data);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
    }
  };

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setDocuments(data);
    }
  };

  const loadSettings = async () => {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .maybeSingle();

    if (data) {
      setSettings(data);
    }
  };

  const handleNewConversation = async () => {
    const { data } = await supabase
      .from('conversations')
      .insert([{ user_id: userId, title: 'New Conversation' }])
      .select()
      .single();

    if (data) {
      setConversations([data, ...conversations]);
      setActiveConversationId(data.id);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);

    if (activeConversationId === id) {
      setActiveConversationId(null);
    }

    setConversations(conversations.filter((c) => c.id !== id));
  };

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return;

    setIsLoading(true);

    // 1. Save user message to Supabase
    const userMessage = {
      conversation_id: activeConversationId,
      role: 'user' as const,
      content,
    };

    const { data: userMsg } = await supabase
      .from('messages')
      .insert([userMessage])
      .select()
      .single();

    if (userMsg) {
      setMessages([...messages, userMsg]);
    }

    // 2. Update conversation title if needed
    const conversationTitle = conversations.find(c => c.id === activeConversationId)?.title;
    if (conversationTitle === 'New Conversation' && messages.length === 0) {
      const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
      await supabase
        .from('conversations')
        .update({ title: newTitle, updated_at: new Date().toISOString() })
        .eq('id', activeConversationId);

      setConversations(
        conversations.map((c) =>
          c.id === activeConversationId ? { ...c, title: newTitle } : c
        )
      );
    }

    // 3. Call your backend LLM API (LM Studio)
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.slice(-5).map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from backend');
      }

      const data = await response.json();
      const aiResponse = data.response;

      // 4. Save AI response to Supabase
      const assistantMessage = {
        conversation_id: activeConversationId,
        role: 'assistant' as const,
        content: aiResponse,
      };

      const { data: assistantMsg } = await supabase
        .from('messages')
        .insert([assistantMessage])
        .select()
        .single();

      if (assistantMsg) {
        setMessages((prev) => [...prev, assistantMsg]);
      }

    } catch (error) {
      console.error('Error calling LLM:', error);

      // Show error message to user
      const errorMessage = {
        conversation_id: activeConversationId,
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please make sure the backend server is running on http://localhost:3001',
      };

      const { data: errorMsg } = await supabase
        .from('messages')
        .insert([errorMessage])
        .select()
        .single();

      if (errorMsg) {
        setMessages((prev) => [...prev, errorMsg]);
      }
    }

    setIsLoading(false);
  };

  const handleAddDocument = async (title: string, content: string) => {
    const { data } = await supabase
      .from('documents')
      .insert([{ user_id: userId, title, content, file_type: 'text' }])
      .select()
      .single();

    if (data) {
      setDocuments([data, ...documents]);

      // Also add to vector store for semantic search
      try {
        await fetch('http://localhost:3001/api/documents/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.id,
            title: data.title,
            content: data.content
          })
        });
        console.log('✅ Document added to vector store');
      } catch (error) {
        console.error('❌ Error adding to vector store:', error);
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocuments(documents.filter((d) => d.id !== id));

    // Also delete from vector store
    try {
      await fetch('http://localhost:3001/api/documents/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      console.log('✅ Document deleted from vector store');
    } catch (error) {
      console.error('❌ Error deleting from vector store:', error);
    }
  };

  const handleSaveSettings = async (newSettings: SettingsData) => {
    if (settings) {
      await supabase
        .from('settings')
        .update({ ...newSettings, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } else {
      await supabase
        .from('settings')
        .insert([{ ...newSettings, user_id: userId }]);
    }

    setSettings(newSettings);
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      {activeView === 'chat' && (
        <ChatInterface
          conversationId={activeConversationId}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      )}
      {activeView === 'knowledge' && (
        <KnowledgeBase
          documents={documents}
          onAddDocument={handleAddDocument}
          onDeleteDocument={handleDeleteDocument}
        />
      )}
      {activeView === 'settings' && (
        <Settings settings={settings} onSaveSettings={handleSaveSettings} />
      )}
    </div>
  );
}

export default App;