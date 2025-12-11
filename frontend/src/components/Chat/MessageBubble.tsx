import { Paper, Text, ThemeIcon, Group, Box, useMantineTheme, Code } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { IconRobot, IconUser } from '@tabler/icons-react';

interface MessageBubbleProps {
    content: string;
    role: 'user' | 'assistant' | 'system';
}

export function MessageBubble({ content, role }: MessageBubbleProps) {
    const theme = useMantineTheme();
    const isUser = role === 'user';
    const isSystem = role === 'system';

    return (
        <Paper
            p="md"
            radius="xl"
            bg={isSystem ? 'transparent' : isUser ? 'violet.6' : 'transparent'}
            c={isSystem ? 'dimmed' : isUser ? 'white' : 'text'}
            shadow={isUser ? 'sm' : undefined}
            withBorder={!isUser}
            style={{
                maxWidth: '85%',
                alignSelf: isSystem ? 'center' : isUser ? 'flex-end' : 'flex-start',
                borderBottomRightRadius: isUser ? 0 : theme.radius.xl,
                borderBottomLeftRadius: isUser ? theme.radius.xl : 0,
                borderColor: !isUser ? 'var(--mantine-color-default-border)' : undefined,
            }}
        >
            <Group align="flex-start" wrap="nowrap" gap="sm">
                {!isUser && !isSystem && (
                    <ThemeIcon size={32} radius="xl" variant="gradient" gradient={{ from: 'violet', to: 'pink' }}>
                        <IconRobot size="1.2rem" />
                    </ThemeIcon>
                )}
                <Box style={{ flex: 1, overflow: 'hidden' }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            p: ({ children }: { children: React.ReactNode }) => (
                                <Text size="sm" mb="xs" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {children}
                                </Text>
                            ),
                            code: ({ className, children }: any) => {
                                const match = /language-(\w+)/.exec(className || '');
                                const isInline = !match && !className;
                                return isInline ? (
                                    <Code color={isUser ? 'violet.8' : 'gray.2'} c={isUser ? 'white' : 'text'}>
                                        {children}
                                    </Code>
                                ) : (
                                    <Code block color="gray" my="xs" style={{ overflowX: 'auto' }}>
                                        {children}
                                    </Code>
                                );
                            },
                            ul: ({ children }: { children: React.ReactNode }) => <Box component="ul" pl="md" my="xs">{children}</Box>,
                            ol: ({ children }: { children: React.ReactNode }) => <Box component="ol" pl="md" my="xs">{children}</Box>,
                            li: ({ children }: { children: React.ReactNode }) => <Text component="li" size="sm" style={{ lineHeight: 1.6 }}>{children}</Text>,
                            a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
                                <Text component="a" href={href} target="_blank" rel="noopener noreferrer" c={isUser ? 'white' : 'blue'} td="underline">
                                    {children}
                                </Text>
                            ),
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </Box>
                {isUser && (
                    <ThemeIcon size={32} radius="xl" color="violet" variant="filled">
                        <IconUser size="1.2rem" />
                    </ThemeIcon>
                )}
            </Group>
        </Paper>
    );
}
