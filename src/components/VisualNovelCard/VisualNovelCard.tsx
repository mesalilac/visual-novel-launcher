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
    IconCalendar,
    IconClock,
    IconPause,
    IconPlay,
    IconTriangleWarning,
} from '@/components';
import { useGlobalData } from '@/store';

export const VisualNovelCard = (props: { vn: VisualNovel }) => {
    const globalData = useGlobalData();

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
            globalData.store.gameState.id === props.vn.id
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

    const playGame = async () => {
        try {
            const res = await commands.utilLaunchVisualNovel(props.vn.id);

            if (res.status === 'ok') {
                globalData.setStore('gameState', {
                    id: props.vn.id,
                    startedAt: Date.now(),
                });
            } else if (res.status === 'error') {
                console.error(res.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const closeGame = async () => {
        const confirmation = await ask(
            'Are you sure you want to close the running game?',
            {
                title: 'Close running game',
                kind: 'warning',
            },
        );

        if (!confirmation) return;

        try {
            const res = await commands.utilCloseVisualNovel(props.vn.id);

            if (res.status === 'ok') {
                globalData.setStore('gameState', null);
                setRunningSince('00:00:00');
            } else if (res.status === 'error') {
                console.error(res.error);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div
            class='visual-novel-card'
            classList={{
                running: props.vn.id === globalData.store.gameState?.id,
            }}
        >
            <span
                class='visual-novel-card__status'
                classList={{
                    [props.vn.status.toLowerCase()]: true,
                }}
            >
                {props.vn.status}
            </span>
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
                <h3 class='visual-novel-card__title'>{props.vn.title}</h3>
                <p class='visual-novel-card__description'>
                    {props.vn.description}
                </p>

                <div class='flex-row overflow-auto visual-novel-card__tags'>
                    <For each={props.vn.tags}>
                        {(tag) => (
                            <span
                                class='visual-novel-card__tag'
                                title={tag.name}
                            >
                                {tag.name}
                            </span>
                        )}
                    </For>
                </div>
                <div class='divider' />
                <div class='flex-row'>
                    <div class='flex-row visual-novel-card__icon'>
                        <IconClock />
                        <span>{(props.vn.playtime / 3600).toFixed(1)}h</span>
                    </div>
                    <div class='flex-row visual-novel-card__icon'>
                        <IconCalendar />
                        <span>
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
                            props.vn.id !== globalData.store.gameState?.id
                        }
                    >
                        <button
                            class='visual-novel-card__button playable'
                            disabled={globalData.store.gameState !== null}
                            onClick={playGame}
                            type='button'
                        >
                            <IconPlay /> Play
                        </button>
                    </Match>
                    <Match
                        when={
                            !props.vn.isMissing &&
                            props.vn.id === globalData.store.gameState?.id
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
