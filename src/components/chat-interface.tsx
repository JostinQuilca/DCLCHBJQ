'use client';

import { useEffect, useRef, useState, FormEvent, useTransition, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendHorizonal, ImagePlus, X, Paperclip } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { getAiResponse, getInitialMessage, generateChatTitle } from '@/app/actions';
import Image from 'next/image';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  fileName?: string;
};

type ChatInterfaceProps = {
  chatId: number;
  onTitleUpdate: (chatId: number, newTitle: string) => void;
};


export function ChatInterface({ chatId, onTitleUpdate }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesKey = `chat_${chatId}_messages`;

  const setPersistentMessages = useCallback((newMessages: Message[]) => {
    try {
      localStorage.setItem(messagesKey, JSON.stringify(newMessages));
      setMessages(newMessages);
    } catch (error) {
      console.warn(`Error setting localStorage key “${messagesKey}”:`, error);
    }
  }, [messagesKey]);
  
  useEffect(() => {
    let isMounted = true;
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
          if (isMounted) {
            setPersistentMessages([firstMessage]);
            setIsInitialized(true);
          }
        });
      } else {
        setMessages(initialMessages);
        setIsInitialized(true);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key “${messagesKey}”:`, error);
      setIsInitialized(true); 
    }
    return () => { isMounted = false; };
  }, [chatId, messagesKey, setPersistentMessages]); 


  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (evt) => {
        setFileContent(evt.target?.result as string);
        setFileName(file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if ((!trimmedInput && !image && !fileContent) || isPending || !isInitialized) return;

    setInput('');
    setImage(null);
    setFileContent(null);
    setFileName(null);
    if(imageInputRef.current) {
        imageInputRef.current.value = '';
    }
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmedInput,
      image: image ?? undefined,
      fileName: fileName ?? undefined,
    };

    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;

    const newMessages = [...messages, userMessage];
    setPersistentMessages(newMessages);

    startTransition(async () => {
      if (isFirstUserMessage) {
        const titleText = trimmedInput || (image && "Análisis de imagen") || (fileName && `Análisis de ${fileName}`) || "Nuevo Chat";
        const newTitle = await generateChatTitle(titleText);
        onTitleUpdate(chatId, newTitle);
      }

      let aiQuery = trimmedInput;
      if (fileContent) {
        aiQuery = `Teniendo en cuenta el siguiente contenido del archivo "${fileName}":\n\n${fileContent}\n\nResponde a esta pregunta: ${trimmedInput}`;
      }
      
      const response = await getAiResponse(aiQuery, image ?? undefined);
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
      };
      setPersistentMessages([...newMessages, aiMessage]);
    });
  };

  const resetFileInput = () => {
    setFileContent(null);
    setFileName(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <div className="flex items-center gap-2 mb-2">
            {image && (
              <div className="relative w-24 h-24">
                <Image src={image} alt="Vista previa de la imagen" layout="fill" objectFit="cover" className="rounded-md"/>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/75 text-white"
                  onClick={() => {
                    setImage(null)
                    if(imageInputRef.current) {
                      imageInputRef.current.value = '';
                    }
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {fileName && (
              <div className="relative flex items-center gap-2 p-2 rounded-md bg-muted text-sm">
                <Paperclip className="h-4 w-4" />
                <span className="truncate max-w-xs">{fileName}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetFileInput}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
        </div>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".txt,.md,.csv" className="hidden" />
          <Button type="button" size="icon" variant="ghost" onClick={() => imageInputRef.current?.click()} disabled={isPending}>
            <ImagePlus />
            <span className="sr-only">Adjuntar imagen</span>
          </Button>
          <Button type="button" size="icon" variant="ghost" onClick={() => fileInputRef.current?.click()} disabled={isPending}>
            <Paperclip />
            <span className="sr-only">Adjuntar archivo</span>
          </Button>
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escribe tu mensaje o adjunta un archivo..."
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
          <Button type="submit" size="icon" disabled={(!input.trim() && !image && !fileContent) || isPending || !isInitialized} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <SendHorizonal />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
