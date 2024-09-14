import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { FileEmbedding } from './entities/DocumentEmbedding';
import { embed } from 'ai';
import { ollama } from 'ollama-ai-provider';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { TextLoader } from 'langchain/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

// Function to download a file from a URL
async function downloadFile(url: string, localPath: string) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(localPath, response.data);
}

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

// Function to split documents
async function splitDocuments(docs: any[]) {
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
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
  const repository = dataSource.getRepository(FileEmbedding);
  const documentEmbedding = new FileEmbedding();
  documentEmbedding.fileName = fileName;
  documentEmbedding.chunkIndex = chunkIndex;
  documentEmbedding.text = text;
  documentEmbedding.embedding = embedding;
  await repository.save(documentEmbedding);
}

async function processFiles(urlOrDirectory: string, dataSource: DataSource) {
  try {
    if (urlOrDirectory.startsWith('http://') || urlOrDirectory.startsWith('https://')) {
      // Handle URL
      console.log(`Processing URL: ${urlOrDirectory}`);
      const fileName = path.basename(urlOrDirectory);
      const localPath = path.join(__dirname, fileName);

      // Download the file
      await downloadFile(urlOrDirectory, localPath);

      // Determine the file type and use appropriate loader
      let docs;
      if (fileName.endsWith('.pdf')) {
        const loader = new PDFLoader(localPath);
        docs = await loader.load();
      } else if (fileName.endsWith('.docx')) {
        const loader = new DocxLoader(localPath);
        docs = await loader.load();
      } else if (fileName.endsWith('.txt')) {
        const loader = new TextLoader(localPath);
        docs = await loader.load();
      } else {
        throw new Error(`Unsupported file type: ${fileName}`);
      }

      // Split
      const splits = await splitDocuments(docs);

      // Store
      for (let i = 0; i < splits.length; i++) {
        const chunkText = splits[i].pageContent;
        const embedding = await createEmbeddings(chunkText);

        await storeEmbedding(fileName, i, chunkText, embedding, dataSource);
      }

      console.log(`${fileName} processed and stored successfully`);

      // Clean up local file
      fs.unlinkSync(localPath);

    } else {
      // Handle local directory (keep existing logic for local files)
      const files = fs.readdirSync(urlOrDirectory);

      for (const file of files) {
        const filePath = path.join(urlOrDirectory, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
          console.log(`Processing file: ${file}`);

          // Load
          const docs = await loadDocument(filePath);

          // Split
          const splits = await splitDocuments(docs);

          // Store
          for (let i = 0; i < splits.length; i++) {
            const chunkText = splits[i].pageContent;
            const embedding = await createEmbeddings(chunkText);

            await storeEmbedding(file, i, chunkText, embedding, dataSource);
          }

          console.log(`${file} processed and stored successfully`);
        }
      }
    }
  } catch (error) {
    console.error('Error processing documents:', error);
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
  entities: [FileEmbedding],
  synchronize: true,
});

dataSource
  .initialize()
  .then(() => {
    const directoryOrUrl = 'https://www.tutorialspoint.com/ruby-on-rails/ruby-on-rails-tutorial.pdf'; // Replace with the path to your local documents directory or URL
    processFiles(directoryOrUrl, dataSource);
  })
  .catch((error) => console.error('Error initializing data source:', error));




