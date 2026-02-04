const { pipeline } = require('@xenova/transformers');

// In-memory vector store (no external server needed!)
let vectorDatabase = [];
let embedder = null;

// Initialize the embedding model (runs once at startup)
async function initializeEmbeddings() {
  try {
    console.log('📦 Loading embedding model...');
    // Load a small, fast embedding model
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    console.log('✅ Embedding model loaded!');
    console.log('✅ Vector store ready (in-memory)!');
  } catch (error) {
    console.error('❌ Error loading embedding model:', error);
    throw error;
  }
}

// Generate embedding vector from text
async function generateEmbedding(text) {
  if (!embedder) {
    await initializeEmbeddings();
  }

  try {
    // Generate embedding
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    // Convert to array
    const embedding = Array.from(output.data);
    return embedding;
  } catch (error) {
    console.error('❌ Error generating embedding:', error);
    throw error;
  }
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Add a document to the vector store
async function addDocument(id, title, content) {
  try {
    // Combine title and content for better context
    const textToEmbed = `${title}\n\n${content}`;
    
    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);
    
    // Remove existing document with same ID (if any)
    vectorDatabase = vectorDatabase.filter(doc => doc.id !== id);
    
    // Add to in-memory database
    vectorDatabase.push({
      id,
      title,
      content,
      embedding,
      timestamp: new Date().toISOString()
    });
    
    console.log(`✅ Added document to vector store: "${title}" (Total docs: ${vectorDatabase.length})`);
    return true;
  } catch (error) {
    console.error('❌ Error adding document to vector store:', error);
    throw error;
  }
}

// Search for relevant documents using semantic search
async function searchDocuments(query, limit = 3) {
  try {
    if (vectorDatabase.length === 0) {
      console.log('ℹ️ Vector database is empty');
      return [];
    }

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    
    // Calculate similarity scores for all documents
    const results = vectorDatabase.map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding)
    }));
    
    // Sort by similarity (highest first) and take top N
    const topResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .filter(doc => doc.similarity > 0.3); // Only include if similarity > 0.3
    
    console.log(`🔍 Found ${topResults.length} relevant documents (searched ${vectorDatabase.length} total)`);
    
    return topResults;
  } catch (error) {
    console.error('❌ Error searching documents:', error);
    return [];
  }
}

// Delete a document from vector store
async function deleteDocument(id) {
  try {
    const initialLength = vectorDatabase.length;
    vectorDatabase = vectorDatabase.filter(doc => doc.id !== id);
    const deleted = initialLength > vectorDatabase.length;
    
    if (deleted) {
      console.log(`🗑️ Deleted document from vector store: ${id} (Remaining: ${vectorDatabase.length})`);
    } else {
      console.log(`⚠️ Document not found in vector store: ${id}`);
    }
    
    return deleted;
  } catch (error) {
    console.error('❌ Error deleting document:', error);
    return false;
  }
}

// Get stats about vector database
function getStats() {
  return {
    totalDocuments: vectorDatabase.length,
    documents: vectorDatabase.map(doc => ({
      id: doc.id,
      title: doc.title,
      timestamp: doc.timestamp
    }))
  };
}

// Initialize on module load
initializeEmbeddings().catch(console.error);

module.exports = {
  addDocument,
  searchDocuments,
  deleteDocument,
  generateEmbedding,
  getStats
};