import { openai } from '@ai-sdk/openai';
import { ModelMessage, streamText } from 'ai';
import 'dotenv/config';
import * as readline from 'node:readline/promises';

const terminal = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages: ModelMessage[] = [];

async function main() {
  while (true) {
    const userInput = await terminal.question('You: ');

    const systemMessage = `Eres un asistente de ventas por WhatsApp para una tienda de calzado. 
      Tu trabajo es responder de forma clara, cordial, y breve, como lo haría un humano atento.
      Si no sabes una respuesta, responde que vas a consultar con un asesor humano.
      Usa emojis si el tono lo permite, pero no abuses. Habla en un español neutro y accesible.
      No uses jerga técnica o complicada. Siempre busca ser útil y resolver las dudas del cliente.
      `
      
    messages.push({ role: 'system', content: systemMessage });
    messages.push({ role: 'user', content: userInput });

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages,
    });

    let fullResponse = '';
    process.stdout.write('\nAssistant: ');

    for await (const delta of result.textStream) {
      fullResponse += delta;
      process.stdout.write(delta);
    }
    process.stdout.write('\n\n');

    messages.push({ role: 'assistant', content: fullResponse });
  }
}

main().catch(console.error);