'use client';

import { Bot, User, Paperclip } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LoadingDots } from './loading-dots';
import Image from 'next/image';

type ChatMessageProps = {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  fileName?: string;
};

export function ChatMessage({ role, content, image, fileName }: ChatMessageProps) {
  const isUser = role === 'user';
  const isLoading = role === 'assistant' && content === '';

  return (
    <div
      className={cn(
        'flex items-start gap-4 animate-slide-in-up',
        isUser && 'justify-end'
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-accent text-accent-foreground flex-shrink-0">
          <AvatarFallback>
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'rounded-lg p-3 max-w-sm md:max-w-md lg:max-w-2xl text-sm flex flex-col gap-2',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-card'
        )}
      >
        {image && (
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
             <Image src={image} alt="Imagen adjunta por el usuario" layout="fill" objectFit="cover" />
          </div>
        )}
         {fileName && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-primary/20 text-sm">
            <Paperclip className="h-4 w-4" />
            <span>{fileName}</span>
          </div>
        )}
        {isLoading ? (
          <LoadingDots />
        ) : (
          content && <p className="whitespace-pre-wrap">{content}</p>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-secondary text-secondary-foreground flex-shrink-0">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
