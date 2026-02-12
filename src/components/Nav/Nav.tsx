import './Nav.css';

import { IconAddPlus, IconSettings, Modal, SettingsModal } from '@components';
import { useGlobalData } from '@store';
import { createSignal } from 'solid-js';

export const Nav = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    const [showSettingsModal, setShowSettingsModal] = createSignal(false);

    return (
        <nav class='flex-row justify-between'>
            <h2>Visual Novel library ({vns.get()?.length})</h2>
            <div class='flex-row gap-lg'>
                <button class='button-primary' type='button'>
                    <IconAddPlus />
                    Add a Game
                </button>
                <IconSettings
                    class='cursor-pointer settings-icon'
                    onClick={() => setShowSettingsModal(true)}
                />
                <Modal
                    isOpen={showSettingsModal}
                    setIsOpen={setShowSettingsModal}
                >
                    <SettingsModal />
                </Modal>
            </div>
        </nav>
    );
};
