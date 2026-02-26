import { createEffect, type VoidComponent } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Divider, ModalActionButtons } from '@/components';
import { useGlobalData } from '@/store';
import { toTitleCase } from '@/utils';
import { Content } from './Content';
import {
    type Mode,
    type VisualNovelForm,
    type VisualNovelStore,
    VisualNovelStoreContext,
} from './context';
import { SideBar } from './SideBar';
import styles from './VisualNovelFormModal.module.css';

type Props = {
    title: string;
    mode: Mode;
    onSave: (form: VisualNovelForm) => void;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
};

const Header: VoidComponent<{ title: string }> = (props) => {
    return (
        <>
            <h2>{toTitleCase(props.title)}</h2>
            <Divider class='margin-bottom-lg' />
        </>
    );
};

export const VisualNovelFormModal: VoidComponent<Props> = (props: Props) => {
    const globalData = useGlobalData();

    const [store, setStore] = createStore<VisualNovelStore>({
        form: {},
        mode: props.mode,
    });

    createEffect(() => {
        if (
            globalData.resources.tags.get.state === 'ready' &&
            store.form.tagIds === undefined
        ) {
            setStore(
                'form',
                'tagIds',
                globalData.resources.tags
                    .get()
                    .filter(
                        (tag) =>
                            props.mode.type === 'edit' &&
                            props.mode.vn.tags.some((x) => x.id === tag.id),
                    ),
            );
        }
    });

    return (
        <VisualNovelStoreContext.Provider value={{ get: store, set: setStore }}>
            <div class='flex-column height-100' ref={props.ref}>
                <Header title={props.title} />
                <div class={styles.modal}>
                    <SideBar />
                    <Divider vertical />
                    <Content />
                </div>
                <ModalActionButtons onAction={() => props.onSave(store.form)} />
            </div>
        </VisualNovelStoreContext.Provider>
    );
};
