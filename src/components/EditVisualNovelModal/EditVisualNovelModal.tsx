import { open } from '@tauri-apps/plugin-dialog';
import {
    createContext,
    createEffect,
    createSignal,
    type JSX,
    useContext,
} from 'solid-js';
import defaultCover from '@/assets/cover-image-placeholder.svg';
import {
    commands,
    type TagWithVisualNovels,
    type VisualNovel,
    type VisualNovelStatus,
} from '@/bindings';
import {
    Divider,
    IconFolderOpen,
    ModalActionButtons,
    Select,
    TagsPicker,
} from '@/components';
import './EditVisualNovelModal.css';
import { convertFileSrc } from '@tauri-apps/api/core';
import { createStore, type SetStoreFunction } from 'solid-js/store';
import { VisualNovelStatusList } from '@/consts';
import { useGlobalData, useModalContext } from '@/store';
import { handleIpcError, reportIpcError, toTitleCase } from '@/utils';

const Header = () => {
    return (
        <>
            <h2>Edit Visual Novel</h2>
            <Divider class='margin-bottom-lg' />
        </>
    );
};

const SideBar = (props: { vn: VisualNovel }) => {
    const editStore = useVnEditStoreContext();

    const [previewImgSrc, setPreviewImgSrc] = createSignal(
        props.vn.coverPath ? convertFileSrc(props.vn.coverPath) : defaultCover,
    );

    const handleResetImg = () => {
        editStore.set('coverPath', props.vn.coverPath);
        setPreviewImgSrc(
            props.vn.coverPath
                ? convertFileSrc(props.vn.coverPath)
                : defaultCover,
        );
    };

    const handleBrowseImg = async () => {
        const path = await open({
            title: 'Select cover image',
            defaultPath: props.vn.dirPath,
            filters: [
                { name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
            ],
        });

        if (!path) return;

        editStore.set('coverPath', path);
        setPreviewImgSrc(convertFileSrc(path));
    };

    return (
        <div class='edit-visual-novel-modal__sidebar'>
            <img
                aria-label='Visual novel cover'
                onClick={handleBrowseImg}
                onError={() => setPreviewImgSrc(defaultCover)}
                src={previewImgSrc()}
                title={props.vn.coverPath ?? 'No cover'}
            />
            <div class='flex-row'>
                <button
                    class='flex-grow'
                    onClick={handleResetImg}
                    type='button'
                >
                    Reset
                </button>
                <button
                    class='flex-grow button-primary'
                    onClick={handleBrowseImg}
                    type='button'
                >
                    <IconFolderOpen />
                    Browse
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
                <Divider class='margin-bottom-lg' />
            </div>
            <div class='flex-column gap-lg'>{props.children}</div>
        </div>
    );
};

const LabeledField = (props: {
    name: string;
    title?: string;
    icon?: JSX.Element;
    children: JSX.Element;
}) => {
    return (
        <div class='flex-column flex-1'>
            <h4 class='flex-row' title={props.title}>
                {props.icon}
                {toTitleCase(props.name)}:
            </h4>
            {props.children}
        </div>
    );
};

const Content = (props: { vn: VisualNovel }) => {
    const editStore = useVnEditStoreContext();

    const handleBrowseExe = async () => {
        const path = await open({
            title: 'Select game executable',
            defaultPath: props.vn.dirPath,
            filters: [{ name: 'Executable', extensions: ['exe'] }],
        });

        if (!path) return;

        editStore.set('executablePath', path);
    };

    return (
        <div class='edit-visual-novel-modal__content'>
            <Block title='properties'>
                <LabeledField name='title'>
                    <input
                        onChange={(e) => editStore.set('title', e.target.value)}
                        placeholder='Title...'
                        required={true}
                        type='text'
                        value={editStore.get.title ?? props.vn.title}
                    />
                </LabeledField>
                <div class='flex-row'>
                    <LabeledField name='status'>
                        <Select
                            onToggle={(value) =>
                                editStore.set(
                                    'status',
                                    value as VisualNovelStatus,
                                )
                            }
                            options={VisualNovelStatusList.map((x) => ({
                                value: x,
                            }))}
                            selected={editStore.get.status ?? props.vn.status}
                        />
                    </LabeledField>
                    <LabeledField name='playtime'>
                        <input
                            min={0}
                            onChange={(e) =>
                                editStore.set(
                                    'playtime',
                                    e.target.valueAsNumber,
                                )
                            }
                            placeholder='Playtime...'
                            required={true}
                            type='number'
                            value={editStore.get.playtime ?? props.vn.playtime}
                        />
                    </LabeledField>
                </div>
                <div class='flex-row'>
                    <LabeledField name='description'>
                        <textarea
                            class='edit-visual-novel-modal__content__description'
                            onChange={(e) =>
                                editStore.set('description', e.target.value)
                            }
                            placeholder='Description...'
                            value={
                                editStore.get.description ??
                                props.vn.description ??
                                ''
                            }
                        />
                    </LabeledField>
                    <LabeledField name='notes'>
                        <textarea
                            class='edit-visual-novel-modal__content__description'
                            onChange={(e) =>
                                editStore.set('notes', e.target.value)
                            }
                            placeholder='Notes...'
                            value={editStore.get.notes ?? props.vn.notes ?? ''}
                        />
                    </LabeledField>
                </div>
            </Block>
            <Block title='installation & launch'>
                <div class='flex-row'>
                    <LabeledField name='use locale emulator'>
                        <input
                            checked={
                                editStore.get.useLocaleEmulator ??
                                props.vn.useLocaleEmulator
                            }
                            class='self-start'
                            onChange={(e) =>
                                editStore.set(
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
                                    editStore.set(
                                        'executablePath',
                                        e.target.value,
                                    )
                                }
                                placeholder='path/to/game.exe'
                                required={true}
                                type='text'
                                value={
                                    editStore.get.executablePath ??
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
                            editStore.set('launchOptions', e.target.value)
                        }
                        placeholder='--windowed'
                        type='text'
                        value={
                            editStore.get.launchOptions ??
                            props.vn.launchOptions ??
                            ''
                        }
                    />
                </LabeledField>
            </Block>
            <Block title='tags'>
                <TagsPicker
                    onChange={(tags) => editStore.set('tagIds', tags)}
                    tagIds={editStore.get.tagIds}
                />
            </Block>
        </div>
    );
};

export type EditVnStore = {
    coverPath?: string | null;
    title?: string | null;
    description?: string | null;
    status?: VisualNovelStatus | null;
    playtime?: number | null;
    isFavorite?: boolean | null;
    notes?: string | null;
    executablePath?: string | null;
    launchOptions?: string | null;
    useLocaleEmulator?: boolean | null;
    tagIds?: TagWithVisualNovels[];
};

const EditVnStoreContext = createContext<{
    get: EditVnStore;
    set: SetStoreFunction<EditVnStore>;
}>();

const useVnEditStoreContext = () => {
    const context = useContext(EditVnStoreContext);

    if (!context) {
        throw new Error("can't find EditVnStoreContext");
    }

    return context;
};

export const EditVisualNovelModal = (props: { vn: VisualNovel }) => {
    const globalData = useGlobalData();
    const { setIsOpen } = useModalContext();

    const [editStore, setEditStore] = createStore<EditVnStore>();

    createEffect(() => {
        if (
            globalData.resources.tags.get.state === 'ready' &&
            editStore.tagIds === undefined
        ) {
            setEditStore(
                'tagIds',
                globalData.resources.tags
                    .get()
                    .filter((tag) =>
                        props.vn.tags.some((x) => x.id === tag.id),
                    ),
            );
        }
    });

    const handleOnAction = async () => {
        if (
            editStore.title?.trim() === '' ||
            (editStore.playtime ?? 0) > 0 ||
            editStore.executablePath?.trim() === ''
        )
            return;

        setIsOpen(false);

        const res = await commands
            .updateVisualNovel(props.vn.id, {
                coverPath: editStore.coverPath,
                title: editStore.title,
                description: editStore.description,
                status: editStore.status,
                playtime: editStore.playtime,
                isFavorite: editStore.isFavorite,
                notes: editStore.notes,
                executablePath: editStore.executablePath,
                launchOptions: editStore.launchOptions,
                useLocaleEmulator: editStore.useLocaleEmulator,
                tagIds: editStore.tagIds?.map((tag) => tag.id),
            })
            .catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            setIsOpen(true);
            return;
        }

        globalData.resources.vns.mutate((prev) => {
            if (!prev) return;

            return prev.map((vn) => {
                if (vn.id === props.vn.id) return res.data;
                return vn;
            });
        });
    };

    return (
        <EditVnStoreContext.Provider
            value={{ get: editStore, set: setEditStore }}
        >
            <div class='flex-column height-100'>
                <Header />
                <div class='edit-visual-novel-modal'>
                    <SideBar vn={props.vn} />
                    <Divider vertical />
                    <Content vn={props.vn} />
                </div>
                <ModalActionButtons onAction={handleOnAction} />
            </div>
        </EditVnStoreContext.Provider>
    );
};
