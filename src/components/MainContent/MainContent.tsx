import { For, Match, Switch } from 'solid-js';
import { useGlobalData } from '../../store';
import './MainContent.css';

export const MainContent = () => {
    const globalData = useGlobalData();
    const vns = globalData.resources.vns;

    return (
        <main>
            <Switch>
                <Match when={vns.get.loading}>loading...</Match>
                <Match when={vns.get.state === 'errored'}>
                    {vns.get.error}
                </Match>
                <Match when={vns.get.state === 'ready'}>
                    {vns.get.loading && <span>Refreshing</span>}
                    {vns.get()?.length === 0 && (
                        <span>
                            No Visual Novels found. Try adding a library in
                            settings!
                        </span>
                    )}
                    <For each={vns.get()}>{(vn) => <div>{vn.title}</div>}</For>
                </Match>
            </Switch>
        </main>
    );
};
