import { type Component, type JSX, splitProps } from 'solid-js';

import styles from './Flex.module.css';

interface Props extends JSX.HTMLAttributes<HTMLDivElement> {
    column?: boolean;
    center?: boolean;
    noWrap?: boolean;
    visibility?: boolean;
    flex?: '1' | 'auto' | 'none' | 'grow' | 'shrink-0';
    self?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'between' | 'center' | 'end' | 'start';
    align?: 'start' | 'stretch' | 'baseline';
    overflow?:
        | 'hidden'
        | 'x-hidden'
        | 'y-hidden'
        | 'auto'
        | 'x-auto'
        | 'y-auto';
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    margin?:
        | 'none'
        | 'auto'
        | 'xxs'
        | 'xs'
        | 'sm'
        | 'md'
        | 'lg'
        | 'xl'
        | 'xxl'
        | 'xxxl'
        | 'top-none'
        | 'top-auto'
        | 'top-xxs'
        | 'top-xs'
        | 'top-sm'
        | 'top-md'
        | 'top-lg'
        | 'top-xl'
        | 'top-xxl'
        | 'top-xxxl'
        | 'bottom-none'
        | 'bottom-auto'
        | 'bottom-xxs'
        | 'bottom-xs'
        | 'bottom-sm'
        | 'bottom-md'
        | 'bottom-lg'
        | 'bottom-xl'
        | 'bottom-xxl'
        | 'bottom-xxxl'
        | 'left-none'
        | 'left-auto'
        | 'left-xxs'
        | 'left-xs'
        | 'left-sm'
        | 'left-md'
        | 'left-lg'
        | 'left-xl'
        | 'left-xxl'
        | 'left-xxxl'
        | 'right-none'
        | 'right-auto'
        | 'right-xxs'
        | 'right-xs'
        | 'right-sm'
        | 'right-md'
        | 'right-lg'
        | 'right-xl'
        | 'right-xxl'
        | 'right-xxxl';
    padding?:
        | 'none'
        | 'xxs'
        | 'xs'
        | 'sm'
        | 'md'
        | 'lg'
        | 'xl'
        | 'xxl'
        | 'xxxl'
        | 'top-none'
        | 'top-xxs'
        | 'top-xs'
        | 'top-sm'
        | 'top-md'
        | 'top-lg'
        | 'top-xl'
        | 'top-xxl'
        | 'top-xxxl'
        | 'bottom-none'
        | 'bottom-xxs'
        | 'bottom-xs'
        | 'bottom-sm'
        | 'bottom-md'
        | 'bottom-lg'
        | 'bottom-xl'
        | 'bottom-xxl'
        | 'bottom-xxxl'
        | 'left-none'
        | 'left-xxs'
        | 'left-xs'
        | 'left-sm'
        | 'left-md'
        | 'left-lg'
        | 'left-xl'
        | 'left-xxl'
        | 'left-xxxl'
        | 'right-none'
        | 'right-xxs'
        | 'right-xs'
        | 'right-sm'
        | 'right-md'
        | 'right-lg'
        | 'right-xl'
        | 'right-xxl'
        | 'right-xxxl'
        | 'sides-none'
        | 'sides-xxs'
        | 'sides-xs'
        | 'sides-sm'
        | 'sides-md'
        | 'sides-lg'
        | 'sides-xl'
        | 'sides-xxl'
        | 'sides-xxxl';
    radius?: 'none' | 'sm' | 'md' | 'lg';
    border?: 'none' | 'xs' | 'sm' | 'md' | 'lg';
    children?: JSX.Element;
}

export const Flex: Component<Props> = (props) => {
    const [pickedProps, otherProps] = splitProps(props, [
        'column',
        'center',
        'noWrap',
        'visibility',
        'flex',
        'self',
        'justify',
        'align',
        'overflow',
        'gap',
        'margin',
        'padding',
        'radius',
        'border',
        'children',
    ]);

    const visibility = pickedProps.visibility ? 'visible' : 'invisible';
    const direction = pickedProps.column ? 'flex-column' : 'flex-row';
    const flex = pickedProps.flex ? `flex-${pickedProps.flex}` : '';
    const self = pickedProps.self ? `self-${pickedProps.self}` : '';
    const justify = pickedProps.justify ? `justify-${pickedProps.justify}` : '';
    const align = pickedProps.align ? `align-${pickedProps.align}` : '';
    const overflow = pickedProps.overflow
        ? `overflow-${pickedProps.overflow}`
        : '';
    const gap = pickedProps.gap ? `gap-${pickedProps.gap}` : '';
    const margin = pickedProps.margin ? `margin-${pickedProps.margin}` : '';
    const padding = pickedProps.padding ? `padding-${pickedProps.padding}` : '';
    const radius = pickedProps.radius ? `radius-${pickedProps.radius}` : '';
    const border = pickedProps.border ? `border-${pickedProps.border}` : '';

    return (
        <div
            classList={{
                [visibility]: pickedProps.visibility !== undefined,
                [direction]: true,
                'flex-center': pickedProps.center,
                [flex]: pickedProps.flex !== undefined,
                [self]: pickedProps.self !== undefined,
                [justify]: pickedProps.justify !== undefined,
                [align]: pickedProps.align !== undefined,
                [overflow]: pickedProps.overflow !== undefined,
                [gap]: pickedProps.gap !== undefined,
                [margin]: pickedProps.margin !== undefined,
                [padding]: pickedProps.padding !== undefined,
                [radius]: pickedProps.radius !== undefined,
                [border]: pickedProps.border !== undefined,
                nowrap: pickedProps.noWrap,
            }}
            {...otherProps}
        >
            {pickedProps.children}
        </div>
    );
};
