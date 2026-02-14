import { type Accessor, createEffect, Show } from 'solid-js';
import { useGlobalData } from '@/store';
import { toTitleCase } from '@/utils';

import './GeneralStats.css';
import type {
    GeneralStats as GeneralStatsType,
    VisualNovelStatus,
} from '@/bindings';
import { IconChartBarVertical01 } from '../icons';

const StatsBlock = (props: {
    title: string;
    value: string | number | null;
    description: string;
}) => {
    return (
        <div class='flex-column gap-none surface-3 padding-sm radius-lg border-xs flex-grow'>
            <h4 class='text-truncate margin-bottom-md'>
                {props.title.toUpperCase()}
            </h4>
            <span class='text-truncate'>{props.value}</span>
            <span class='text-truncate stats-description'>
                {toTitleCase(props.description)}
            </span>
        </div>
    );
};

const StatusOverviewItem = (props: {
    status: VisualNovelStatus | 'Unplayed';
    count: number;
}) => {
    const modifierClassName = props.status.toLowerCase();

    return (
        <div class='flex-row justify-between'>
            <div class='flex-row gap-md'>
                <div
                    class='status-bg circle'
                    classList={{
                        [modifierClassName]: true,
                    }}
                />
                <span>{props.status}</span>
            </div>
            <span
                class='status-fg'
                classList={{
                    [modifierClassName]: true,
                }}
            >
                {props.count}
            </span>
        </div>
    );
};

const StatusChartBar = (props: {
    class: string;
    count: number;
    totalVns: number;
}) => {
    const width = (props.count / props.totalVns) * 100;

    return (
        <Show when={props.count > 0}>
            <div
                class='status-bg playing'
                classList={{
                    [props.class]: true,
                }}
                style={{
                    width: `${width}%`,
                }}
            />
        </Show>
    );
};

const StatusChart = (props: { stats: GeneralStatsType }) => {
    return (
        <div class='flex-row gap-none nowrap status-chart'>
            <StatusChartBar
                class='playing'
                count={props.stats.playingCount}
                totalVns={props.stats.visualNovelCount}
            />
            <StatusChartBar
                class='finished'
                count={props.stats.finishedCount}
                totalVns={props.stats.visualNovelCount}
            />
            <StatusChartBar
                class='dropped'
                count={props.stats.droppedCount}
                totalVns={props.stats.visualNovelCount}
            />
            <StatusChartBar
                class='backlog'
                count={props.stats.backlogCount}
                totalVns={props.stats.visualNovelCount}
            />
            <StatusChartBar
                class='unplayed'
                count={props.stats.unplayedCount}
                totalVns={props.stats.visualNovelCount}
            />
        </div>
    );
};

export const GeneralStats = () => {
    const globalData = useGlobalData();
    const generalStats = globalData.resources.generalStats;

    return (
        <div class='flex-column surface-2 padding-sm radius-lg'>
            <Show
                when={generalStats.get.state === 'ready' && generalStats.get()}
            >
                {(generalStats) => {
                    const stats = generalStats();

                    return (
                        <>
                            <div class='flex-row'>
                                <StatsBlock
                                    description='total games'
                                    title='library'
                                    value={stats.visualNovelCount}
                                />
                                <StatsBlock
                                    description='total hours'
                                    title='playtime'
                                    value={
                                        stats.totalPlaytime <= 0
                                            ? '-'
                                            : `${Math.floor(
                                                  stats.totalPlaytime / 3600,
                                              )}h`
                                    }
                                />
                                <StatsBlock
                                    description='unique tags'
                                    title='tags'
                                    value={stats.tagCount}
                                />
                                <StatsBlock
                                    description='recent activity'
                                    title='last played'
                                    value={stats.lastPlayedAt}
                                />
                            </div>
                            <div class='flex-column surface-3 padding-sm radius-lg border-xs'>
                                <span class='text-truncate flex-row'>
                                    <IconChartBarVertical01 /> Status Overview
                                </span>
                                <div class='divider' />
                                <StatusChart stats={stats} />
                                <StatusOverviewItem
                                    count={stats.playingCount}
                                    status='Playing'
                                />
                                <StatusOverviewItem
                                    count={stats.finishedCount}
                                    status='Finished'
                                />
                                <StatusOverviewItem
                                    count={stats.droppedCount}
                                    status='Dropped'
                                />
                                <StatusOverviewItem
                                    count={stats.backlogCount}
                                    status='Backlog'
                                />
                                <StatusOverviewItem
                                    count={stats.unplayedCount}
                                    status='Unplayed'
                                />
                            </div>
                        </>
                    );
                }}
            </Show>
        </div>
    );
};
