import { createMemo, createSignal, For, Show } from 'solid-js';
import { commands, type TagWithVisualNovels } from '@/bindings';
import {
    IconAddPlus,
    IconArrowReload02,
    IconCloseMd,
    IconEditPencilLine01,
    IconSave,
    IconTag,
    IconTrashFull,
} from '@/components';
import { type SortDirectionType, sortDirection } from '@/consts';
import { useGlobalData } from '@/store';

import './TagsManager.css';

const sortByList = ['Relevance', 'Name', 'Date Added'] as const;
type SortByType = (typeof sortByList)[number];

const TagItem = (props: { tag: TagWithVisualNovels }) => {
    const globalData = useGlobalData();

    let nameRef: HTMLSpanElement | undefined;

    const [tagName, setTagName] = createSignal(props.tag.name);
    const [editingName, setEditingName] = createSignal(false);

    const resetName = () => {
        setTagName(props.tag.name);
        setEditingName(false);
        if (nameRef) {
            nameRef.textContent = props.tag.name;
            nameRef.contentEditable = 'false';
        }
    };

    const onEdit = () => {
        if (nameRef) {
            nameRef.contentEditable = 'true';
            nameRef.focus();
        }

        setEditingName(true);
    };

    const onSave = async () => {
        if (nameRef) nameRef.contentEditable = 'false';
        setEditingName(false);

        const name = tagName().trim();

        if (!name) {
            resetName();
        }

        if (name === props.tag.name) return;

        try {
            const res = await commands.updateTag(props.tag.id, { name });

            if (res.status === 'ok') {
                globalData.resources.tags.mutate((prev) => {
                    if (!prev) return;

                    return prev.map((tag) => {
                        return tag.id === props.tag.id
                            ? { ...tag, name: res.data.name }
                            : tag;
                    });
                });
            } else if (res.status === 'error') console.error(res.error);
        } catch (e) {
            console.error(e);
        }
    };

    const onDelete = async () => {
        try {
            const res = await commands.removeTagById(props.tag.id);

            if (res.status === 'ok') {
                globalData.resources.tags.mutate((prev) => {
                    if (!prev) return;

                    return prev.filter((tag) => tag.id !== props.tag.id);
                });
            } else if (res.status === 'error') console.error(res.error);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div class='flex-row gap-xl surface-3 padding-sm'>
            <div class='flex-row'>
                <IconTag />
                <span
                    onInput={(e) => setTagName(e.target.textContent)}
                    ref={nameRef}
                    title={tagName()}
                >
                    {props.tag.name}
                </span>
                <div class='user-select-none surface-4 padding-sides-sm radius-round'>
                    {props.tag.visualNovels.length}
                </div>
            </div>
            <div class='flex-row'>
                <Show
                    fallback={
                        <>
                            <IconEditPencilLine01
                                class='icon-clickable tag-edit-icon'
                                onClick={onEdit}
                            />
                            <IconTrashFull
                                class='icon-clickable tag-delete-icon'
                                onClick={onDelete}
                            />
                        </>
                    }
                    when={editingName()}
                >
                    <IconSave
                        class='icon-clickable tag-save-icon'
                        onClick={onSave}
                    />
                    <IconCloseMd class='icon-clickable' onClick={resetName} />
                </Show>
            </div>
        </div>
    );
};

export const TagsManager = () => {
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

        try {
            const res = await commands.createTag({ name });

            if (res.status === 'ok') {
                globalData.resources.tags.mutate((prev) => {
                    if (!prev) return;
                    return [...prev, res.data];
                });
            } else if (res.status === 'error') console.error(res.error);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div class='flex-column surface-2 padding-sm radius-lg'>
            <div class='flex-row'>
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
                    <For each={sortDirection}>
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
            <div class='flex-row overflow-auto'>
                <Show when={searchQuery()}>
                    <button
                        class='button-primary'
                        onClick={addNewTag}
                        type='button'
                    >
                        <IconAddPlus /> {searchQuery()}
                    </button>
                </Show>
                <For each={sortedTags()}>{(tag) => <TagItem tag={tag} />}</For>
            </div>
        </div>
    );
};
