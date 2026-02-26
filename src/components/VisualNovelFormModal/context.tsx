import { createContext, useContext } from 'solid-js';
import type { SetStoreFunction } from 'solid-js/store';
import type {
    TagWithVisualNovels,
    VisualNovel,
    VisualNovelStatus,
} from '@/bindings';

export type Mode =
    | { type: 'create' }
    | ({ type: 'edit'; vn: VisualNovel } & {});

export type VisualNovelForm = {
    coverPath?: string | null;
    title?: string | null;
    description?: string | null;
    status?: VisualNovelStatus | null;
    playtime?: number | null;
    isFavorite?: boolean | null;
    dirPath?: string | null;
    notes?: string | null;
    executablePath?: string | null;
    launchOptions?: string | null;
    useLocaleEmulator?: boolean | null;
    tagIds?: TagWithVisualNovels[];
};

export type VisualNovelStore = {
    form: VisualNovelForm;
    mode: Mode;
};

export const VisualNovelStoreContext = createContext<{
    get: VisualNovelStore;
    set: SetStoreFunction<VisualNovelStore>;
}>();

export const useVisualNovelStoreContext = () => {
    const context = useContext(VisualNovelStoreContext);

    if (!context) {
        throw new Error("can't find context");
    }

    return context;
};
