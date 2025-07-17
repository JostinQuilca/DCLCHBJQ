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

// Hook para persistir el estado en localStorage
function usePersistentState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return defaultValue;
    }
  });

  const setPersistentState = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setState(value);
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  };

  return [state, setPersistentState];
}

export function ChatInterface({ chatId }: { chatId: number }) {
  const [messages, setMessages] = usePersistentState<Message[]>(`chat_${chatId}_messages`, []);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Solo carga el mensaje inicial si no hay mensajes.
    if (messages.length === 0) {
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
    }
  }, [chatId]); // se ejecuta cuando cambia el chat

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
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);


    startTransition(async () => {
      const response = await getAiResponse(trimmedInput);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
      };
      setMessages([...newMessages, aiMessage]);
    });
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" viewportRef={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map(msg => (
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
            disabled={isPending}
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isPending} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <SendHorizonal />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
