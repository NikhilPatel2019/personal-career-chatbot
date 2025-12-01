import { AppShell, Group, Text, Box, ActionIcon, useMantineColorScheme, useComputedColorScheme, Container } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { ChatArea } from './ChatArea';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { useState } from 'react';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
}

export function ChatLayout() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    const [messages, setMessages] = useState<Message[]>([]);

    const handleSend = async (content: string) => {
        console.log("handleSend called with content:", content);
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
        };
        console.log("newMessage", newMessage);
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        console.log("messages", updatedMessages);

        const response = await fetch('http://localhost:8000/chat/stream', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages: updatedMessages }),
        });

        if (!response.body) return;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const parts = buffer.split('\n\n');
            buffer = parts.pop() || '';
            for (const part of parts) {
                const line = part.split('\n').find((l) => l.startsWith('data:'));
                if (!line) continue;
                try {
                    const payload = JSON.parse(line.replace(/^data:\s*/, '')) as { role?: string; content?: string };
                    const eventRole = (payload.role || 'assistant').toLowerCase();
                    const eventContent = payload.content || '';
                    if (!eventContent) continue;

                    setMessages((prev) => {
                        const role: Message['role'] = eventRole === 'system' ? 'system' : eventRole === 'user' ? 'user' : 'assistant';

                        if (role === 'assistant') {
                            if (prev.length && prev[prev.length - 1].role === 'assistant') {
                                return [
                                    ...prev.slice(0, -1),
                                    { ...prev[prev.length - 1], content: eventContent },
                                ];
                            }
                            return [...prev, { id: Date.now().toString(), role: 'assistant', content: eventContent }];
                        }

                        if (role === 'user') {
                            if (prev.length && prev[prev.length - 1].role === 'user') {
                                if (prev[prev.length - 1].content === eventContent) {
                                    return prev;
                                }
                                return [
                                    ...prev.slice(0, -1),
                                    { ...prev[prev.length - 1], content: eventContent },
                                ];
                            }
                            const exists = prev.some((m) => m.role === 'user' && m.content === eventContent);
                            if (exists) return prev;
                            return [...prev, { id: Date.now().toString(), role: 'user', content: eventContent }];
                        }

                        return [...prev, { id: Date.now().toString(), role: 'system', content: eventContent }];
                    });
                } catch (err) {
                    console.error('Failed to parse SSE data chunk:', err, part);
                    continue;
                }
            }
        }
            // const responseMessage: Message = {
            //     id: (Date.now() + 1).toString(),
            //     role: 'assistant',
            //     content: responseMessage,
            // };
            // setMessages((prev) => [...prev, responseMessage]);
        // }, 1000);
    };

    const toggleColorScheme = () => {
        setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <AppShell
            header={{ height: 60 }}
            footer={{ height: 90 }}
            padding={0}
        >
            <AppShell.Header withBorder={false} style={{ background: 'transparent', backdropFilter: 'blur(10px)' }}>
                <Container size="lg" h="100%">
                    <Group h="100%" px="md" justify="space-between">
                        <Text fw={700} size="lg" variant="gradient" gradient={{ from: 'violet', to: 'pink', deg: 90 }}>
                            Career Chatbot
                        </Text>
                        <ActionIcon
                            onClick={toggleColorScheme}
                            variant="subtle"
                            size="lg"
                            aria-label="Toggle color scheme"
                            color="gray"
                        >
                            {computedColorScheme === 'dark' ? <IconSun size="1.2rem" /> : <IconMoon size="1.2rem" />}
                        </ActionIcon>
                    </Group>
                </Container>
            </AppShell.Header>

            <AppShell.Main>
                <Box style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    paddingTop: 60,
                    paddingBottom: 90,
                }}>
                    <Box style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                        {messages.length === 0 ? (
                            <WelcomeScreen onSuggestionClick={handleSend} />
                        ) : (
                            <Container size="lg" h="100%" py="md">
                                <ChatArea messages={messages} />
                            </Container>
                        )}
                    </Box>
                </Box>
            </AppShell.Main>

            <AppShell.Footer withBorder={false} style={{ background: 'transparent' }} zIndex={100}>
                <Box p="md" style={{
                    background: 'linear-gradient(to top, var(--mantine-color-body) 20%, transparent)',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Container size="lg" w="100%">
                        <ChatInput onSend={handleSend} />
                    </Container>
                </Box>
            </AppShell.Footer>
        </AppShell>
    );
}
