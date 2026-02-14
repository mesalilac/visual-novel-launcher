import { createSignal } from 'solid-js';
import { commands } from '@/bindings';
import {
    IconAddPlus,
    IconArrowReload02,
    IconSettings,
    Modal,
    SettingsModal,
} from '@/components';
import { useGlobalData } from '@/store';

import './Nav.css';

export const Nav = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    const [showSettingsModal, setShowSettingsModal] = createSignal(false);

    const refresh = async () => {
        try {
            const res = await commands.utilScanLibrary();

            if (res.status === 'ok') {
                vns.refetch();
            } else if (res.status === 'error') {
                console.error(res.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <nav class='flex-row justify-between'>
            <h2>Visual Novel library ({vns.get()?.length})</h2>
            <div class='flex-row gap-lg'>
                <IconArrowReload02
                    class='icon-clickable refresh-icon'
                    onClick={refresh}
                />
                <button class='button-primary' type='button'>
                    <IconAddPlus />
                    Add a Game
                </button>
                <IconSettings
                    class='icon-clickable settings-icon'
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
