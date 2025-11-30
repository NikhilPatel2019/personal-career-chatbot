import { AppShell, Group, Text, Box, ActionIcon, useMantineColorScheme, useComputedColorScheme, Container } from '@mantine/core';
import { IconSun, IconMoon } from '@tabler/icons-react';
import { ChatArea } from './ChatArea';
import { ChatInput } from './ChatInput';
import { WelcomeScreen } from './WelcomeScreen';
import { useState } from 'react';

interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant';
}

export function ChatLayout() {
    const { setColorScheme } = useMantineColorScheme();
    const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

    const [messages, setMessages] = useState<Message[]>([]);

    const handleSend = (content: string) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
        };
        setMessages((prev) => [...prev, newMessage]);

        // Simulate response
        setTimeout(() => {
            const responseMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'This is a simulated response. The backend is not connected yet.',
            };
            setMessages((prev) => [...prev, responseMessage]);
        }, 1000);
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
