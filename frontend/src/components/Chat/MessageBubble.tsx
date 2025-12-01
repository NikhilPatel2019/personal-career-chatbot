import { Paper, Text, ThemeIcon, Group, Box, useMantineTheme } from '@mantine/core';
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
                <Box style={{ flex: 1 }}>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {content}
                    </Text>
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
