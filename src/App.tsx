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

    setTimeout(async () => {
      const aiResponse = generateMockResponse(content, documents);

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

      setIsLoading(false);
    }, 1000);
  };

  const generateMockResponse = (userMessage: string, docs: Document[]): string => {
    const lowerMessage = userMessage.toLowerCase();

    const relevantDocs = docs.filter(doc =>
      doc.content.toLowerCase().includes(lowerMessage) ||
      lowerMessage.split(' ').some(word =>
        word.length > 3 && doc.content.toLowerCase().includes(word)
      )
    );

    if (relevantDocs.length > 0) {
      return `Based on the knowledge base, here's what I found:\n\n${relevantDocs[0].content.slice(0, 200)}...\n\nIs there anything specific you'd like to know more about?`;
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm JARVIS, your personal AI assistant. I'm powered by a self-hosted LLM and can help you with information retrieval, analysis, and more. How can I assist you today?";
    }

    if (lowerMessage.includes('what can you do') || lowerMessage.includes('help')) {
      return "I can help you with:\n\n• Answering questions using my knowledge base\n• Analyzing and discussing various topics\n• Retrieving information from uploaded documents\n• Providing contextual responses based on our conversation\n\nYou can also add documents to my knowledge base to enhance my capabilities!";
    }

    return "I understand your query. In a production environment, I would process this using the configured LLM model and vector database to provide contextually relevant information. For now, this is a demonstration of the JARVIS interface. Try adding documents to the knowledge base for more contextual responses!";
  };

  const handleAddDocument = async (title: string, content: string) => {
    const { data } = await supabase
      .from('documents')
      .insert([{ user_id: userId, title, content, file_type: 'text' }])
      .select()
      .single();

    if (data) {
      setDocuments([data, ...documents]);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    await supabase.from('documents').delete().eq('id', id);
    setDocuments(documents.filter((d) => d.id !== id));
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
