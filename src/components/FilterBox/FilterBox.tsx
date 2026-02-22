import { useGlobalData } from '@/store';
import './FilterBox.css';
import { For } from 'solid-js';
import {
    type SortByStatusType,
    type SortByType,
    type SortDirectionType,
    sortByList,
    sortByStatusList,
    sortDirectionList,
} from '@/consts';

export const FilterBox = () => {
    const globalData = useGlobalData();

    return (
        <div class='flex-row justify-between'>
            <input
                onInput={(e) =>
                    globalData.setStore('vnsFilter', 'query', e.target.value)
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
                                    status === globalData.store.vnsFilter.status
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
                                    status === globalData.store.vnsFilter.sortBy
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
    );
};
