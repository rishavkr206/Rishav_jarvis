# 🤖 JARVIS - Your Personal AI Assistant

A self-hosted AI assistant powered by LLaMA 2 with RAG (Retrieval Augmented Generation) capabilities. Built as a programming assignment demonstrating advanced AI integration, vector databases, and full-stack development.

![JARVIS Interface](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![LLM](https://img.shields.io/badge/LLM-LLaMA%202%207B-blue)
![RAG](https://img.shields.io/badge/RAG-Enabled-orange)

## 🌟 Features

- 🤖 **Self-Hosted LLM**: Runs LLaMA 2 7B locally via LM Studio
- 🧠 **RAG System**: Semantic search with vector embeddings
- 💬 **Conversational AI**: Multi-turn conversations with context
- 📚 **Knowledge Base**: Upload and query custom documents
- 🎨 **Modern UI**: Beautiful React + TypeScript interface
- 🔒 **Privacy First**: All data stays on your machine (except Supabase metadata)
- ⚡ **Real-time**: Fast responses with local inference

## 🏗️ Architecture

```
┌─────────────────┐
│   React UI      │  ← Frontend (Vite + TypeScript)
│  (localhost:5173)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Node.js API    │  ← Backend (Express.js)
│ (localhost:3001)│
└────┬────────┬───┘
     │        │
     ▼        ▼
┌─────────┐ ┌──────────────┐
│Supabase │ │  LM Studio   │  ← LLaMA 2 7B
│Database │ │(localhost:1234)│
└─────────┘ └──────────────┘
     │              │
     ▼              ▼
 Conversations   Vector Store
   Messages      (In-Memory)
  Documents      Embeddings
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite, TailwindCSS |
| **Backend** | Node.js, Express.js |
| **LLM** | LLaMA 2 7B Chat (via LM Studio) |
| **Vector DB** | Custom in-memory store with cosine similarity |
| **Embeddings** | Xenova/all-MiniLM-L6-v2 |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Self-hosted (local development) |

## 📋 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **LM Studio** ([Download](https://lmstudio.ai/))
- **Supabase Account** ([Sign up](https://supabase.com/))
- **Git** ([Download](https://git-scm.com/))

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/Rishav_jarvis.git
cd Rishav_jarvis
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Set Up Supabase Database

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to **SQL Editor** and run:

```sql
-- Create tables
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  model_name TEXT DEFAULT 'llama-2-7b-chat',
  temperature DECIMAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  system_prompt TEXT DEFAULT 'You are JARVIS, a helpful AI assistant.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for development
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
```

### 4. Configure Environment Variables

Create `.env` file in the **root directory**:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from Supabase Dashboard → Settings → API

### 5. Download and Run LM Studio

1. Download [LM Studio](https://lmstudio.ai/)
2. Install and open LM Studio
3. Download **LLaMA 2 7B Chat** model
4. Go to **"Local Server"** tab
5. Load the model
6. Click **"Start Server"**
7. Ensure it runs on `http://localhost:1234`

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 7. Open JARVIS

Navigate to: **http://localhost:5173**

## 📖 Usage

### 💬 Chat with JARVIS

1. Click **"+ New Chat"**
2. Type your message
3. Get AI-powered responses!

### 📚 Add Knowledge to Knowledge Base

1. Click **"Knowledge Base"** in sidebar
2. Click **"+ Add Document"**
3. Enter title and content
4. Documents are automatically indexed with vector embeddings

### 🔍 RAG in Action

When you ask questions, JARVIS:
1. Searches your knowledge base using semantic search
2. Finds relevant documents
3. Injects context into the LLM prompt
4. Provides informed, accurate responses

**Example:**
```
You: What are Python best practices?
JARVIS: According to the knowledge base, Python best practices include...
```

## 🧪 Testing RAG

### Test Semantic Search:

```bash
curl -X POST http://localhost:3001/api/documents/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Python coding standards", "limit": 3}'
```

### Test Chat Endpoint:

```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are Python best practices?"}'
```

## 📁 Project Structure

```
Rishav_jarvis/
├── backend/
│   ├── server.js           # Express API server
│   ├── vectorStore.js      # Vector database & RAG
│   ├── package.json
│   └── .env
├── src/
│   ├── App.tsx             # Main React component
│   ├── components/         # UI components
│   ├── lib/                # Utilities (Supabase client)
│   └── main.tsx
├── public/
├── .env                    # Supabase credentials
├── package.json
├── vite.config.ts
└── README.md
```

## 🔐 Security Notes

- ⚠️ **Never commit `.env` files!**
- ✅ `.env` is in `.gitignore`
- ✅ All API keys are environment variables
- ✅ Supabase RLS disabled for development (enable for production!)

## 🚀 Deployment

### Backend
- Deploy to **Railway**, **Render**, or **Fly.io**

### Frontend
- Deploy to **Vercel**, **Netlify**, or **Cloudflare Pages**

### LM Studio
- For production, consider cloud LLM APIs (OpenAI, Anthropic) or self-host on GPU server

## 🎯 Assignment Requirements Met

✅ **Self-hosted Large Language Model (LLM)** - LLaMA 2 via LM Studio  
✅ **Vector Database** - In-memory vector store with embeddings  
✅ **RAG Implementation** - Semantic search + context injection  
✅ **Conversational Interface** - Multi-turn chat UI  
✅ **Knowledge Storage & Retrieval** - Document management with vector search  
✅ **Chatbot UI** - Beautiful React interface  



## 🤝 Contributing

This is a programming assignment project. Contributions are welcome for educational purposes!

## 📄 License

MIT License - Feel free to use for learning!

## 👨‍💻 Author

**Rishav Kumar**  
- GitHub: [@rishavkr206](https://github.com/rishavkr206)
- Assignment: Build Your Own JARVIS (Diligent Corporation)

## 🙏 Acknowledgments

- **LM Studio** for easy local LLM hosting
- **Meta AI** for LLaMA 2
- **Xenova/Transformers.js** for browser-based embeddings
- **Supabase** for database infrastructure

---

**Built with ❤️ using self-hosted AI**
