import { commands } from '@bindings';
import './SettingsModal.css';

import { ModalDismissButton, useModalContext } from '@components';
import { useGlobalData } from '@store';
import { ask, open } from '@tauri-apps/plugin-dialog';
import { createEffect, createSignal, Show } from 'solid-js';

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
        try {
            const confirmation = await ask(
                'Are you sure you want to remove all Visual Novels?',
                {
                    title: 'Remove all Visual Novels',
                    kind: 'warning',
                },
            );

            if (!confirmation) return;

            const res = await commands.removeAllVisualNovels();

            if (res.status === 'ok') {
                globalData.resources.vns.refetch();
            } else if (res.status === 'error') {
                console.error(res.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const removeAllTags = async () => {
        try {
            const confirmation = await ask(
                'Are you sure you want to remove all Tags?',
                {
                    title: 'Remove all Tags',
                    kind: 'warning',
                },
            );

            if (!confirmation) return;

            const res = await commands.removeAllTags();

            if (res.status === 'ok') {
                globalData.resources.vns.refetch();
            } else if (res.status === 'error') {
                console.error(res.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div class='flex-column height-100'>
            <h2>Settings</h2>
            <div class='divider margin-bottom-lg' />
            <div class='flex-column'>
                <Show when={settings.get.state === 'ready'}>
                    <div class='flex-column gap-lg'>
                        <div class='flex-column'>
                            <span>Library Path</span>
                            <div class='flex-row'>
                                <input
                                    class='flex-grow'
                                    onChange={(e) =>
                                        setLibraryPath(e.target.value.trim())
                                    }
                                    title={libraryPath() ?? ''}
                                    type='text'
                                    value={libraryPath() ?? ''}
                                />
                                <button onClick={pickLibraryPath} type='button'>
                                    Browse
                                </button>
                            </div>
                        </div>
                        <div class='flex-row'>
                            <span>use Locale Emulator</span>
                            <input
                                checked={useLocaleEmulator() ?? true}
                                onChange={(e) =>
                                    setUseLocaleEmulator(e.target.checked)
                                }
                                type='checkbox'
                            />
                        </div>
                        <div class='flex-column'>
                            <span>locale Emulator Executable Path</span>
                            <div class='flex-row'>
                                <input
                                    class='flex-grow'
                                    onChange={(e) =>
                                        setLocaleEmulatorExecutablePath(
                                            e.target.value.trim(),
                                        )
                                    }
                                    title={localeEmulatorExecutablePath() ?? ''}
                                    type='text'
                                    value={localeEmulatorExecutablePath() ?? ''}
                                />
                                <button
                                    onClick={pickLocaleEmulatorExecutablePath}
                                    type='button'
                                >
                                    Browse
                                </button>
                            </div>
                        </div>
                        <div class='flex-column'>
                            <span>locale Emulator Launch Options</span>
                            <input
                                onChange={(e) =>
                                    setLocaleEmulatorLaunchOptions(
                                        e.target.value.trim(),
                                    )
                                }
                                title={localeEmulatorLaunchOptions() ?? ''}
                                type='text'
                                value={localeEmulatorLaunchOptions() ?? ''}
                            />
                        </div>
                        <div class='flex-column'>
                            <span>Remove All Visual Novels</span>
                            <button
                                class='button-danger self-start'
                                onClick={removeAllVisualNovels}
                                type='button'
                            >
                                Remove
                            </button>
                        </div>
                        <div class='flex-column'>
                            <span>Remove All Tags</span>
                            <button
                                class='button-danger self-start'
                                onClick={removeAllTags}
                                type='button'
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                </Show>
            </div>
            <div class='divider margin-top-auto' />
            <div class='flex-row self-end'>
                <ModalDismissButton />
                <button
                    class={'button-primary'}
                    onClick={handleOnAction}
                    type='button'
                >
                    Save
                </button>
            </div>
        </div>
    );
};
