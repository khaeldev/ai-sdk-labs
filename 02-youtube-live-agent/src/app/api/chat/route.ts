import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, tool, generateObject } from 'ai';
import { z } from 'zod';
import { LIVE_SYSTEM_PROMPT, TITLE_DESCRIPTION_YT_PROMPT } from './prompts';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  console.log(req)
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4.1'),
    temperature: 0.3,
    maxOutputTokens: 512,
    system: LIVE_SYSTEM_PROMPT,
    messages: convertToModelMessages(messages),
    tools: {
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({location}) => {
          console.log('executing weather tool for location:', location);
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          }
        },
      }),
      titleDescriptionYt: tool({
        description: 'Generate a YouTube title and description for a video in a json format with the keys "title" and "description"',
        inputSchema: z.object({
          topic: z.string().describe('The topic of the YouTube video'),
        }),
        execute: async ({ topic }) => {
          console.log('executing titleDescriptionYt tool for topic:', topic);
          // Simulate generating a title and description

          const response = await generateObject({
            model: openai('gpt-4.1'),
            schema: z.object({
              title: z.string().describe('The title of the YouTube video'),
              description: z.string().describe('The description of the YouTube video'),
            }),
            system: TITLE_DESCRIPTION_YT_PROMPT,
            prompt: `Generate a YouTube title and description for the topic: ${topic}`,
          })
          console.log('***', response)
          return {
            title: response.object.title,
            description: response.object.description,
          }
        },
      })
    },
  });

  // console.log(await result.warnings);
  // console.log(result.toolCalls);
  return result.toUIMessageStreamResponse();
}