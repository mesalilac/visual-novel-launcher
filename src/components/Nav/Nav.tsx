import { gsap } from 'gsap';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { commands } from '@/bindings';
import {
    CreateVisualNovelModal,
    IconAddPlus,
    IconArrowReload02,
    IconSettings,
    Modal,
    SettingsModal,
} from '@/components';
import { useGlobalData } from '@/store';
import { handleIpcError, reportIpcError } from '@/utils';
import './Nav.css';

export const Nav = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;
    const vnsTotalCounter = {
        val: 0,
    };

    const [vnsCount, setVnsCount] = createSignal(0);
    const [showSettingsModal, setShowSettingsModal] = createSignal(false);
    const [showCreateNewVnModal, setShowCreateNewVnModal] = createSignal(false);

    const refresh = async () => {
        const res = await commands.utilScanLibrary().catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }

        vns.refetch();
    };

    createEffect(() => {
        const total = globalData.store.vnsFilter.totalCount;

        const tween = gsap.to(vnsTotalCounter, {
            val: total,
            duration: 0.3,
            onUpdate: () => {
                setVnsCount(Math.floor(vnsTotalCounter.val));
            },
        });

        onCleanup(() => tween.kill());
    });

    return (
        <nav class='flex-row justify-between'>
            <h2>Visual Novel library ({vnsCount()})</h2>
            <div class='flex-row align-stretch gap-lg'>
                <button class='refresh-button' onClick={refresh} type='button'>
                    <IconArrowReload02 class='refresh-button__icon' />
                </button>
                <button
                    class='button-primary'
                    onClick={() => setShowCreateNewVnModal(true)}
                    type='button'
                >
                    <IconAddPlus />
                    Add a Game
                </button>
                <Show when={showCreateNewVnModal()}>
                    <Modal
                        isOpen={showCreateNewVnModal}
                        setIsOpen={setShowCreateNewVnModal}
                    >
                        <CreateVisualNovelModal />
                    </Modal>
                </Show>
                <button
                    class='settings-button'
                    onClick={() => setShowSettingsModal(true)}
                    type='button'
                >
                    <IconSettings class='settings-button__icon' />
                </button>
                <Show when={showSettingsModal()}>
                    <Modal
                        isOpen={showSettingsModal}
                        setIsOpen={setShowSettingsModal}
                    >
                        <SettingsModal />
                    </Modal>
                </Show>
            </div>
        </nav>
    );
};
