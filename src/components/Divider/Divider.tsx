import type { VoidComponent } from 'solid-js';
import './Divider.css';

type Props = {
    class?: string;
    vertical?: boolean;
    width?: string;
    height?: string;
};

export const Divider: VoidComponent<Props> = (props) => {
    return (
        <div
            class={props.class}
            classList={{
                divider: !props.vertical,
                'divider-vertical': props.vertical,
            }}
            style={{
                width: props.width,
                height: props.height,
            }}
        />
    );
};
