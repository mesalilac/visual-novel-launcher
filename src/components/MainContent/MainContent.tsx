import {
    createEffect,
    createMemo,
    For,
    Match,
    onMount,
    Switch,
} from 'solid-js';
import { LoadingDots, VisualNovelCard } from '@/components';
import { useGlobalData } from '@/store';
import './MainContent.css';

import { events } from '@/bindings';
import {
    type SortByStatusType,
    type SortByType,
    type SortDirectionType,
    sortByList,
    sortByStatusList,
    sortDirectionList,
} from '@/consts';

export const MainContent = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

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
            }
        });
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
        <>
            <div class='flex-row justify-between'>
                <input
                    onInput={(e) =>
                        globalData.setStore(
                            'vnsFilter',
                            'query',
                            e.target.value,
                        )
                    }
                    placeholder='Search'
                    type='search'
                    value={globalData.store.vnsFilter.query}
                />
                <div class='flex-row'>
                    <select
                        multiple
                        onChange={(e) => {
                            const ids = Array.from(
                                e.currentTarget.selectedOptions,
                            ).map((x) => x.value);

                            globalData.setStore('vnsFilter', 'tagIds', ids);
                        }}
                    >
                        <For each={globalData.resources.tags.get()}>
                            {(tag) => (
                                <option
                                    selected={globalData.store.vnsFilter.tagIds.includes(
                                        tag.id,
                                    )}
                                    value={tag.id}
                                >
                                    {tag.name} ({tag.visualNovels.length})
                                </option>
                            )}
                        </For>
                    </select>
                    <select
                        onChange={(e) =>
                            globalData.setStore(
                                'vnsFilter',
                                'status',
                                e.target.value as SortByStatusType,
                            )
                        }
                    >
                        <For each={sortByStatusList}>
                            {(status) => (
                                <option
                                    selected={
                                        status ===
                                        globalData.store.vnsFilter.status
                                    }
                                    value={status}
                                >
                                    {status}
                                </option>
                            )}
                        </For>
                    </select>
                    <select
                        onChange={(e) =>
                            globalData.setStore(
                                'vnsFilter',
                                'sortBy',
                                e.target.value as SortByType,
                            )
                        }
                    >
                        <For each={sortByList}>
                            {(status) => (
                                <option
                                    selected={
                                        status ===
                                        globalData.store.vnsFilter.sortBy
                                    }
                                    value={status}
                                >
                                    {status}
                                </option>
                            )}
                        </For>
                    </select>
                    <select
                        onChange={(e) =>
                            globalData.setStore(
                                'vnsFilter',
                                'sortDirection',
                                e.target.value as SortDirectionType,
                            )
                        }
                    >
                        <For each={sortDirectionList}>
                            {(option) => (
                                <option
                                    selected={
                                        option ===
                                        globalData.store.vnsFilter.sortDirection
                                    }
                                    value={option}
                                >
                                    {option}
                                </option>
                            )}
                        </For>
                    </select>
                </div>
            </div>
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
                                    <div class='cards-container'>
                                        <For each={vns()}>
                                            {(vn) => (
                                                <VisualNovelCard vn={vn} />
                                            )}
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
                                        No Visual Novels found. Try adding a
                                        library in settings!
                                    </span>
                                </Match>
                            </Switch>
                        )}
                    </Match>
                </Switch>
            </main>
        </>
    );
};
