import { TextInput, ActionIcon, Paper } from '@mantine/core';
import { IconSend } from '@tabler/icons-react';
import { useState } from 'react';

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
    const [value, setValue] = useState('');

    const handleSend = () => {
        if (value.trim()) {
            onSend(value);
            setValue('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSend();
        }
    };

    return (
        <Paper
            p={0}
            bg="transparent"
            style={{
                maxWidth: 800,
                margin: '0 auto',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1))'
            }}
        >
            <TextInput
                placeholder="Type a message..."
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                radius="xl"
                size="lg"
                rightSection={
                    <ActionIcon
                        onClick={handleSend}
                        disabled={!value.trim() || disabled}
                        variant="gradient"
                        gradient={{ from: 'violet', to: 'pink' }}
                        size="lg"
                        radius="xl"
                        mr={4}
                    >
                        <IconSend size="1.2rem" />
                    </ActionIcon>
                }
                rightSectionWidth={52}
                disabled={disabled}
                styles={(theme) => ({
                    input: {
                        backgroundColor: 'var(--mantine-color-body)',
                        border: '1px solid var(--mantine-color-default-border)',
                        paddingLeft: 24,
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        '&:focus': {
                            borderColor: theme.colors.violet[5],
                            boxShadow: '0 0 0 2px var(--mantine-color-violet-light)',
                        },
                    }
                })}
            />
        </Paper>
    );
}
