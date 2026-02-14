import { commands, type TagWithVisualNovels } from '@bindings';
import './TagsManager.css';

import {
    IconArrowReload02,
    IconCloseMd,
    IconEditPencilLine01,
    IconSave,
    IconTag,
    IconTrashFull,
} from '@components';
import { sortDirection, tagSortBy } from '@consts';
import { useGlobalData } from '@store';
import { createEffect, createSignal, For, Show } from 'solid-js';

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
                <div class='surface-4 padding-sides-sm radius-round'>
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

    const [filteredTags, setFilteredTags] = createSignal<TagWithVisualNovels[]>(
        [],
    );
    const [searchQuery, setSearchQuery] = createSignal('');

    createEffect(() => {
        if (tagsWithVns.get.state === 'ready') {
            setFilteredTags(tagsWithVns.get());
        }
    });

    createEffect(() => {
        if (tagsWithVns.get.state === 'ready') {
            if (searchQuery()) {
                setFilteredTags(
                    tagsWithVns
                        .get()
                        .filter((tag) =>
                            tag.name
                                .toLowerCase()
                                .includes(searchQuery().toLowerCase()),
                        ),
                );
            } else {
                setFilteredTags(tagsWithVns.get());
            }
        }
    });

    const refresh = () => {
        globalData.resources.tags.refetch();
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
                <select>
                    <For each={tagSortBy}>
                        {(sortBy) => (
                            <option
                                selected={sortBy === 'Relevance'}
                                value={sortBy}
                            >
                                {sortBy}
                            </option>
                        )}
                    </For>
                </select>
                <select>
                    <For each={sortDirection}>
                        {(sortDir) => (
                            <option
                                selected={sortDir === 'Desc'}
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
            <div class='flex-row'>
                <For each={filteredTags()}>
                    {(tag) => <TagItem tag={tag} />}
                </For>
            </div>
        </div>
    );
};
