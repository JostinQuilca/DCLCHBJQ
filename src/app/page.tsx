'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BrainCircuit, PanelLeft } from 'lucide-react';
import { ChatInterface } from '@/components/chat-interface';

type Chat = {
  id: number;
  title: string;
};

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([{ id: 1, title: 'Chat 1' }]);
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const newChat = () => {
    const newId = chats.length > 0 ? Math.max(...chats.map(c => c.id)) + 1 : 1;
    const newChat: Chat = { id: newId, title: `Chat ${newId}` };
    setChats(prev => [...prev, newChat]);
    setActiveChatId(newId);
  };
  
  const activeChat = chats.find(chat => chat.id === activeChatId);

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
              className="w-full justify-start text-left"
            >
              {chat.title}
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
        {activeChat && <ChatInterface key={activeChat.id} chatId={activeChat.id} />}
      </main>
    </div>
  );
}
