import { createMemo, createSignal, For, Show } from 'solid-js';
import { commands, type TagWithVisualNovels } from '@/bindings';
import {
    type EditStore,
    IconAddPlus,
    IconArrowReload02,
    IconRemoveMinus,
    IconTag,
} from '@/components';
import { type SortDirectionType, sortDirectionList } from '@/consts';
import { useGlobalData } from '@/store';

import './TagsPicker.css';
import type { SetStoreFunction } from 'solid-js/store';
import { handleIpcError, reportIpcError } from '@/utils';

const sortByList = ['Relevance', 'Name', 'Date Added'] as const;
type SortByType = (typeof sortByList)[number];

const TagItem = (props: {
    tag: TagWithVisualNovels;
    editStore: EditStore;
    setEditStore: SetStoreFunction<EditStore>;
}) => {
    const isSelected = () => {
        return props.editStore.tags?.some((x) => x.id === props.tag.id);
    };

    const addTag = () => {
        props.setEditStore('tags', [
            ...(props.editStore.tags || []),
            props.tag,
        ]);
    };

    const removeTag = () => {
        props.setEditStore(
            'tags',
            props.editStore.tags?.filter((x) => x.id !== props.tag.id),
        );
    };

    return (
        <div
            class='flex-row gap-xl surface-3 padding-sm'
            style={{
                outline: isSelected()
                    ? 'var(--s-size-border-md) solid var(--s-color-background-info)'
                    : '',
            }}
        >
            <div class='flex-row'>
                <IconTag />
                <span title={props.tag.name}>{props.tag.name}</span>
                <div class='user-select-none surface-4 padding-sides-sm radius-round'>
                    {props.tag.visualNovels.length}
                </div>
            </div>
            <div class='flex-row'>
                <Show
                    fallback={
                        <IconAddPlus
                            class='icon-clickable'
                            onClick={addTag}
                            size='1.2em'
                        />
                    }
                    when={isSelected()}
                >
                    <IconRemoveMinus
                        class='icon-clickable'
                        onClick={removeTag}
                        size='1.2em'
                    />
                </Show>
            </div>
        </div>
    );
};

export const TagsPicker = (props: {
    editStore: EditStore;
    setEditStore: SetStoreFunction<EditStore>;
}) => {
    const globalData = useGlobalData();

    const tagsWithVns = globalData.resources.tags;

    const [searchQuery, setSearchQuery] = createSignal('');

    const [searchSortBy, setSearchSortBy] =
        createSignal<SortByType>('Relevance');
    const [searchSortDirection, setSearchSortDirection] =
        createSignal<SortDirectionType>('Desc');

    const filteredTags = createMemo(() => {
        const tags = tagsWithVns.get() || [];
        const query = searchQuery().trim().toLowerCase();

        if (!query) return tags;

        return tags.filter((tag) => tag.name.toLowerCase().includes(query));
    });

    const sortedTags = createMemo(() => {
        const list = [...(filteredTags() || [])];
        const sortBy = searchSortBy();
        const direction = searchSortDirection();

        return list.sort((a, b) => {
            const aSelected = props.editStore.tags?.some((x) => x.id === a.id);
            const bSelected = props.editStore.tags?.some((x) => x.id === b.id);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;

            let result = 0;

            if (sortBy === 'Relevance') {
                result = a.visualNovels.length - b.visualNovels.length;
            } else if (sortBy === 'Name') {
                result = a.name.localeCompare(b.name);
            } else if (sortBy === 'Date Added') {
                result =
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime();
            }

            return direction === 'Asc' ? result : -result;
        });
    });

    const refresh = () => {
        globalData.resources.tags.refetch();
    };

    const addNewTag = async () => {
        const name = searchQuery().trim();

        if (!name) return;

        const res = await commands.createTag({ name }).catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }

        globalData.resources.tags.mutate((prev) => {
            if (!prev) return;
            return [...prev, res.data];
        });

        props.setEditStore('tags', (prev) => {
            if (!prev) return;

            return [...prev, res.data];
        });
    };

    return (
        <div class='flex-column surface-2 padding-sm radius-lg'>
            <div class='flex-row padding-sm'>
                <input
                    class='flex-grow'
                    onInput={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search...'
                    type='text'
                    value={searchQuery()}
                />
                <span class='flex-row gap-sm surface-3 padding-sm radius-md'>
                    <span
                        classList={{
                            'tag-count-no-results': filteredTags().length === 0,
                        }}
                    >
                        {filteredTags().length}
                    </span>
                    <span>/</span>
                    <span>{tagsWithVns.get()?.length}</span>
                </span>
                <select
                    onChange={(e) =>
                        setSearchSortBy(e.target.value as SortByType)
                    }
                >
                    <For each={sortByList}>
                        {(sortBy) => (
                            <option
                                selected={sortBy === searchSortBy()}
                                value={sortBy}
                            >
                                {sortBy}
                            </option>
                        )}
                    </For>
                </select>
                <select
                    onChange={(e) =>
                        setSearchSortDirection(
                            e.target.value as SortDirectionType,
                        )
                    }
                >
                    <For each={sortDirectionList}>
                        {(sortDir) => (
                            <option
                                selected={sortDir === searchSortDirection()}
                                value={sortDir}
                            >
                                {sortDir}
                            </option>
                        )}
                    </For>
                </select>
                <IconArrowReload02
                    class='icon-clickable refresh-icon'
                    onClick={refresh}
                />
            </div>
            <div class='divider' />
            <div class='flex-row padding-sm overflow-auto'>
                <Show when={searchQuery()}>
                    <button
                        class='button-primary'
                        onClick={addNewTag}
                        type='button'
                    >
                        <IconAddPlus /> {searchQuery()}
                    </button>
                </Show>
                <For each={sortedTags()}>
                    {(tag) => (
                        <TagItem
                            editStore={props.editStore}
                            setEditStore={props.setEditStore}
                            tag={tag}
                        />
                    )}
                </For>
            </div>
        </div>
    );
};
