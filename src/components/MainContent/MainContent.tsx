import {
    createEffect,
    createMemo,
    createSignal,
    For,
    Match,
    onCleanup,
    onMount,
    Switch,
} from 'solid-js';
import { events } from '@/bindings';
import { LoadingDots, VisualNovelCard } from '@/components';
import { useGlobalData } from '@/store';
import './MainContent.css';
import gsap from 'gsap';

export const MainContent = () => {
    let gridRef: HTMLDivElement | undefined;

    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    const [hasAnimated, setHasAnimated] = createSignal(false);

    onMount(() => {
        events.gameClosed.listen((e) => {
            if (globalData.store.gameState?.processId === e.payload.pid) {
                globalData.setStore('gameState', null);
                vns.mutate((prev) => {
                    if (!prev) return;

                    return prev.map((vn) => {
                        return vn.id === e.payload.vn_id
                            ? {
                                  ...vn,
                                  playtime: e.payload.playtime,
                                  lastTimePlayedAt:
                                      e.payload.last_time_played_at,
                              }
                            : vn;
                    });
                });
                globalData.resources.generalStats.refetch();
                globalData.resources.playSessions.refetch();
            }
        });

        events.metadataUpdated.listen((e) => {
            globalData.resources.vns.mutate((prev) => {
                if (!prev) return;

                return prev.map((vn) =>
                    vn.id === e.payload.vn.id ? { ...e.payload.vn } : vn,
                );
            });
        });
    });

    createEffect(() => {
        if (vns.get.state === 'ready' && !hasAnimated()) {
            const ctx = gsap.context(() => {
                gsap.from('.visual-novel-card', {
                    y: 100,
                    rotation: 2,
                    opacity: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    stagger: {
                        grid: 'auto',
                        from: 'start',
                        amount: 0.5,
                    },
                    onComplete: () => {
                        setHasAnimated(true);
                    },
                });
            }, gridRef);

            onCleanup(() => ctx.revert());
        }
    });

    const sortedVns = createMemo(() => {
        const list = [...(vns.get() || [])];
        const query = globalData.store.vnsFilter.query.trim().toLowerCase();
        const statusFilter = globalData.store.vnsFilter.status;
        const sortBy = globalData.store.vnsFilter.sortBy;
        const direction = globalData.store.vnsFilter.sortDirection;

        const filtered = list.filter((vn) => {
            const matchesQuery =
                !query || vn.title.toLowerCase().includes(query);

            let matchesStatus = true;
            if (statusFilter === 'Unplayed') {
                matchesStatus = vn.playtime === 0;
            } else if (statusFilter !== 'All') {
                matchesStatus = vn.status === statusFilter;
            }

            let matchesTags = true;
            if (globalData.store.vnsFilter.tagIds.length > 0) {
                matchesTags = vn.tags.some((tag) =>
                    globalData.store.vnsFilter.tagIds.includes(tag.id),
                );
            }

            return matchesQuery && matchesStatus && matchesTags;
        });

        return filtered.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;

            let result = 0;

            switch (sortBy) {
                case 'Relevance':
                    result =
                        (a.lastTimePlayedAt || 0) - (b.lastTimePlayedAt || 0);
                    break;
                case 'Name':
                    result = a.title.localeCompare(b.title);
                    break;
                case 'Date Added':
                    result = a.createdAt - b.createdAt;
                    break;
            }

            return direction === 'Asc' ? result : -result;
        });
    });

    createEffect(() => {
        globalData.setStore('vnsFilter', 'totalCount', sortedVns().length);
    });

    return (
        <main>
            <Switch fallback={<span>Failed to display visual novels</span>}>
                <Match when={vns.get.state === 'pending'}>
                    <span>Loading</span> <LoadingDots />
                </Match>
                <Match when={vns.get.state === 'refreshing'}>
                    <span>Refreshing</span> <LoadingDots />
                </Match>
                <Match when={vns.get.state === 'errored'}>
                    <span>{vns.get.error}</span>
                </Match>
                <Match when={vns.get.state === 'ready' && sortedVns()}>
                    {(vns) => (
                        <Switch>
                            <Match when={vns().length > 0}>
                                <div class='cards-container' ref={gridRef}>
                                    <For each={vns()}>
                                        {(vn) => <VisualNovelCard vn={vn} />}
                                    </For>
                                </div>
                            </Match>
                            <Match
                                when={
                                    vns().length === 0 &&
                                    (globalData.store.vnsFilter.query ||
                                        globalData.store.vnsFilter.tagIds
                                            .length > 0)
                                }
                            >
                                <span>No Visual Novels found.</span>
                            </Match>
                            <Match when={vns().length === 0}>
                                <span>
                                    No Visual Novels found. Try adding a library
                                    in settings!
                                </span>
                            </Match>
                        </Switch>
                    )}
                </Match>
            </Switch>
        </main>
    );
};
