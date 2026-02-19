import './VisualNovelCard.css';
import { convertFileSrc } from '@tauri-apps/api/core';
import { ask } from '@tauri-apps/plugin-dialog';
import {
    createEffect,
    createSignal,
    For,
    Match,
    onCleanup,
    Switch,
} from 'solid-js';
import defaultCover from '@/assets/cover-image-placeholder.svg';
import { commands, type VisualNovel } from '@/bindings';
import {
    EditVisualNovelModal,
    IconCalendar,
    IconClock,
    IconEditPencilLine01,
    IconFolderOpen,
    IconMoreVertical,
    IconPause,
    IconPlay,
    IconTrashFull,
    IconTriangleWarning,
    Modal,
    Popover,
} from '@/components';
import { useGlobalData } from '@/store';
import { handleIpcError, reportIpcError } from '@/utils';

export const VisualNovelCard = (props: { vn: VisualNovel }) => {
    const globalData = useGlobalData();

    const [showEditModal, setShowEditModal] = createSignal(false);

    const [imgSrc, setImgSrc] = createSignal<string>(
        props.vn.coverPath !== null
            ? convertFileSrc(props.vn.coverPath)
            : defaultCover,
    );
    const [runningSince, setRunningSince] = createSignal<string>('00:00:00');

    const handleImgError = () => {
        setImgSrc(defaultCover);
    };

    createEffect(() => {
        if (
            globalData.store.gameState &&
            globalData.store.gameState.vnId === props.vn.id
        ) {
            const timer = setInterval(() => {
                let secondsSinceStart =
                    (Date.now() -
                        (globalData.store.gameState?.startedAt || 0)) /
                    1000;

                let hours = String(Math.floor(secondsSinceStart / 3600));
                secondsSinceStart %= 3600;

                let minutes = String(Math.floor(secondsSinceStart / 60));
                let seconds = String(Math.floor(secondsSinceStart % 60));

                if (hours.length < 2) hours = hours.padStart(2, '0');
                if (minutes.length < 2) minutes = minutes.padStart(2, '0');
                if (seconds.length < 2) seconds = seconds.padStart(2, '0');

                setRunningSince(`${hours}:${minutes}:${seconds}`);
            }, 1000);

            onCleanup(() => {
                clearInterval(timer);
            });
        }
    });

    createEffect(() => {
        if (globalData.store.gameState == null) {
            setRunningSince('00:00:00');
        }
    });

    const launchGame = async () => {
        const res = await commands
            .utilLaunchVisualNovel(props.vn.id)
            .catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }

        globalData.setStore('gameState', {
            vnId: props.vn.id,
            processId: res.data,
            startedAt: Date.now(),
        });
    };

    const closeGame = async () => {
        const confirmation = await ask(
            'Are you sure you want to close the running game?',
            {
                title: 'Close running game',
                kind: 'warning',
            },
        );

        if (!confirmation || !globalData.store.gameState) return;

        const res = await commands
            .utilCloseVisualNovel(globalData.store.gameState.processId)
            .catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }
    };

    const handleStatusClick = () => {
        if (globalData.store.vnsFilter.status === props.vn.status) {
            globalData.setStore('vnsFilter', 'status', 'All');
            return;
        }

        globalData.setStore('vnsFilter', 'status', props.vn.status);
    };

    const handleTagClick = (id: string) => {
        if (globalData.store.vnsFilter.tagIds.includes(id)) {
            globalData.setStore('vnsFilter', 'tagIds', [
                ...globalData.store.vnsFilter.tagIds.filter(
                    (tagId) => tagId !== id,
                ),
            ]);
        } else {
            globalData.setStore('vnsFilter', 'tagIds', [
                ...globalData.store.vnsFilter.tagIds,
                id,
            ]);
        }
    };

    const handleOpenFolder = async () => {
        setShowPopoverMenu(false);

        const res = await commands
            .utilOpenPath(props.vn.dirPath)
            .catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }
    };

    const handleDeleteVn = async () => {
        setShowPopoverMenu(false);

        const confirmation = await ask(
            'Are you sure you want to delete this Visual Novel?',
            {
                title: 'Delete Visual Novel',
                kind: 'warning',
            },
        );

        if (!confirmation) return;

        const res = await commands
            .removeVisualNovelById(props.vn.id)
            .catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            return;
        }

        globalData.resources.vns.mutate((prev) => {
            if (!prev) return;

            return prev.filter((vn) => vn.id !== props.vn.id);
        });
    };

    const handleEditVn = () => {
        setShowPopoverMenu(false);

        setShowEditModal(true);
    };

    const [showPopoverMenu, setShowPopoverMenu] = createSignal(false);

    let popoverMenuRef: HTMLButtonElement | undefined;

    return (
        <div
            class='visual-novel-card'
            classList={{
                running: props.vn.id === globalData.store.gameState?.vnId,
            }}
        >
            <button
                class='visual-novel-card__status'
                classList={{
                    [props.vn.status.toLowerCase()]: true,
                }}
                onClick={handleStatusClick}
                type='button'
            >
                {props.vn.status}
            </button>
            <button
                class='flex-row visual-novel-card__menu_trigger'
                ref={popoverMenuRef}
                type='button'
            >
                <IconMoreVertical size='1.5em' />
            </button>
            <Popover
                onOpenChange={setShowPopoverMenu}
                open={showPopoverMenu()}
                targetPositionArea='bottom center'
                triggerElement={popoverMenuRef}
            >
                <div class='flex-column visual-novel-card__menu'>
                    <button onClick={handleOpenFolder} type='button'>
                        <IconFolderOpen /> Open Folder
                    </button>
                    <button onClick={handleEditVn} type='button'>
                        <IconEditPencilLine01 /> Edit
                    </button>
                    <button onClick={handleDeleteVn} type='button'>
                        <IconTrashFull /> Remove from Library
                    </button>
                </div>
            </Popover>
            <Modal isOpen={showEditModal} setIsOpen={setShowEditModal}>
                <EditVisualNovelModal vn={props.vn} />
            </Modal>
            <img
                aria-label='Visual Novel Cover'
                class='visual-novel-card__cover'
                onError={handleImgError}
                src={imgSrc()}
                style={{
                    filter: props.vn.isMissing ? 'grayscale(100%)' : '',
                }}
            />
            <div class='flex-column visual-novel-card__info'>
                <h3 class='visual-novel-card__title' title={props.vn.title}>
                    {props.vn.title}
                </h3>
                <p
                    class='visual-novel-card__description'
                    title={props.vn.description || ''}
                >
                    {props.vn.description}
                </p>

                <div class='flex-row overflow-auto visual-novel-card__tags'>
                    <For each={props.vn.tags}>
                        {(tag) => (
                            <button
                                class='visual-novel-card__tag'
                                onClick={() => handleTagClick(tag.id)}
                                style={{
                                    outline:
                                        globalData.store.vnsFilter.tagIds.includes(
                                            tag.id,
                                        )
                                            ? 'var(--s-size-border-md) solid var(--s-color-background-info)'
                                            : '',
                                }}
                                title={tag.name}
                                type='button'
                            >
                                {tag.name}
                            </button>
                        )}
                    </For>
                </div>
                <div class='divider' />
                <div class='flex-row'>
                    <div class='flex-row visual-novel-card__icon'>
                        <IconClock />
                        <span title={String(props.vn.playtime)}>
                            {(props.vn.playtime / 3600).toFixed(1)}h
                        </span>
                    </div>
                    <div class='flex-row visual-novel-card__icon'>
                        <IconCalendar />
                        <span
                            title={new Date(
                                props.vn.lastTimePlayedAt || 0,
                            ).toString()}
                        >
                            {props.vn.lastTimePlayedAt
                                ? new Date(
                                      props.vn.lastTimePlayedAt,
                                  ).toDateString()
                                : '-'}
                        </span>
                    </div>
                </div>
                <Switch>
                    <Match
                        when={
                            !props.vn.isMissing &&
                            props.vn.id !== globalData.store.gameState?.vnId
                        }
                    >
                        <button
                            class='visual-novel-card__button playable'
                            disabled={globalData.store.gameState !== null}
                            onClick={launchGame}
                            type='button'
                        >
                            <IconPlay /> Play
                        </button>
                    </Match>
                    <Match
                        when={
                            !props.vn.isMissing &&
                            props.vn.id === globalData.store.gameState?.vnId
                        }
                    >
                        <button
                            class='visual-novel-card__button running'
                            onClick={closeGame}
                            type='button'
                        >
                            <IconPause />
                            {runningSince()}
                        </button>
                    </Match>
                    <Match when={props.vn.isMissing}>
                        <button
                            class='visual-novel-card__button missing-on-disk'
                            disabled={props.vn.isMissing}
                            type='button'
                        >
                            <IconTriangleWarning />
                            Missing on disk
                        </button>
                    </Match>
                </Switch>
            </div>
        </div>
    );
};
