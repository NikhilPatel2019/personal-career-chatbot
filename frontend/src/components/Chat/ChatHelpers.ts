export interface Message {
    id: string;
    content: string;
    role: 'user' | 'assistant' | 'system';
}

// Helper to perform the API call
export const fetchChatStream = async (messages: Message[]) => {
    return fetch('http://localhost:8000/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
    });
};

// Helper to process the stream response
export const processStreamResponse = async (
    stream: ReadableStream<Uint8Array>,
    onChunk: (role: string, content: string) => void
) => {
    const reader = stream.getReader();
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

                onChunk(eventRole, eventContent);
            } catch (err) {
                console.error('Failed to parse SSE data chunk:', err, part);
            }
        }
    }
};

// Helper to update messages state based on new chunk
export const updateMessagesWithChunk = (prev: Message[], eventRole: string, eventContent: string): Message[] => {
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
};
