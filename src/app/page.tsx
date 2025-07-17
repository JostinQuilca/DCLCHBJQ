'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BrainCircuit } from 'lucide-react';
import { ChatInterface } from '@/components/chat-interface';

export default function Home() {
  const [chatKey, setChatKey] = useState(0);

  const newChat = () => {
    setChatKey(prevKey => prevKey + 1);
  };

  return (
    <div className="flex h-dvh bg-background text-foreground font-body">
      <aside className="hidden md:flex w-64 flex-col p-4 bg-card border-r border-border space-y-4">
        <header className="px-2">
          <h1 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
            <BrainCircuit size={28} />
            <span>NeoChat</span>
          </h1>
        </header>
        <div className="flex-1">
          <Button
            onClick={newChat}
            variant="ghost"
            className="w-full justify-start text-left"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        <ChatInterface key={chatKey} />
      </main>
    </div>
  );
}
