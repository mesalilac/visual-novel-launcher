import type { CommandError } from '@/bindings';

export const toTitleCase = (str: string): string => {
    return str
        .toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
};

export const handleIpcError = (error: unknown) => {
    console.error(error);
};

export const reportIpcError = (e: CommandError) => {
    console.error(e);
};
