import { ask, open } from '@tauri-apps/plugin-dialog';
import { createEffect, createSignal, Show } from 'solid-js';
import { commands } from '@/bindings';
import {
    Block,
    Divider,
    GeneralStats,
    LabeledField,
    ModalActionButtons,
    TagsList,
    useModalContext,
} from '@/components';
import { useGlobalData } from '@/store';

import './SettingsModal.css';
import { handleIpcError, reportIpcError } from '@/utils';

export const SettingsModal = () => {
    const { setIsOpen } = useModalContext();

    const globalData = useGlobalData();
    const settings = globalData.resources.settings;

    const [libraryPath, setLibraryPath] = createSignal<string | null>(
        settings.get()?.libraryPath || null,
    );
    const [useLocaleEmulator, setUseLocaleEmulator] = createSignal<
        boolean | null
    >(settings.get()?.useLocaleEmulator || null);
    const [localeEmulatorExecutablePath, setLocaleEmulatorExecutablePath] =
        createSignal<string | null>(
            settings.get()?.localeEmulatorExecutablePath || null,
        );
    const [localeEmulatorLaunchOptions, setLocaleEmulatorLaunchOptions] =
        createSignal<string | null>(
            settings.get()?.localeEmulatorLaunchOptions || null,
        );

    createEffect(() => {
        if (settings.get.state === 'ready' && settings.get()) {
            setLibraryPath(settings.get().libraryPath);
            setUseLocaleEmulator(settings.get().useLocaleEmulator);
            setLocaleEmulatorExecutablePath(
                settings.get().localeEmulatorExecutablePath,
            );
            setLocaleEmulatorLaunchOptions(
                settings.get().localeEmulatorLaunchOptions,
            );
        }
    });

    const pickLibraryPath = async () => {
        const path = await open({
            directory: true,
        });
        if (path) {
            setLibraryPath(path);
        }
    };

    const pickLocaleEmulatorExecutablePath = async () => {
        const path = await open({
            title: 'Select locale emulator executable',
            filters: [{ name: 'Executable', extensions: ['exe'] }],
        });
        if (path) {
            setLocaleEmulatorExecutablePath(path);
        }
    };

    const handleOnAction = () => {
        commands
            .updateSettings({
                libraryPath: libraryPath(),
                useLocaleEmulator: useLocaleEmulator(),
                localeEmulatorExecutablePath: localeEmulatorExecutablePath(),
                localeEmulatorLaunchOptions: localeEmulatorLaunchOptions(),
            })
            .then((res) => {
                if (res.status === 'ok') {
                    if (settings.get()?.libraryPath !== res.data.libraryPath) {
                        commands
                            .utilScanLibrary()
                            .then((scanRes) => {
                                if (scanRes.status === 'ok') {
                                    globalData.resources.vns.refetch();
                                } else if (scanRes.status === 'error') {
                                    console.error(scanRes.error);
                                }
                            })
                            .catch((e) => console.error(e));
                    }

                    settings.refetch();
                } else if (res.status === 'error') {
                    console.error(res.error);
                }
            })
            .catch((e) => {
                console.error(e);
            });

        setIsOpen(false);
    };

    const removeAllVisualNovels = async () => {
        const confirmation = await ask(
            'Are you sure you want to remove all Visual Novels?',
            {
                title: 'Remove all Visual Novels',
                kind: 'warning',
            },
        );

        if (!confirmation) return;

        const res = await commands
            .removeAllVisualNovels()
            .catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }

        globalData.resources.vns.refetch();
    };

    const removeAllTags = async () => {
        const confirmation = await ask(
            'Are you sure you want to remove all Tags?',
            {
                title: 'Remove all Tags',
                kind: 'warning',
            },
        );

        if (!confirmation) return;

        const res = await commands.removeAllTags().catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }

        globalData.resources.vns.refetch();
    };

    return (
        <div class='flex-column height-100'>
            <h2>Settings</h2>
            <Divider class='margin-bottom-lg' />
            <div class='flex-column overflow-auto padding-md'>
                <Show when={settings.get.state === 'ready'}>
                    <div class='flex-column gap-lg margin-bottom-lg'>
                        <Block title='library path'>
                            <LabeledField title='path'>
                                <div class='flex-row align-stretch'>
                                    <input
                                        class='flex-grow'
                                        onChange={(e) =>
                                            setLibraryPath(
                                                e.target.value.trim(),
                                            )
                                        }
                                        title={libraryPath() ?? ''}
                                        type='text'
                                        value={libraryPath() ?? ''}
                                    />
                                    <button
                                        onClick={pickLibraryPath}
                                        type='button'
                                    >
                                        Browse
                                    </button>
                                </div>
                            </LabeledField>
                        </Block>
                        <Block title='locale emulator'>
                            <div class='flex-row gap-xl'>
                                <div>
                                    <LabeledField inline title='enable'>
                                        <input
                                            checked={
                                                useLocaleEmulator() ?? true
                                            }
                                            onChange={(e) =>
                                                setUseLocaleEmulator(
                                                    e.target.checked,
                                                )
                                            }
                                            type='checkbox'
                                        />
                                    </LabeledField>
                                </div>
                                <LabeledField title='executable path'>
                                    <div class='flex-row align-stretch'>
                                        <input
                                            class='flex-grow'
                                            onChange={(e) =>
                                                setLocaleEmulatorExecutablePath(
                                                    e.target.value.trim(),
                                                )
                                            }
                                            placeholder='path/to/locale-emulator.exe'
                                            title={
                                                localeEmulatorExecutablePath() ??
                                                ''
                                            }
                                            type='text'
                                            value={
                                                localeEmulatorExecutablePath() ??
                                                ''
                                            }
                                        />
                                        <button
                                            onClick={
                                                pickLocaleEmulatorExecutablePath
                                            }
                                            type='button'
                                        >
                                            Browse
                                        </button>
                                    </div>
                                </LabeledField>
                                <LabeledField title='executable launch options'>
                                    <input
                                        onChange={(e) =>
                                            setLocaleEmulatorLaunchOptions(
                                                e.target.value.trim(),
                                            )
                                        }
                                        placeholder='--windowed'
                                        title={
                                            localeEmulatorLaunchOptions() ?? ''
                                        }
                                        type='text'
                                        value={
                                            localeEmulatorLaunchOptions() ?? ''
                                        }
                                    />
                                </LabeledField>
                            </div>
                        </Block>
                        <Block title='clear storage'>
                            <div class='flex-row'>
                                <LabeledField
                                    inline
                                    title='remove all visual novels'
                                >
                                    <button
                                        class='button-danger self-start'
                                        onClick={removeAllVisualNovels}
                                        type='button'
                                    >
                                        Remove
                                    </button>
                                </LabeledField>
                                <LabeledField inline title='remove all tags'>
                                    <button
                                        class='button-danger self-start'
                                        onClick={removeAllTags}
                                        type='button'
                                    >
                                        Remove
                                    </button>
                                </LabeledField>
                            </div>
                        </Block>
                        <Block title='general stats'>
                            <GeneralStats />
                        </Block>
                        <Block title='manage tags'>
                            <TagsList onChange={() => {}} type='manage' />
                        </Block>
                    </div>
                </Show>
            </div>
            <ModalActionButtons onAction={handleOnAction} />
        </div>
    );
};
