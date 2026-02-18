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
import { handleIpcError, reportIpcError } from '@/utils';

export const Nav = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    const [showSettingsModal, setShowSettingsModal] = createSignal(false);

    const refresh = async () => {
        const res = await commands.utilScanLibrary().catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }

        vns.refetch();
    };

    return (
        <nav class='flex-row justify-between'>
            <h2>
                Visual Novel library ({globalData.store.vnsFilter.totalCount})
            </h2>
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
