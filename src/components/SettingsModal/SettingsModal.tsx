import './SettingsModal.css';

import { ModalDismissButton } from '@components';
import { useGlobalData } from '@store';
import { Show } from 'solid-js';

export const SettingsModal = () => {
    const globalData = useGlobalData();

    const settings = globalData.resources.settings;

    const handleOnAction = () => {};

    return (
        <div class='flex-column height-100'>
            <h2>Settings</h2>
            <div class='divider margin-bottom-lg' />
            <div class='flex-column'>
                <Show when={settings.get.state === 'ready' && settings.get()}>
                    {(settings) => {
                        return (
                            <div class='flex-column gap-md'>
                                <div class='flex-row justify-between'>
                                    <span>Library Path</span>
                                    <input
                                        type='text'
                                        value={settings().libraryPath || ''}
                                    />
                                </div>
                                <div class='flex-row'>
                                    <span>use Locale Emulator</span>
                                    <input
                                        checked={settings().useLocaleEmulator}
                                        type='checkbox'
                                    />
                                </div>
                                <div class='flex-row justify-between'>
                                    <span>locale Emulator Executable Path</span>
                                    <input
                                        type='text'
                                        value={
                                            settings()
                                                .localeEmulatorExecutablePath ||
                                            ''
                                        }
                                    />
                                </div>
                                <div class='flex-row justify-between'>
                                    <span>locale Emulator Launch Options</span>
                                    <input
                                        type='text'
                                        value={
                                            settings()
                                                .localeEmulatorLaunchOptions ||
                                            ''
                                        }
                                    />
                                </div>
                            </div>
                        );
                    }}
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
