import { ModalDismissButton } from '@components';
import './SettingsModal.css';

// import { useGlobalData } from '@store';
import { type Accessor, createSignal, type Setter, Show } from 'solid-js';

export const SettingsModal = () => {
    // const globalData = useGlobalData();

    const handleOnAction = () => {};

    return (
        <div class='flex-column'>
            Settings
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
