const express = require('express');
const cors = require('cors');
const axios = require('axios');
const vectorStore = require('./vectorStore');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const LM_STUDIO_URL = 'http://127.0.0.1:1234/v1';

// Function to query LM Studio
// Updated function to query LLM with RAG context
async function queryLLMWithContext(userMessage, conversationHistory = [], contextText = '') {
  try {
    // Build system message with context if available
    let systemMessage = 'You are JARVIS, a helpful and intelligent AI assistant. Provide clear, concise, and helpful responses.';
    
    if (contextText) {
      systemMessage += '\n\nIMPORTANT: Use the following information from the knowledge base to answer the user\'s question. If the information is relevant, reference it in your answer. If it\'s not relevant, you can provide a general response.';
      systemMessage += contextText;
    }

    const messages = [
      {
        role: 'system',
        content: systemMessage,
      },
      ...conversationHistory.slice(-5), // Last 5 messages for context
      {
        role: 'user',
        content: userMessage,
      },
    ];

    console.log('📤 Sending to LM Studio:', { 
      messageCount: messages.length,
      hasContext: contextText.length > 0 
    });

    const response = await axios.post(`${LM_STUDIO_URL}/chat/completions`, {
      model: 'llama-2-7b-chat',
      messages: messages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: false,
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('LLM Error:', error.response?.data || error.message);
    throw new Error('Failed to get response from LLM: ' + (error.response?.data?.error || error.message));
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'Backend is running!',
        lmStudioUrl: LM_STUDIO_URL,
        timestamp: new Date().toISOString()
    });
});

// Test LM Studio connection
app.get('/api/test-llm', async (req, res) => {
    try {
        const response = await axios.get(`${LM_STUDIO_URL}/models`);
        res.json({
            status: 'LM Studio connected!',
            models: response.data
        });
    } catch (error) {
        res.status(500).json({
            status: 'Cannot connect to LM Studio',
            error: error.message,
            tip: 'Make sure LM Studio server is running on http://localhost:1234'
        });
    }
});

// Chat endpoint
// Chat endpoint with RAG (Retrieval Augmented Generation)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log(`\n💬 User message: ${message}`);

    // 🔍 STEP 1: Search for relevant documents in vector database
    console.log('🔍 Searching knowledge base...');
    const relevantDocs = await vectorStore.searchDocuments(message, 3);
    
    // 🧠 STEP 2: Build context from retrieved documents
    let contextText = '';
    if (relevantDocs.length > 0) {
      console.log(`✅ Found ${relevantDocs.length} relevant documents`);
      contextText = '\n\nRelevant information from knowledge base:\n';
      relevantDocs.forEach((doc, idx) => {
        contextText += `\n[Document ${idx + 1}: ${doc.title}]\n${doc.content}\n`;
      });
    } else {
      console.log('ℹ️ No relevant documents found');
    }

    // 🤖 STEP 3: Send to LLM with augmented context
    const response = await queryLLMWithContext(message, conversationHistory, contextText);

    res.json({ response });
  } catch (error) {
    console.error('❌ Chat error:', error.message);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 JARVIS Backend Server Started!');
    console.log('='.repeat(50));
    console.log(`📡 Server running on: http://localhost:${PORT}`);
    console.log(`🤖 LM Studio URL: ${LM_STUDIO_URL}`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`❤️  Health check: http://localhost:${PORT}/api/health`);
    console.log('='.repeat(50) + '\n');
});

// Add document to knowledge base AND vector store
app.post('/api/documents/add', async (req, res) => {
  try {
    const { id, title, content } = req.body;

    if (!id || !title || !content) {
      return res.status(400).json({ error: 'ID, title, and content are required' });
    }

    // Add to vector store for semantic search
    await vectorStore.addDocument(id, title, content);

    res.json({ 
      success: true, 
      message: 'Document added to vector store',
      id 
    });
  } catch (error) {
    console.error('❌ Error adding document:', error);
    res.status(500).json({ 
      error: 'Failed to add document',
      details: error.message 
    });
  }
});

// Delete document from vector store
app.post('/api/documents/delete', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    await vectorStore.deleteDocument(id);

    res.json({ 
      success: true, 
      message: 'Document deleted from vector store' 
    });
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    res.status(500).json({ 
      error: 'Failed to delete document',
      details: error.message 
    });
  }
});

// Search documents endpoint (for testing)
app.post('/api/documents/search', async (req, res) => {
  try {
    const { query, limit = 3 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await vectorStore.searchDocuments(query, limit);

    res.json({ 
      results,
      count: results.length 
    });
  } catch (error) {
    console.error('❌ Error searching documents:', error);
    res.status(500).json({ 
      error: 'Failed to search documents',
      details: error.message 
    });
  }
});