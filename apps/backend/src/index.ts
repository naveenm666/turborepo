import axios from 'axios';
import pdfParse from 'pdf-parse';
import { embed } from 'ai';
import { ollama } from 'ollama-ai-provider';
import { DataSource } from 'typeorm';
import { PdfEmbedding } from './entities/PdfEmbedding';
import { Buffer } from 'buffer';

// Function to download and read PDF from URL
async function splitPdf(fileUrl: string): Promise<string[]> {
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const pdfBuffer = Buffer.from(response.data);
  const data = await pdfParse(pdfBuffer);
  const text = data.text;
  // Split text into pages or sections if needed
  return [text]; // Adjust this to split text into separate pages if necessary
}

// Function to create embeddings
async function createEmbeddings(text: string): Promise<number[]> {
  const response = await embed({
    model: ollama.textEmbeddingModel('nomic-embed-text'),
    value: text,
  });
  return response.embedding;
}

// Function to store embeddings in database
async function storeEmbedding(pageNumber: number, text: string, embedding: number[], dataSource: DataSource) {
  const repository = dataSource.getRepository(PdfEmbedding);
  const pdfEmbedding = new PdfEmbedding();
  pdfEmbedding.pageNumber = pageNumber;
  pdfEmbedding.text = text;
  pdfEmbedding.embedding = embedding;
  await repository.save(pdfEmbedding);
}

// Main function to process PDF
async function processPdf(pdfUrl: string, dataSource: DataSource) {
  try {
    const pdfContent = await splitPdf(pdfUrl);

    for (let i = 0; i < pdfContent.length; i++) {
      const pageText = pdfContent[i];
      const embedding = await createEmbeddings(pageText);
      await storeEmbedding(i + 1, pageText, embedding, dataSource);
    }

    console.log('PDF processed and stored successfully');
  } catch (error) {
    console.error('Error processing PDF:', error);
  }
}

// Example usage
const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
  entities: [PdfEmbedding],
  synchronize: true,
});

dataSource.initialize().then(() => {
  const pdfUrl = 'https://www.tutorialspoint.com/expressjs/expressjs_tutorial.pdf'; // Example PDF URL
  processPdf(pdfUrl, dataSource);
}).catch((error) => console.error('Error initializing data source:', error));
