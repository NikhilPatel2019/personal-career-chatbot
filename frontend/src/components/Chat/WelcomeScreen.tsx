import { Center, Stack, Text, SimpleGrid, Paper, ThemeIcon, Group } from '@mantine/core';
import { IconBulb, IconCode, IconBriefcase, IconPencil } from '@tabler/icons-react';

interface WelcomeScreenProps {
    onSuggestionClick: (suggestion: string) => void;
}

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
    const suggestions = [
        { icon: IconBriefcase, label: 'Professional Career', text: 'Tell me about Nikhil Professional Career' },
        { icon: IconPencil, label: 'Skills', text: 'Tell me about Nikhil Skills' },
        { icon: IconCode, label: 'Projects', text: 'Tell me about Nikhil Projects' },
        { icon: IconBulb, label: 'Interests', text: 'Tell me about Nikhil Interests' },
    ];

    return (
        <Center h="100%" px="md">
            <Stack align="center" gap="xl">
                <Stack align="center" gap="xs">
                    <ThemeIcon size={64} radius="xl" variant="gradient" gradient={{ from: 'violet', to: 'pink' }}>
                        <IconBriefcase size={32} />
                    </ThemeIcon>
                    <Text size="xl" fw={700} variant="gradient" gradient={{ from: 'violet', to: 'pink', deg: 90 }}>
                        How can I help you today?
                    </Text>
                </Stack>

                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" w="100%" style={{ maxWidth: 600 }}>
                    {suggestions.map((item) => (
                        <Paper
                            key={item.label}
                            p="md"
                            radius="md"
                            withBorder
                            onClick={() => onSuggestionClick(item.text)}
                            style={{ cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s' }}
                            styles={(theme) => ({
                                root: {
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        borderColor: theme.colors.violet[5],
                                        backgroundColor: 'var(--mantine-color-default-hover)',
                                    },
                                },
                            })}
                        >
                            <Group>
                                <ThemeIcon variant="light" color="violet" radius="md">
                                    <item.icon size="1.1rem" />
                                </ThemeIcon>
                                <Stack gap={2}>
                                    <Text size="sm" fw={500}>{item.label}</Text>
                                    <Text size="xs" c="dimmed">{item.text}</Text>
                                </Stack>
                            </Group>
                        </Paper>
                    ))}
                </SimpleGrid>
            </Stack>
        </Center>
    );
}
