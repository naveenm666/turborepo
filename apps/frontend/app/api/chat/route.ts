import { createOllama } from 'ollama-ai-provider';
import { streamText, convertToCoreMessages, StreamData } from 'ai';

// Create an instance of Ollama with the desired configuration
const ollama = createOllama({
  // Add your configuration options here if needed
});

  

// Define the streaming model
const streamingModel = ollama('llama3');

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, embeddingPrompt } = await req.json();


    // Handle streaming data
    const data = new StreamData();
    // You might want to append relevant data based on your use case
    

    // Stream text using the Ollama model and handle streaming responses
    const result = await streamText({
      model: streamingModel,
      messages: convertToCoreMessages(messages),
      onFinish() {
        data.close();
      },
    });

    return result.toDataStreamResponse({ data });
  } catch (error) {
    // Handle any errors that might occur
    console.error('Error processing request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
