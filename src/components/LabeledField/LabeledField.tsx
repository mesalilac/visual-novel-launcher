import type { JSX, ParentComponent } from 'solid-js';
import { toTitleCase } from '@/utils';

// import styles from './LabeledField.module.css';

type Props = {
    title: string;
    tooltip?: string;
    icon?: JSX.Element;
    inline?: boolean;
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
    children: JSX.Element;
};

export const LabeledField: ParentComponent<Props> = (props: Props) => {
    return (
        <div
            class={`flex-${props.inline ? 'row' : 'column'} flex-1`}
            ref={props.ref}
        >
            <h4 class='flex-row' title={props.tooltip}>
                {props.icon}
                {toTitleCase(props.title)}:
            </h4>
            {props.children}
        </div>
    );
};
