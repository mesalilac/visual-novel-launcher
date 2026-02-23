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
} from '@/components';
import {
    type SortByStatusType,
    type SortByType,
    type SortDirectionType,
    sortByList,
    sortByStatusList,
    sortDirectionList,
} from '@/consts';

const TagsSelectMenu = () => {
    const globalData = useGlobalData();

    let popoverMenuRef: HTMLButtonElement | undefined;
    let popoverRef!: HTMLDivElement;

    const [store, setStore] = createStore({
        open: false,
        searchQuery: '',
    });

    const filteredTags = createMemo(() => {
        return globalData.resources.tags
            .get()
            ?.filter((tag) =>
                tag.name
                    .toLowerCase()
                    .includes(store.searchQuery.toLowerCase()),
            );
    });

    const sortedTags = createMemo(() => {
        const list = [...(filteredTags() || [])];

        return list.sort((a, b) => {
            const aSelected = globalData.store.vnsFilter.tagIds.includes(a.id);
            const bSelected = globalData.store.vnsFilter.tagIds.includes(b.id);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;

            return 0;
        });
    });

    const toggleTagState = (id: string) => {
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
    };

    createEffect(() => {
        if (store.open) {
            gsap.timeline().from(popoverRef, {
                y: 20,
                autoAlpha: 0,
                duration: 0.2,
                ease: 'circ',
            });
        }
    });

    return (
        <>
            <button
                class='multiselect-menu__trigger'
                ref={popoverMenuRef}
                style={{
                    'background-color': store.open
                        ? 'var(--s-color-background-surface-4-pressed)'
                        : '',
                }}
                type='button'
            >
                Select Tags (
                {globalData.store.vnsFilter.tagIds.length
                    .toString()
                    .padStart(
                        globalData.resources.tags.get()?.length.toString()
                            .length || 3,
                        '0',
                    )}
                )
                <Show
                    fallback={<IconCaretDownMd size='1.5em' />}
                    when={store.open}
                >
                    <IconCaretUpMd size='1.5em' />
                </Show>
            </button>
            <Popover
                onOpenChange={(v) => setStore('open', v)}
                open={store.open}
                targetPositionArea='bottom center'
                triggerElement={popoverMenuRef}
            >
                <div
                    class='flex-column margin-top-xs multiselect__menu'
                    ref={popoverRef}
                >
                    <div class='multiselect__menu__filter'>
                        <input
                            onInput={(e) =>
                                setStore('searchQuery', e.target.value)
                            }
                            placeholder='Search...'
                            type='search'
                            value={store.searchQuery}
                        />
                        <button
                            onClick={() =>
                                globalData.setStore(
                                    'vnsFilter',
                                    'tagIds',
                                    (globalData.resources.tags.get() ?? []).map(
                                        (x) => x.id,
                                    ),
                                )
                            }
                            title='Select all'
                            type='button'
                        >
                            <IconCheckboxCheck />
                        </button>
                        <button
                            onClick={() =>
                                globalData.setStore('vnsFilter', 'tagIds', [])
                            }
                            title='Unselect all'
                            type='button'
                        >
                            <IconCheckboxUnchecked />
                        </button>
                    </div>
                    <Divider />
                    <div class='multiselect-menu__list'>
                        <For each={sortedTags()}>
                            {(tag) => {
                                const isSelected = () =>
                                    globalData.store.vnsFilter.tagIds.includes(
                                        tag.id,
                                    );

                                return (
                                    <button
                                        class='multiselect-menu__item'
                                        classList={{
                                            selected: isSelected(),
                                        }}
                                        onClick={() => toggleTagState(tag.id)}
                                        type='button'
                                    >
                                        <Show
                                            fallback={<IconCheckboxUnchecked />}
                                            when={isSelected()}
                                        >
                                            <IconCheckboxCheck />
                                        </Show>
                                        {tag.name} ({tag.visualNovels.length})
                                    </button>
                                );
                            }}
                        </For>
                    </div>
                </div>
            </Popover>
        </>
    );
};

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
                <TagsSelectMenu />
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
