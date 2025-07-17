'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BrainCircuit, PanelLeft, MessageSquare } from 'lucide-react';
import { ChatInterface } from '@/components/chat-interface';

type Chat = {
  id: number;
  title: string;
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load chats from localStorage on initial client render
  useEffect(() => {
    setIsClient(true);
    try {
      const storedChats = localStorage.getItem('chats');
      if (storedChats) {
        setChats(JSON.parse(storedChats));
      } else {
        // If no chats, create one
        newChat();
      }
      const storedActiveChat = localStorage.getItem('activeChatId');
      if (storedActiveChat) {
        setActiveChatId(JSON.parse(storedActiveChat));
      }
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
      // If error, start with a fresh chat
      if(chats.length === 0) newChat();
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('chats', JSON.stringify(chats));
        if (activeChatId !== null) {
          localStorage.setItem('activeChatId', JSON.stringify(activeChatId));
        }
      } catch (error) {
        console.warn('Error writing to localStorage:', error);
      }
    }
  }, [chats, activeChatId, isClient]);


  const newChat = () => {
    const newId = chats.length > 0 ? Math.max(...chats.map(c => c.id)) + 1 : 1;
    const newChat: Chat = { id: newId, title: 'Nuevo Chat' };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newId);
  };
  
  const updateChatTitle = useCallback((chatId: number, newTitle: string) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  }, []);

  const activeChat = chats.find(chat => chat.id === activeChatId);

  if (!isClient) {
    // Render a skeleton or loading state on the server
    return (
      <div className="flex h-dvh bg-background text-foreground font-body">
        <aside className="w-64 flex flex-col p-4 bg-card border-r border-border space-y-4">
          <header className="px-2">
            <h1 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
              <BrainCircuit size={28} />
              <span>NeoChat</span>
            </h1>
          </header>
        </aside>
        <main className="flex-1 flex flex-col"></main>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-background text-foreground font-body">
      <aside className={`flex flex-col p-4 bg-card border-r border-border space-y-4 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 p-0 overflow-hidden'}`}>
        <header className="px-2">
          <h1 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <BrainCircuit size={28} />
            <span>NeoChat</span>
          </h1>
        </header>
        <div className="flex-1 space-y-2">
          {chats.map(chat => (
            <Button
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              variant={activeChatId === chat.id ? 'secondary' : 'ghost'}
              className="w-full justify-start text-left truncate"
            >
              <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{chat.title}</span>
            </Button>
          ))}
        </div>
        <Button
          onClick={newChat}
          variant="outline"
          className="w-full"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Chat
        </Button>
      </aside>
      <main className="flex-1 flex flex-col">
        <header className="flex items-center p-2 border-b border-border">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            variant="ghost"
            size="icon"
          >
            <PanelLeft />
            <span className="sr-only">Ocultar barra lateral</span>
          </Button>
        </header>
        {activeChat && <ChatInterface key={activeChat.id} chatId={activeChat.id} onTitleUpdate={updateChatTitle} />}
      </main>
    </div>
  );
}
