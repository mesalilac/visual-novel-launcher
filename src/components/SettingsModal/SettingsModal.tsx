import './SettingsModal.css';

import { ModalDismissButton } from '@components';
// import { useGlobalData } from '@store';

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
