import { Stack, ScrollArea, Box, Loader, Paper, ThemeIcon, Group } from '@mantine/core';
import { MessageBubble } from './MessageBubble';
import { useEffect, useRef } from 'react';
import { IconRobot } from '@tabler/icons-react';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
}

interface ChatAreaProps {
    messages: Message[];
    isLoading: boolean;
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
    const viewport = useRef<HTMLDivElement>(null);

    useEffect(() => {
        viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <ScrollArea viewportRef={viewport} style={{ height: '100%' }} p="md">
            <Stack gap="md" style={{ maxWidth: 800, margin: '0 auto' }}>
                {messages.map((message) => (
                    <MessageBubble key={message.id} content={message.content} role={message.role} />
                ))}
                {isLoading && (
                    <Paper
                        p="md"
                        radius="xl"
                        bg="transparent"
                        style={{
                            maxWidth: '85%',
                            alignSelf: 'flex-start',
                            borderBottomLeftRadius: 0,
                        }}
                    >
                        <Group align="flex-start" wrap="nowrap" gap="sm">
                            <ThemeIcon size={32} radius="xl" variant="gradient" gradient={{ from: 'violet', to: 'pink' }}>
                                <IconRobot size="1.2rem" />
                            </ThemeIcon>
                            <Box style={{ display: 'flex', alignItems: 'center', height: 32 }}>
                                <Loader size="sm" variant="dots" color="violet" />
                            </Box>
                        </Group>
                    </Paper>
                )}
                <Box h={20} />
            </Stack>
        </ScrollArea>
    );
}
