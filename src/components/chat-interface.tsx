'use client';

import { useEffect, useRef, useState, FormEvent, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { getAiResponse, getInitialMessage } from '@/app/actions';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export function ChatInterface({ chatId }: { chatId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesKey = `chat_${chatId}_messages`;

  useEffect(() => {
    // Cargar mensajes desde localStorage solo en el cliente
    try {
      const storedValue = localStorage.getItem(messagesKey);
      const initialMessages = storedValue ? JSON.parse(storedValue) : [];
      
      if (initialMessages.length === 0) {
        startTransition(async () => {
          const initialMessageContent = await getInitialMessage();
          const firstMessage: Message = {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: initialMessageContent,
          };
          setMessages([firstMessage]);
          localStorage.setItem(messagesKey, JSON.stringify([firstMessage]));
          setIsInitialized(true);
        });
      } else {
        setMessages(initialMessages);
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${messagesKey}”:`, error);
      setIsInitialized(true); // Ensure we don't get stuck
    }
  }, [chatId, messagesKey]); 

  const setPersistentMessages = (newMessages: Message[]) => {
    try {
      localStorage.setItem(messagesKey, JSON.stringify(newMessages));
      setMessages(newMessages);
    } catch (error) {
      console.warn(`Error setting localStorage key “${messagesKey}”:`, error);
    }
  };

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
    if (!trimmedInput || isPending || !isInitialized) return;

    setInput('');
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedInput,
    };
    const newMessages = [...messages, userMessage];
    setPersistentMessages(newMessages);


    startTransition(async () => {
      const response = await getAiResponse(trimmedInput);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
      };
      setPersistentMessages([...newMessages, aiMessage]);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-6">
          {isInitialized && messages.map(msg => (
            <ChatMessage key={msg.id} {...msg} />
          ))}
          {isPending && messages.length > 0 && messages[messages.length -1].role === 'user' && (
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
            placeholder="Escribe tu mensaje..."
            className="flex-1 resize-none min-h-[40px] max-h-40"
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as any);
              }
            }}
            disabled={isPending || !isInitialized}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isPending || !isInitialized} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <SendHorizonal />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
