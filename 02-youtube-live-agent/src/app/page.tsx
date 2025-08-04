'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import Spinner from './components/Spinner';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status, stop, error, regenerate } = useChat();
  console.log('messages', messages)
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {
        messages.map(message => (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.role === 'user' ? 'User: ' : 'AI: '}
            {message.parts.map((part, i) => {
              switch (part.type) {
                case 'text':
                  return <div key={`${message.id}-${i}`}>{part.text}</div>;
                case 'tool-weather':
                case 'tool-convertFahrenheitToCelsius':
                  return (
                    <pre key={`${message.id}-${i}`}>
                      {JSON.stringify(part, null, 2)}
                    </pre>
                  );
                case 'tool-titleDescriptionYt':
                  return (
                    <pre key={`${message.id}-${i}`}>
                      {JSON.stringify(part, null, 2)}
                    </pre>
                  );
                
              }
            })}
          </div>
        ))
      }

      {(status === 'submitted' || status === 'streaming') && (
        <div>
          {status === 'submitted' && <Spinner />}
        </div>
      )}

      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => regenerate()}>
            Retry
          </button>
        </>
      )}

      <form
        onSubmit={e => {
          e.preventDefault();
          console.log('input', input)
          sendMessage({ text: input })
          setInput('');
        }}
      >
        <input
          className="fixed light:bg-gray-100 dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={e => setInput(e.currentTarget.value)}
        />
        {(status === 'submitted' || status === 'streaming') && (
          <button className='bg-zinc-900 bottom-0 fixed p-2 mb-8 ml-[455px] border-zinc-800 border-1 rounded-2xl' type="button" onClick={() => stop()}>
            Stop
          </button>
        )}
      </form>
    </div>
  );
}