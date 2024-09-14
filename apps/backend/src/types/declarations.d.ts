// Embeddings module
declare module '@langchain/embeddings' {
    export class Embeddings {
      embedQuery(text: string): Promise<number[]>;
      embedDocuments(documents: string[]): Promise<number[][]>;
    }
  }
  
  // PDFLoader module
  declare module '@langchain/community/document_loaders/fs/pdf' {
    export class PDFLoader {
      constructor(filePath: string);
      load(): Promise<{ pageContent: string }[]>;
    }
  }
  
  // DocxLoader module
  declare module '@langchain/community/document_loaders/fs/docx' {
    export class DocxLoader {
      constructor(filePath: string);
      load(): Promise<{ pageContent: string }[]>;
    }
  }
  
  // TextLoader module
  declare module 'langchain/document_loaders/fs/text' {
    export class TextLoader {
      constructor(filePath: string);
      load(): Promise<{ pageContent: string }[]>;
    }
  }
  
  // TextSplitter module
  declare module '@langchain/text_splitter' {
    export class RecursiveCharacterTextSplitter {
      constructor(config: { chunkSize: number; chunkOverlap: number });
      splitDocuments(docs: { pageContent: string }[]): Promise<{ pageContent: string }[]>;
    }
  }
  
  // MemoryVectorStore module
  declare module '@langchain/vectorstores/memory' {
    export class MemoryVectorStore {
      static fromDocuments(docs: { pageContent: string }[], embeddings: Embeddings): Promise<MemoryVectorStore>;
      asRetriever(config: { k: number; searchType: 'similarity' }): any;
    }
  }
  