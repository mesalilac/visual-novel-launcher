import { createMemo, createSignal, For, Show } from 'solid-js';
import { commands, type TagWithVisualNovels } from '@/bindings';
import {
    Divider,
    IconAddPlus,
    IconArrowReload02,
    IconRemoveMinus,
    IconTag,
    Select,
} from '@/components';
import { type SortDirectionType, sortDirectionList } from '@/consts';
import { useGlobalData } from '@/store';

import './TagsPicker.css';
import { handleIpcError, reportIpcError } from '@/utils';

const sortByList = ['Relevance', 'Name', 'Date Added'] as const;
type SortByType = (typeof sortByList)[number];

const TagItem = (props: {
    tag: TagWithVisualNovels;
    tagIds: TagWithVisualNovels[] | undefined;
    onChange: (tagIds: TagWithVisualNovels[]) => void;
}) => {
    const isSelected = () => {
        return props.tagIds?.some((x) => x.id === props.tag.id);
    };

    const addTag = () => {
        props.onChange([...(props.tagIds || []), props.tag]);
    };

    const removeTag = () => {
        props.onChange(
            props.tagIds?.filter((x) => x.id !== props.tag.id) || [],
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

/**
 * Custom tags picker
 * @example onChange={(tags) => editStore.set('tagIds', tags)}
                    tagIds={editStore.get.tagIds}
 */
export const TagsPicker = (props: {
    tagIds: TagWithVisualNovels[] | undefined;
    onChange: (tagIds: TagWithVisualNovels[]) => void;
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
            const aSelected = props.tagIds?.some((x) => x.id === a.id);
            const bSelected = props.tagIds?.some((x) => x.id === b.id);

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

        props.onChange([...(props.tagIds || []), res.data]);
        setSearchQuery('');
    };

    return (
        <div class='flex-column surface-2 padding-sm radius-lg'>
            <div class='flex-row align-stretch padding-sm'>
                <input
                    class='flex-grow'
                    onInput={(e) => setSearchQuery(e.target.value)}
                    placeholder='Search...'
                    type='search'
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
                <Select
                    onToggle={(value) => setSearchSortBy(value as SortByType)}
                    options={sortByList.map((x) => ({ value: x }))}
                    selected={searchSortBy()}
                />
                <Select
                    onToggle={(value) =>
                        setSearchSortDirection(value as SortDirectionType)
                    }
                    options={sortDirectionList.map((x) => ({ value: x }))}
                    selected={searchSortDirection()}
                />
                <button class='refresh-button' type='button'>
                    <IconArrowReload02
                        class='refresh-button__icon'
                        onClick={refresh}
                    />
                </button>
            </div>
            <Divider />
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
                            onChange={props.onChange}
                            tag={tag}
                            tagIds={props.tagIds}
                        />
                    )}
                </For>
            </div>
        </div>
    );
};
