import './Divider.css';

export const Divider = (props: { class?: string; vertical?: boolean }) => {
    return (
        <div
            class={props.class}
            classList={{
                divider: !props.vertical,
                'divider-vertical': props.vertical,
            }}
        />
    );
};
