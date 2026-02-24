import { useGlobalData } from '@/store';
import './FilterBox.css';
import gsap from 'gsap';
import { createEffect, createMemo, For, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
    Divider,
    IconCaretDownMd,
    IconCaretUpMd,
    IconCheckboxCheck,
    IconCheckboxUnchecked,
    Popover,
    Select,
} from '@/components';
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
                <Select
                    onDeselectAll={() => {
                        globalData.setStore('vnsFilter', 'tagIds', []);
                    }}
                    onToggle={(id) => {
                        if (globalData.store.vnsFilter.tagIds.includes(id)) {
                            globalData.setStore('vnsFilter', 'tagIds', [
                                ...globalData.store.vnsFilter.tagIds.filter(
                                    (tagId) => tagId !== id,
                                ),
                            ]);
                            return;
                        }

                        globalData.setStore('vnsFilter', 'tagIds', [
                            ...globalData.store.vnsFilter.tagIds,
                            id,
                        ]);
                    }}
                    options={
                        globalData.resources.tags.get()?.map((tag) => ({
                            value: tag.id,
                            label: `${tag.name} (${tag.visualNovels.length})`,
                        })) || []
                    }
                    pinSelected={true}
                    placeholder='Select tags'
                    selected={globalData.store.vnsFilter.tagIds}
                />
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
