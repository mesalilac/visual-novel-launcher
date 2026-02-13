import { useGlobalData } from '@store';
import { For, Match, Switch } from 'solid-js';

import './MainContent.css';

export const MainContent = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    return (
        <main>
            <Switch fallback={<span>Failed to display visual novels</span>}>
                <Match when={vns.get.state === 'pending'}>
                    <span>loading...</span>
                </Match>
                <Match when={vns.get.state === 'refreshing'}>
                    <span>Refreshing...</span>
                </Match>
                <Match when={vns.get.state === 'errored'}>
                    <span>{vns.get.error}</span>
                </Match>
                <Match when={vns.get.state === 'ready' && vns.get()}>
                    {(vns) => (
                        <Switch>
                            <Match when={vns().length === 0}>
                                <span>
                                    No Visual Novels found. Try adding a library
                                    in settings!
                                </span>
                            </Match>
                            <Match when={vns().length > 0}>
                                <div class='cards-container'>
                                    <For each={vns()}>
                                        {(vn) => <div>{vn.title}</div>}
                                    </For>
                                </div>
                            </Match>
                        </Switch>
                    )}
                </Match>
            </Switch>
        </main>
    );
};
