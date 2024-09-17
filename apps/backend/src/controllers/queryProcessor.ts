import { DataSource } from 'typeorm';
import { pdfEmbedding } from '../entities/DocumentEmbedding';
import { embed } from 'ai';
import { ollama } from 'ollama-ai-provider';

// Function to create embeddings using Ollama
async function createEmbeddings(text: string): Promise<number[]> {
  const response = await embed({
      model: ollama.textEmbeddingModel('nomic-embed-text'),
      value: text,
  });
  return response.embedding as number[];
}

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to find semantic matches for a query
async function findSemanticMatches(queryEmbedding: number[], dataSource: DataSource, topK: number = 1) {
  const repository = dataSource.getRepository(pdfEmbedding);
  const allEmbeddings = await repository.find();

  const matches = allEmbeddings.map(embedding => ({
      id: embedding.id,
      similarity: cosineSimilarity(queryEmbedding, embedding.embedding),
      content: embedding.text
  })).sort((a, b) => b.similarity - a.similarity).slice(0, topK);

  return matches;
}

// Main function to process a user query, log the result, and return only the answer
export async function processQuery(query: string, dataSource: DataSource): Promise<string> {
  // Step 1: Embed the user query
  const queryEmbedding = await createEmbeddings(query);

  // Step 2: Retrieve semantic matches
  const semanticMatches = await findSemanticMatches(queryEmbedding, dataSource);

  // Step 3: Generate answer based on similarity data
  const answer = semanticMatches.map(match => `Similarity: ${match.similarity.toFixed(2)}\nContent: ${match.content}`).join('\n\n');

  // Log the answer
  console.log('Generated Answer:\n', answer);

  // Return only the answer
  return answer;
}
