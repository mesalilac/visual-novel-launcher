import type { JSX, ParentComponent } from 'solid-js';
import { Divider } from '@/components';
import { toTitleCase } from '@/utils';
import styles from './Block.module.css';

type Props = {
    title: string;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
    children: JSX.Element;
};

export const Block: ParentComponent<Props> = (props: Props) => {
    return (
        <div class={styles.block} ref={props.ref}>
            <div class='flex-column'>
                <h3>{toTitleCase(props.title)}</h3>
                <Divider class='margin-bottom-lg' />
            </div>
            <div class='flex-column gap-lg'>{props.children}</div>
        </div>
    );
};
