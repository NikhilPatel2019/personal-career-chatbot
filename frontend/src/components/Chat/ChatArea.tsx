import { Stack, ScrollArea, Box } from '@mantine/core';
import { MessageBubble } from './MessageBubble';
import { useEffect, useRef } from 'react';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
}

interface ChatAreaProps {
    messages: Message[];
}

export function ChatArea({ messages }: ChatAreaProps) {
    const viewport = useRef<HTMLDivElement>(null);

    useEffect(() => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    return (
        <ScrollArea viewportRef={viewport} style={{ height: '100%' }} p="md">
            <Stack gap="md" style={{ maxWidth: 800, margin: '0 auto' }}>
                {messages.map((message) => (
                    <MessageBubble key={message.id} content={message.content} role={message.role} />
                ))}
                {/* Spacer for bottom scrolling */}
                <Box h={20} />
            </Stack>
        </ScrollArea>
    );
}
