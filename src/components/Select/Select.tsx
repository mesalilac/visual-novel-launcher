import './Select.css';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import {
    createEffect,
    createMemo,
    createSignal,
    For,
    type JSX,
    Match,
    mergeProps,
    onCleanup,
    Show,
    Switch,
    type VoidComponent,
} from 'solid-js';
import { Divider, IconCaretDownMd, IconCheck, Popover } from '@/components';

type Props = {
    placeholder?: string;
    options: {
        icon?: JSX.Element;
        label?: string;
        value: string;
        disabled?: boolean;
    }[];
    selected: string | string[];
    searchable?: boolean;
    emptyPlaceholder?: string;
    onChange: (value: string) => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    onClearSelection?: () => void;
    disabled?: boolean;
    closeOnSelect?: boolean;
    pinSelected?: boolean;
};

export const Select: VoidComponent<Props> = (rawProps) => {
    const props = mergeProps(
        { closeOnSelect: !Array.isArray(rawProps.selected), searchable: false },
        rawProps,
    );

    let searchInputRef!: HTMLInputElement;
    let popoverTriggerRef!: HTMLButtonElement;
    let popoverContentRef!: HTMLDivElement;

    const [isOpen, setIsOpen] = createSignal(false);
    const [searchQuery, setSearchQuery] = createSignal('');

    const isMultiSelect = () => Array.isArray(props.selected);

    const selectedSet = createMemo(() => {
        return isMultiSelect()
            ? new Set(props.selected)
            : new Set([props.selected]);
    });

    const isSelected = (value: string) => {
        return selectedSet().has(value);
    };

    const isAutoClose = () => !isMultiSelect() && props.closeOnSelect;

    const closeMenu = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                setIsOpen(false);
            },
        });

        tl.to(popoverContentRef, {
            y: 20,
            opacity: 0,
            scale: 0.95,
            duration: 0.2,
            ease: 'circ.out',
        });
    };

    const filteredTags = createMemo(() => {
        return props.options.filter((option) => {
            const text = (option.label ?? option.value).toLowerCase();

            return text.includes(searchQuery().toLowerCase());
        });
    });

    const sortedTags = createMemo(() => {
        const list = [...(filteredTags() || [])];

        return list.sort((a, b) => {
            if (props.pinSelected) {
                const aSelected = isSelected(a.value);
                const bSelected = isSelected(b.value);

                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
            }

            return 0;
        });
    });

    createEffect(() => {
        if (isOpen() && popoverContentRef) {
            const ctx = gsap.context(() => {
                gsap.timeline().from(popoverContentRef, {
                    y: 20,
                    autoAlpha: 0,
                    scale: 0.95,
                    duration: 0.2,
                    ease: 'circ.out',
                    onStart: () => {
                        if (props.searchable && searchInputRef)
                            searchInputRef.focus();
                    },
                });
            });

            onCleanup(() => ctx.revert());
        }
    });

    createEffect(() => {
        if (!isOpen()) {
            setSearchQuery('');
        }
    });

    const handleOptionClick = (value: string) => {
        const state = Flip.getState('.select-menu__item', { simple: true });

        props.onChange(value);

        if (isAutoClose()) {
            closeMenu();
        } else {
            Flip.from(state, {
                duration: 0.2,
                ease: 'power2.inOut',
                scale: true,
                simple: true,
                onEnter: (el) =>
                    gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1 }),
                onLeave: (el) => gsap.to(el, { autoAlpha: 1 }),
            });
        }
    };

    return (
        <>
            <button
                aria-expanded={isOpen()}
                class='select-menu__trigger'
                classList={{
                    'menu-open': isOpen(),
                }}
                disabled={props.disabled}
                ref={popoverTriggerRef}
                role='combobox'
                type='button'
            >
                <Switch fallback={props.placeholder ?? 'Select an option'}>
                    <Match when={isMultiSelect()}>
                        <Show
                            fallback={<>{props.selected.length} selected</>}
                            when={props.placeholder}
                        >
                            <span>{props.placeholder}</span>
                            <span class='select-menu__selected_count'>
                                {props.selected.length}
                            </span>
                        </Show>
                    </Match>
                    <Match when={!isMultiSelect() && props.selected}>
                        {props.selected}
                    </Match>
                </Switch>
                <IconCaretDownMd size='1.5em' />
            </button>
            <Popover
                onOpenChange={(open) => {
                    if (open) {
                        setIsOpen(open);
                        return;
                    }

                    closeMenu();
                }}
                open={isOpen()}
                targetPositionArea='bottom center'
                triggerElement={popoverTriggerRef}
            >
                <div
                    class='flex-column margin-top-xs select-menu'
                    ref={popoverContentRef}
                >
                    <Show
                        when={
                            props.searchable ||
                            props.onSelectAll ||
                            props.onDeselectAll ||
                            props.onClearSelection
                        }
                    >
                        <div class='select-menu__filter'>
                            <Show when={props.searchable}>
                                <input
                                    class='flex-grow'
                                    onInput={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (
                                            e.key === 'Enter' &&
                                            sortedTags().length > 0
                                        ) {
                                            setSearchQuery('');

                                            handleOptionClick(
                                                sortedTags()[0].value,
                                            );

                                            if (isAutoClose()) {
                                                closeMenu();
                                            }
                                        } else if (e.key === 'Escape') {
                                            closeMenu();
                                        }
                                    }}
                                    placeholder='Search...'
                                    ref={searchInputRef}
                                    type='search'
                                    value={searchQuery()}
                                />
                            </Show>
                            <Show when={isMultiSelect()}>
                                <Show when={props.onSelectAll}>
                                    <button
                                        class='button-primary select-menu__filter-button'
                                        onClick={props.onSelectAll}
                                        title='Select all'
                                        type='button'
                                    >
                                        Select All
                                    </button>
                                </Show>
                                <Show when={props.onDeselectAll}>
                                    <button
                                        class='button-primary select-menu__filter-button'
                                        onClick={props.onDeselectAll}
                                        title='Deselect all'
                                        type='button'
                                    >
                                        Deselect All
                                    </button>
                                </Show>
                            </Show>
                            <Show
                                when={
                                    !isMultiSelect() &&
                                    props.selected &&
                                    props.onClearSelection
                                }
                            >
                                <button
                                    class='button-primary select-menu__filter-button'
                                    onClick={props.onClearSelection}
                                    title='Clear selection'
                                    type='button'
                                >
                                    Clear Selection
                                </button>
                            </Show>
                        </div>
                        <Divider />
                    </Show>
                    <div class='select-menu__list'>
                        <Switch>
                            <Match
                                when={
                                    sortedTags().length === 0 &&
                                    searchQuery().length > 0
                                }
                            >
                                No results found for "{searchQuery()}"
                            </Match>
                            <Match when={sortedTags().length === 0}>
                                {props.emptyPlaceholder ?? 'No options'}
                            </Match>
                            <Match when={sortedTags().length > 0}>
                                <For each={sortedTags()}>
                                    {(option) => (
                                        <button
                                            class='justify-between select-menu__item'
                                            classList={{
                                                selected: isSelected(
                                                    option.value,
                                                ),
                                            }}
                                            data-flip-id={option.value}
                                            disabled={option.disabled}
                                            onClick={() =>
                                                handleOptionClick(option.value)
                                            }
                                            type='button'
                                        >
                                            <div class='flex-row'>
                                                {option.icon ?? null}
                                                {option.label ?? option.value}
                                            </div>
                                            <Show
                                                when={isSelected(option.value)}
                                            >
                                                <IconCheck />
                                            </Show>
                                        </button>
                                    )}
                                </For>
                            </Match>
                        </Switch>
                    </div>
                </div>
            </Popover>
        </>
    );
};
