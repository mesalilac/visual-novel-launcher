import type { JSX, ParentComponent } from 'solid-js';

import './Block.css';
import { Divider } from '@/components';
import { toTitleCase } from '@/utils';

type Props = {
    title: string;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
    children: JSX.Element;
};

export const Block: ParentComponent<Props> = (props: Props) => {
    return (
        <div class='block' ref={props.ref}>
            <div class='flex-column'>
                <h3>{toTitleCase(props.title)}</h3>
                <Divider class='margin-bottom-lg' />
            </div>
            <div class='flex-column gap-lg'>{props.children}</div>
        </div>
    );
};
