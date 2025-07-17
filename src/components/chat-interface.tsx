'use client';

import { useEffect, useRef, useState, FormEvent, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { getAiResponse, getInitialMessage } from '@/app/actions';
import { LoadingDots } from './loading-dots';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startTransition(async () => {
      const initialMessage = await getInitialMessage();
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: initialMessage,
        },
      ]);
    });
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isPending) return;

    setInput('');
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedInput,
    };
    setMessages(prev => [...prev, userMessage]);

    startTransition(async () => {
      const response = await getAiResponse(trimmedInput);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, aiMessage]);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map(msg => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          {isPending && messages.length > 0 && (
             <div className="flex items-start gap-4">
                <ChatMessage role="assistant" content="" />
             </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 bg-card border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none min-h-[40px] max-h-40"
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <SendHorizonal />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
