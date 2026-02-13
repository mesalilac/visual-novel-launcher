import { commands } from '@bindings';
import './SettingsModal.css';

import { ModalDismissButton, useModalContext } from '@components';
import { useGlobalData } from '@store';
import { open } from '@tauri-apps/plugin-dialog';
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
                    settings.mutate(res.data);
                } else if (res.status === 'error') {
                    console.error(res.error);
                }
            })
            .catch((e) => {
                console.error(e);
            });

        setIsOpen(false);
    };

    return (
        <div class='flex-column height-100'>
            <h2>Settings</h2>
            <div class='divider margin-bottom-lg' />
            <div class='flex-column'>
                <Show when={settings.get.state === 'ready'}>
                    <div class='flex-column gap-md'>
                        <div class='flex-row justify-between'>
                            <span>Library Path</span>
                            <div class='flex-row'>
                                <input
                                    onChange={(e) =>
                                        setLibraryPath(e.target.value.trim())
                                    }
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
                        <div class='flex-row justify-between'>
                            <span>locale Emulator Executable Path</span>
                            <div class='flex-row'>
                                <input
                                    onChange={(e) =>
                                        setLocaleEmulatorExecutablePath(
                                            e.target.value.trim(),
                                        )
                                    }
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
                        <div class='flex-row justify-between'>
                            <span>locale Emulator Launch Options</span>
                            <input
                                onChange={(e) =>
                                    setLocaleEmulatorLaunchOptions(
                                        e.target.value.trim(),
                                    )
                                }
                                type='text'
                                value={localeEmulatorLaunchOptions() ?? ''}
                            />
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
