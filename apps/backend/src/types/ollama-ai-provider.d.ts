declare module 'ollama-ai-provider' {
    export const ollama: {
      textEmbeddingModel: (modelName: string) => any;
    };
  }
  