declare module 'ai' {
    export function embed(options: { model: any, value: string }): Promise<{ embedding: number[] }>;
  }
  