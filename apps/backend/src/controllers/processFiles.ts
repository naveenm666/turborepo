import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { pdfEmbedding } from '../entities/DocumentEmbedding';
import axios from 'axios';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ollama } from 'ollama-ai-provider';
import { embed } from 'ai';

// Function to download a file from a URL
// async function downloadFile(url: string, localPath: string) {
//   const response = await axios.get(url, { responseType: 'arraybuffer' });
//   fs.writeFileSync(localPath, response.data);
// }

// Function to load document content based on file type
async function loadDocument(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  let loader;

  switch (extension) {
    case '.pdf':
      loader = new PDFLoader(filePath);
      break;
    case '.docx':
      loader = new DocxLoader(filePath);
      break;
    case '.txt':
      loader = new TextLoader(filePath);
      break;
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }

  return await loader.load();
}

// Function to split documents into chunks
async function splitDocuments(docs: any[]) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000, // Size of each chunk
    chunkOverlap: 200, // Overlap between chunks
  });
  return await textSplitter.splitDocuments(docs);
}

// Function to create embeddings using Ollama
async function createEmbeddings(text: string): Promise<number[]> {
  const response = await embed({
    model: ollama.textEmbeddingModel('nomic-embed-text'),
    value: text,
  });
  return response.embedding as number[];
}

// Function to store embeddings in the database
async function storeEmbedding(
  fileName: string,
  chunkIndex: number,
  text: string,
  embedding: number[],
  dataSource: DataSource
) {
  const repository = dataSource.getRepository(pdfEmbedding);
  const documentEmbedding = new pdfEmbedding();
  documentEmbedding.fileName = fileName;
  documentEmbedding.chunkIndex = chunkIndex;
  documentEmbedding.text = text;
  documentEmbedding.embedding = embedding;
  await repository.save(documentEmbedding);
}

// Main function to process files from URL or local directory
export async function processFiles(urlOrDirectory: string, dataSource: DataSource) {
  try {
    const stats = fs.statSync(urlOrDirectory);

    if (stats.isFile()) {
      // Handle local file
      console.log(`Processing local file: ${urlOrDirectory}`);
      const fileName = path.basename(urlOrDirectory);
      const localPath = path.join(__dirname, fileName);

      // Determine file type and load accordingly
      let docs;
      if (fileName.endsWith('.pdf')) {
        const loader = new PDFLoader(urlOrDirectory);
        docs = await loader.load();
      } else if (fileName.endsWith('.docx')) {
        const loader = new DocxLoader(urlOrDirectory);
        docs = await loader.load();
      } else if (fileName.endsWith('.txt')) {
        const loader = new TextLoader(urlOrDirectory);
        docs = await loader.load();
      } else {
        throw new Error(`Unsupported file type: ${fileName}`);
      }

      // Split documents into chunks
      const splits = await splitDocuments(docs);

      // Create embeddings and store in the database
      for (let i = 0; i < splits.length; i++) {
        const chunkText = splits[i].pageContent;
        const embedding = await createEmbeddings(chunkText);

        await storeEmbedding(fileName, i, chunkText, embedding, dataSource);
      }

      console.log(`${fileName} processed and stored successfully`);

    } else if (stats.isDirectory()) {
      // Handle directory
      console.log(`Processing directory: ${urlOrDirectory}`);
      const files = fs.readdirSync(urlOrDirectory);

      for (const file of files) {
        const filePath = path.join(urlOrDirectory, file);
        const fileStats = fs.statSync(filePath);

        if (fileStats.isFile()) {
          console.log(`Processing file: ${file}`);

          // Load document
          const docs = await loadDocument(filePath);

          // Split documents into chunks
          const splits = await splitDocuments(docs);

          // Create embeddings and store in the database
          for (let i = 0; i < splits.length; i++) {
            const chunkText = splits[i].pageContent;
            const embedding = await createEmbeddings(chunkText);

            await storeEmbedding(file, i, chunkText, embedding, dataSource);
          }

          console.log(`${file} processed and stored successfully`);
        }
      }
    } else {
      throw new Error(`Path is neither a file nor a directory: ${urlOrDirectory}`);
    }
  } catch (error) {
    console.error('Error processing documents:', error);
  }
}
