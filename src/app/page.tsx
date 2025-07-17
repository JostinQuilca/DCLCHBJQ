"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Zap, PanelLeft, MessageSquare, Trash2 } from "lucide-react";
import { ChatInterface } from "@/components/chat-interface";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Chat = {
  id: number;
  title: string;
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedChats = localStorage.getItem("chats");
      const storedActiveChat = localStorage.getItem("activeChatId");

      let parsedChats: Chat[] = [];
      if (storedChats) {
        parsedChats = JSON.parse(storedChats);
        setChats(parsedChats);
      }

      let activeId: number | null = null;
      if (storedActiveChat) {
        activeId = JSON.parse(storedActiveChat);
        setActiveChatId(activeId);
      }

      if (parsedChats.length === 0) {
        newChat(true);
      } else if (
        activeId === null ||
        !parsedChats.some((c) => c.id === activeId)
      ) {
        setActiveChatId(parsedChats[0]?.id ?? null);
      }
    } catch (error) {
      console.warn("Error reading from localStorage:", error);
      if (chats.length === 0) newChat(true);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem("chats", JSON.stringify(chats));
        if (activeChatId !== null) {
          localStorage.setItem("activeChatId", JSON.stringify(activeChatId));
        } else if (chats.length === 0) {
          localStorage.removeItem("activeChatId");
        }
      } catch (error) {
        console.warn("Error writing to localStorage:", error);
      }
    }
  }, [chats, activeChatId, isClient]);

  const newChat = (setActive = false) => {
    const newId =
      chats.length > 0 ? Math.max(...chats.map((c) => c.id)) + 1 : 1;
    const newChat: Chat = { id: newId, title: "Nuevo Chat" };
    const newChats = [...chats, newChat];
    setChats(newChats);
    if (setActive || activeChatId === null) {
      setActiveChatId(newId);
    }
  };

  const updateChatTitle = useCallback((chatId: number, newTitle: string) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === chatId ? { ...chat, title: newTitle } : chat
      )
    );
  }, []);

  const deleteChat = (chatIdToDelete: number) => {
    // Remove the chat messages from local storage first
    try {
      localStorage.removeItem(`chat_${chatIdToDelete}_messages`);
    } catch (error) {
      console.warn(
        `Error removing chat messages for chat ID ${chatIdToDelete}:`,
        error
      );
    }

    const remainingChats = chats.filter((c) => c.id !== chatIdToDelete);
    setChats(remainingChats);

    if (activeChatId === chatIdToDelete) {
      if (remainingChats.length > 0) {
        // Set the new active chat to the latest one
        setActiveChatId(remainingChats[remainingChats.length - 1].id);
      } else {
        // If no chats are left, create a new one
        setActiveChatId(null); // Clear activeId first
        newChat(true);
      }
    }
  };

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  if (!isClient) {
    return (
      <div className="flex h-dvh bg-background text-foreground font-body">
        <aside className="w-64 flex-shrink-0 flex flex-col p-4 bg-card border-r border-border space-y-4">
          <header className="px-2">
            <h1 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
              <Zap size={28} />
              <span>NeoChat</span>
            </h1>
          </header>
        </aside>
        <main className="flex-1 flex flex-col"></main>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <AlertDialog>
        <div className="flex h-dvh bg-background text-foreground font-body">
          <aside
            className={`flex flex-col flex-shrink-0 bg-card border-r border-border space-y-4 transition-all duration-300 ease-in-out ${
              sidebarOpen ? "w-64 p-4" : "w-20 p-2 items-center"
            }`}
          >
            <div className="w-full">
              <header
                className={`px-2 mb-4 ${
                  sidebarOpen ? "" : "flex justify-center"
                }`}
              >
                <h1 className="text-2xl font-bold font-headline text-primary flex items-center gap-2">
                  <Zap size={28} />
                  <span className={`${sidebarOpen ? "block" : "hidden"}`}>
                    NeoChat
                  </span>
                </h1>
              </header>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => newChat(true)}
                    variant="outline"
                    className={`w-full ${!sidebarOpen && "justify-center"}`}
                  >
                    <Plus className={`h-4 w-4 ${sidebarOpen && "mr-2"}`} />
                    <span className={`${sidebarOpen ? "inline" : "hidden"}`}>
                      Nuevo Chat
                    </span>
                  </Button>
                </TooltipTrigger>
                {!sidebarOpen && (
                  <TooltipContent side="right" align="center">
                    <p>Nuevo Chat</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
            <div className="flex-1 space-y-2 w-full overflow-y-auto">
              {chats.map((chat) => (
                <div key={chat.id} className="relative group">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => setActiveChatId(chat.id)}
                        variant={
                          activeChatId === chat.id ? "secondary" : "ghost"
                        }
                        className={`w-full justify-start text-left truncate pr-8 ${
                          !sidebarOpen && "justify-center"
                        }`}
                      >
                        <MessageSquare
                          className={`h-5 w-5 flex-shrink-0 ${
                            sidebarOpen && "mr-2"
                          }`}
                        />
                        <span
                          className={`truncate ${
                            sidebarOpen ? "inline" : "hidden"
                          }`}
                        >
                          {chat.title}
                        </span>
                      </Button>
                    </TooltipTrigger>
                    {!sidebarOpen && (
                      <TooltipContent side="right" align="center">
                        <p>{chat.title}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                  {sidebarOpen && (
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar chat</span>
                      </Button>
                    </AlertDialogTrigger>
                  )}
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará
                        permanentemente la conversación.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteChat(chat.id)}>
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </div>
              ))}
            </div>
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
            {activeChat && (
              <ChatInterface
                key={activeChat.id}
                chatId={activeChat.id}
                onTitleUpdate={updateChatTitle}
              />
            )}
          </main>
        </div>
      </AlertDialog>
    </TooltipProvider>
  );
}
