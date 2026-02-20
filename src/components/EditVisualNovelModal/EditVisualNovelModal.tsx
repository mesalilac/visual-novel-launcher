import { open } from '@tauri-apps/plugin-dialog';
import { createSignal, For, type JSX } from 'solid-js';
import defaultCover from '@/assets/cover-image-placeholder.svg';
import type { VisualNovel, VisualNovelStatus } from '@/bindings';
import { ModalDismissButton, TagsPicker, useModalContext } from '@/components';
import './EditVisualNovelModal.css';
import { convertFileSrc } from '@tauri-apps/api/core';
import { createStore, type SetStoreFunction } from 'solid-js/store';
import { VisualNovelStatusList } from '@/consts';
import { toTitleCase } from '@/utils';

const Header = () => {
    return (
        <>
            <h2>Edit Visual Novel</h2>
            <div class='divider margin-bottom-lg' />
        </>
    );
};

const Footer = (props: { onSave: () => void }) => {
    return (
        <>
            <div class='divider margin-top-auto' />
            <div class='flex-row self-end'>
                <ModalDismissButton />
                <button
                    class='button-primary'
                    onClick={props.onSave}
                    type='button'
                >
                    Save
                </button>
            </div>
        </>
    );
};

const SideBar = (props: {
    vn: VisualNovel;
    editStore: EditStore;
    setEditStore: SetStoreFunction<EditStore>;
}) => {
    const [previewImgSrc, setPreviewImgSrc] = createSignal(
        props.vn.coverPath ? convertFileSrc(props.vn.coverPath) : defaultCover,
    );

    const handleResetImg = () => {
        props.setEditStore('rawImgSrc', props.vn.coverPath);
        setPreviewImgSrc(
            props.vn.coverPath
                ? convertFileSrc(props.vn.coverPath)
                : defaultCover,
        );
    };

    const handleBrowseImg = async () => {
        const path = await open({
            title: 'Select cover image',
            filters: [
                { name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
            ],
        });

        if (!path) return;

        props.setEditStore('rawImgSrc', path);
        setPreviewImgSrc(convertFileSrc(path));
    };

    return (
        <div class='edit-visual-novel-modal__sidebar'>
            <img
                aria-label='Visual novel cover'
                onError={() => setPreviewImgSrc(defaultCover)}
                src={previewImgSrc()}
            />
            <div class='flex-row'>
                <button
                    class='flex-grow'
                    onClick={handleBrowseImg}
                    type='button'
                >
                    Browse
                </button>
                <button
                    class='flex-grow'
                    onClick={handleResetImg}
                    type='button'
                >
                    Reset
                </button>
            </div>
        </div>
    );
};

const Block = (props: { title: string; children: JSX.Element }) => {
    return (
        <div class='edit-visual-novel-modal__block'>
            <div class='flex-column'>
                <h3>{toTitleCase(props.title)}</h3>
                <div class='divider margin-bottom-lg' />
            </div>
            <div class='flex-column gap-lg'>{props.children}</div>
        </div>
    );
};

const LabeledField = (props: {
    name: string;
    title?: string;
    children: JSX.Element;
}) => {
    return (
        <div class='flex-column flex-1'>
            <h4 title={props.title}>{toTitleCase(props.name)}:</h4>
            {props.children}
        </div>
    );
};

const Content = (props: {
    vn: VisualNovel;
    editStore: EditStore;
    setEditStore: SetStoreFunction<EditStore>;
}) => {
    const handleBrowseExe = async () => {
        const path = await open({
            title: 'Select game executable',
            defaultPath: props.vn.dirPath,
            filters: [{ name: 'Executable', extensions: ['exe'] }],
        });

        if (!path) return;

        props.setEditStore('executablePath', path);
    };

    return (
        <div class='edit-visual-novel-modal__content'>
            <Block title='properties'>
                <LabeledField name='title'>
                    <input
                        onChange={(e) =>
                            props.setEditStore('title', e.target.value)
                        }
                        placeholder='Title...'
                        type='text'
                        value={props.editStore.title ?? props.vn.title}
                    />
                </LabeledField>
                <div class='flex-row'>
                    <LabeledField name='status'>
                        <select
                            onChange={(e) => {
                                props.setEditStore(
                                    'status',
                                    e.target.value as VisualNovelStatus,
                                );
                            }}
                            value={props.editStore.status ?? props.vn.status}
                        >
                            <For each={VisualNovelStatusList}>
                                {(status) => (
                                    <option value={status}>{status}</option>
                                )}
                            </For>
                        </select>
                    </LabeledField>
                    <LabeledField name='playtime'>
                        <input
                            onChange={(e) =>
                                props.setEditStore(
                                    'playtime',
                                    e.target.valueAsNumber,
                                )
                            }
                            placeholder='Playtime...'
                            type='number'
                            value={
                                props.editStore.playtime ?? props.vn.playtime
                            }
                        />
                    </LabeledField>
                </div>
                <div class='flex-row'>
                    <LabeledField name='description'>
                        <textarea
                            class='edit-visual-novel-modal__content__description'
                            onChange={(e) =>
                                props.setEditStore(
                                    'description',
                                    e.target.value,
                                )
                            }
                            placeholder='Description...'
                            value={
                                props.editStore.description ??
                                props.vn.description ??
                                ''
                            }
                        />
                    </LabeledField>
                    <LabeledField name='notes'>
                        <textarea
                            class='edit-visual-novel-modal__content__description'
                            onChange={(e) =>
                                props.setEditStore('notes', e.target.value)
                            }
                            placeholder='Notes...'
                            value={
                                props.editStore.notes ?? props.vn.notes ?? ''
                            }
                        />
                    </LabeledField>
                </div>
            </Block>
            <Block title='installation & launch'>
                <div class='flex-row'>
                    <LabeledField name='use locale emulator'>
                        <input
                            checked={
                                props.editStore.useLocaleEmulator ??
                                props.vn.useLocaleEmulator
                            }
                            class='self-start'
                            onChange={(e) =>
                                props.setEditStore(
                                    'useLocaleEmulator',
                                    e.target.checked,
                                )
                            }
                            type='checkbox'
                        />
                    </LabeledField>
                    <LabeledField name='executable path'>
                        <div class='flex-row'>
                            <input
                                class='flex-grow'
                                onChange={(e) =>
                                    props.setEditStore(
                                        'executablePath',
                                        e.target.value,
                                    )
                                }
                                placeholder='path/to/game.exe'
                                type='text'
                                value={
                                    props.editStore.executablePath ??
                                    props.vn.executablePath
                                }
                            />
                            <button onClick={handleBrowseExe} type='button'>
                                Browse
                            </button>
                        </div>
                    </LabeledField>
                </div>
                <LabeledField name='launch options'>
                    <input
                        onChange={(e) =>
                            props.setEditStore('launchOptions', e.target.value)
                        }
                        placeholder='--windowed'
                        type='text'
                        value={
                            props.editStore.launchOptions ??
                            props.vn.launchOptions ??
                            ''
                        }
                    />
                </LabeledField>
            </Block>
            <Block title='tags'>
                <TagsPicker />
            </Block>
        </div>
    );
};

export type EditStore = {
    rawImgSrc?: string | null;
    title?: string | null;
    description?: string | null;
    status?: VisualNovelStatus | null;
    playtime?: number | null;
    isFavorite?: boolean | null;
    notes?: string | null;
    executablePath?: string | null;
    launchOptions?: string | null;
    useLocaleEmulator?: boolean | null;
    tagIds?: string[];
};

export const EditVisualNovelModal = (props: { vn: VisualNovel }) => {
    const { setIsOpen } = useModalContext();

    const [editStore, setEditStore] = createStore<EditStore>({
        tagIds: props.vn.tags.map((tag) => tag.id),
    });

    const handleOnAction = () => {
        setIsOpen(false);
    };

    // TODO: add TagsPicker

    return (
        <div class='flex-column height-100'>
            <Header />
            <div class='edit-visual-novel-modal'>
                <SideBar
                    editStore={editStore}
                    setEditStore={setEditStore}
                    vn={props.vn}
                />
                <div class='divider-vertical' />
                <Content
                    editStore={editStore}
                    setEditStore={setEditStore}
                    vn={props.vn}
                />
            </div>
            <Footer onSave={handleOnAction} />
        </div>
    );
};
