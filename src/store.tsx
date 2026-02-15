import {
    createContext,
    createResource,
    type JSX,
    type Resource,
    type ResourceActions,
    useContext,
} from 'solid-js';
import { createStore, type SetStoreFunction } from 'solid-js/store';
import {
    commands,
    type GeneralStats,
    type PlaySession,
    type Setting,
    type TagWithVisualNovels,
    type VisualNovel,
} from '@/bindings';

export type ManagedResource<T> = {
    get: Resource<T>;
    refetch: ResourceActions<T | undefined, unknown>['refetch'];
    mutate: ResourceActions<T | undefined, unknown>['mutate'];
};

export type GameState = {
    id: string;
    startedAt: number;
};

export type GlobalStore = {
    gameState: GameState | null;
};

export type GlobalData = {
    store: GlobalStore;
    setStore: SetStoreFunction<GlobalStore>;

    resources: {
        vns: ManagedResource<VisualNovel[]>;
        tags: ManagedResource<TagWithVisualNovels[]>;
        settings: ManagedResource<Setting>;
        playSessions: ManagedResource<PlaySession[]>;
        generalStats: ManagedResource<GeneralStats>;
    };
};

const createGlobalData = (): GlobalData => {
    const [store, setStore] = createStore<GlobalStore>({
        gameState: null,
    });

    const [vns, vnsActions] = createResource(async () => {
        const res = await commands.getVisualNovels();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [tags, tagsActions] = createResource(async () => {
        const res = await commands.getTags();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [settings, settingsActions] = createResource(async () => {
        const res = await commands.getSettings();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [playSessions, playSessionsActions] = createResource(async () => {
        const res = await commands.getPlaySessions();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    const [generalStats, generalStatsActions] = createResource(async () => {
        const res = await commands.getStats();
        if (res.status === 'ok') return res.data;
        throw res.error;
    });

    return {
        store,
        setStore,
        resources: {
            vns: {
                get: vns,
                refetch: vnsActions.refetch,
                mutate: vnsActions.mutate,
            },
            tags: {
                get: tags,
                refetch: tagsActions.refetch,
                mutate: tagsActions.mutate,
            },
            settings: {
                get: settings,
                refetch: settingsActions.refetch,
                mutate: settingsActions.mutate,
            },
            playSessions: {
                get: playSessions,
                refetch: playSessionsActions.refetch,
                mutate: playSessionsActions.mutate,
            },
            generalStats: {
                get: generalStats,
                refetch: generalStatsActions.refetch,
                mutate: generalStatsActions.mutate,
            },
        },
    };
};

const GlobalContext = createContext<GlobalData>();

export const useGlobalData = () => {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error(
            'useGlobalData must be used within a GlobalDataProvider',
        );
    }

    return context;
};

export function GlobalDataProvider(props: { children: JSX.Element }) {
    const globalData = createGlobalData();

    return (
        <GlobalContext.Provider value={globalData}>
            {props.children}
        </GlobalContext.Provider>
    );
}
