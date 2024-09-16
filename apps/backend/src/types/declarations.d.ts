declare module '@langchain/embeddings' {
  export class Embeddings {
    embedQuery(text: string): Promise<number[]>;
    embedDocuments(documents: string[]): Promise<number[][]>;
  }
}

declare module '@langchain/community/document_loaders/fs/pdf' {
  export class PDFLoader {
    constructor(filePath: string);
    load(): Promise<{ pageContent: string }[]>;
  }
}

declare module '@langchain/community/document_loaders/fs/docx' {
  export class DocxLoader {
    constructor(filePath: string);
    load(): Promise<{ pageContent: string }[]>;
  }
}

declare module 'langchain/document_loaders/fs/text' {
  export class TextLoader {
    constructor(filePath: string);
    load(): Promise<{ pageContent: string }[]>;
  }
}

declare module '@langchain/text_splitter' {
  export class RecursiveCharacterTextSplitter {
    constructor(config: { chunkSize: number; chunkOverlap: number });
    splitDocuments(docs: { pageContent: string }[]): Promise<{ pageContent: string }[]>;
  }
}

declare module '@langchain/vectorstores/memory' {
  import { Embeddings } from '@langchain/embeddings';
  
  export class MemoryVectorStore {
    static fromDocuments(docs: { pageContent: string }[], embeddings: Embeddings): Promise<MemoryVectorStore>;
    asRetriever(config: { k: number; searchType: 'similarity' }): any;
  }
}