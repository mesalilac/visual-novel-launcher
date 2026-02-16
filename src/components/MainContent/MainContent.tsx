import { createMemo, For, Match, Switch } from 'solid-js';
import { LoadingDots, VisualNovelCard } from '@/components';
import { useGlobalData } from '@/store';

import './MainContent.css';
import { createStore } from 'solid-js/store';
import { type SortDirectionType, sortDirectionList } from '@/consts';

const sortByStatusList = [
    'All',
    'Playing',
    'Finished',
    'Dropped',
    'Backlog',
    'Unplayed',
] as const;
type SortByStatusType = (typeof sortByStatusList)[number];

const sortByList = ['Relevance', 'Name', 'Date Added'] as const;
type SortByType = (typeof sortByList)[number];

export const MainContent = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    const [filterStore, setFilterStore] = createStore<{
        query: string;
        status: SortByStatusType;
        sortBy: SortByType;
        sortDirection: SortDirectionType;
    }>({
        query: '',
        status: 'All',
        sortBy: 'Relevance',
        sortDirection: 'Desc',
    });

    const sortedVns = createMemo(() => {
        const list = [...(vns.get() || [])];
        const query = filterStore.query.trim().toLowerCase();
        const statusFilter = filterStore.status;
        const sortBy = filterStore.sortBy;
        const direction = filterStore.sortDirection;

        const filtered = list.filter((vn) => {
            const matchesQuery =
                !query || vn.title.toLowerCase().includes(query);

            let matchesStatus = true;
            if (statusFilter === 'Unplayed') {
                matchesStatus = vn.playtime === 0;
            } else if (statusFilter !== 'All') {
                matchesStatus = vn.status === statusFilter;
            }

            return matchesQuery && matchesStatus;
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

    return (
        <>
            <div class='flex-row justify-between'>
                <input
                    onInput={(e) => setFilterStore('query', e.target.value)}
                    placeholder='Search'
                    type='search'
                    value={filterStore.query}
                />
                <div class='flex-row'>
                    <select
                        onChange={(e) =>
                            setFilterStore(
                                'status',
                                e.target.value as SortByStatusType,
                            )
                        }
                    >
                        <For each={sortByStatusList}>
                            {(status) => (
                                <option
                                    selected={status === filterStore.status}
                                    value={status}
                                >
                                    {status}
                                </option>
                            )}
                        </For>
                    </select>
                    <select
                        onChange={(e) =>
                            setFilterStore(
                                'sortBy',
                                e.target.value as SortByType,
                            )
                        }
                    >
                        <For each={sortByList}>
                            {(status) => (
                                <option
                                    selected={status === filterStore.sortBy}
                                    value={status}
                                >
                                    {status}
                                </option>
                            )}
                        </For>
                    </select>
                    <select
                        onChange={(e) =>
                            setFilterStore(
                                'sortDirection',
                                e.target.value as SortDirectionType,
                            )
                        }
                    >
                        <For each={sortDirectionList}>
                            {(option) => (
                                <option
                                    selected={
                                        option === filterStore.sortDirection
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
                                <Match
                                    when={
                                        vns().length === 0 && !filterStore.query
                                    }
                                >
                                    <span>
                                        No Visual Novels found. Try adding a
                                        library in settings!
                                    </span>
                                </Match>
                                <Match
                                    when={
                                        vns().length === 0 && filterStore.query
                                    }
                                >
                                    <span>No Visual Novels found.</span>
                                </Match>
                                <Match when={vns().length > 0}>
                                    <div class='cards-container'>
                                        <For each={vns()}>
                                            {(vn) => (
                                                <VisualNovelCard vn={vn} />
                                            )}
                                        </For>
                                    </div>
                                </Match>
                            </Switch>
                        )}
                    </Match>
                </Switch>
            </main>
        </>
    );
};
