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
  if (vecA.length !== vecB.length) {
    throw new Error("Vectors must be the same length for cosine similarity");
  }
  
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;  // Return 0 if one of the magnitudes is 0 to avoid division by zero
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to find semantic matches for a query with a similarity threshold
async function findSemanticMatches(queryEmbedding: number[], dataSource: DataSource, topK: number = 1, similarityThreshold: number = 0.9) {
  const repository = dataSource.getRepository(pdfEmbedding);
  const allEmbeddings = await repository.find();

  if (allEmbeddings.length === 0) {
    return [];
  }

  // Filter matches based on similarity threshold
  const matches = allEmbeddings
    .map(embedding => ({
      id: embedding.id,
      similarity: cosineSimilarity(queryEmbedding, embedding.embedding),
      content: embedding.text
    }))
    .filter(match => match.similarity >= similarityThreshold) // Keep only matches above the threshold
    .sort((a, b) => b.similarity - a.similarity)  // Sort by highest similarity
    .slice(0, topK); // Return top K results

  return matches;
}

// Main function to process a user query and return relevant content
export async function processQuery(query: string, dataSource: DataSource): Promise<string> {
  // Step 1: Embed the user query
  const queryEmbedding = await createEmbeddings(query);

  // Step 2: Retrieve semantic matches with a threshold of 50% similarity
  const semanticMatches = await findSemanticMatches(queryEmbedding, dataSource, 4, 0.5);

  // Step 3: Handle case where no matches are found
  if (semanticMatches.length === 0) {
    console.log('No matches found.');
    return 'No matches found in the database.';
  }

  // Step 4: Generate answer based on similarity data
  const answer = semanticMatches.map(match => `Similarity: ${match.similarity.toFixed(2)}\nContent: ${match.content}`).join('\n\n');

  // Log the answer
  console.log('Generated Answer:\n', answer);

  // Return only the answer
  return answer;
}
