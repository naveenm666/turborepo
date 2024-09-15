'use server';

import { createStreamableValue } from 'ai/rsc';
import { CoreMessage, streamText } from 'ai';
import { createOllama } from 'ollama-ai-provider';

export async function continueConversation(messages: CoreMessage[]) {
  'use server';
  
  const ollama = createOllama();  // Initialize Ollama if needed
  
  const result = await streamText({
    model: ollama('llama3'),  // Corrected model assignment
    messages,
  });
  
  const stream = createStreamableValue(result.textStream);
  
  return { message: stream.value };
}
