declare module 'pdf-parse' {
    interface PDFParseResult {
      text: string;
      numpages: number;
      info: any;
      metadata: any;
    }
  
    function pdfParse(dataBuffer: Buffer): Promise<PDFParseResult>;
  
    export = pdfParse;
  }
  