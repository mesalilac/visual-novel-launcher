import toast from 'solid-toast';
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
    toast.error(error instanceof Error ? error.message : String(error));
};

export const reportIpcError = (e: CommandError) => {
    const kind = e.kind;
    const message =
        'message' in e ? e.message : 'No additional details available.';

    console.error(e);
    toast.error(`${kind}: ${message}`);
};
