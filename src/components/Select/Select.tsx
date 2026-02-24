import './Select.css';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
import {
    createEffect,
    createMemo,
    createSignal,
    For,
    Match,
    mergeProps,
    onCleanup,
    Show,
    Switch,
    type VoidComponent,
} from 'solid-js';
import {
    Divider,
    IconCaretDownMd,
    IconCaretUpMd,
    IconCheckboxCheck,
    IconCheckboxUnchecked,
    IconCloseMd,
    Popover,
} from '@/components';

type SelectProps = {
    placeholder: string;
    options: {
        value: string;
        label?: string;
        disabled?: boolean;
    }[];
    selected: string | string[];
    onToggle: (value: string) => void;
    onSelectAll?: () => void;
    onDeselectAll?: () => void;
    onClearSelection?: () => void;
    disabled?: boolean;
    closeOnSelect?: boolean;
    pinSelected?: boolean;
};

export const Select: VoidComponent<SelectProps> = (rawProps) => {
    const props = mergeProps(
        { closeOnSelect: !Array.isArray(rawProps.selected) },
        rawProps,
    );

    let searchInputRef!: HTMLInputElement;
    let popoverTriggerRef!: HTMLButtonElement;
    let popoverContentRef!: HTMLDivElement;

    const [isOpen, setIsOpen] = createSignal(false);
    const [searchQuery, setSearchQuery] = createSignal('');

    const isMultiSelect = () => Array.isArray(props.selected);

    const isSelected = (value: string) => {
        return isMultiSelect()
            ? props.selected.includes(value)
            : props.selected === value;
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
                    onStart: () => searchInputRef.focus(),
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

        props.onToggle(value);

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
                <Switch fallback={props.placeholder}>
                    <Match when={isMultiSelect()}>
                        <Show
                            fallback={<>{props.selected.length} selected</>}
                            when={props.placeholder}
                        >
                            {props.placeholder} ({props.selected.length})
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
                    <div class='select-menu__filter'>
                        <input
                            class='flex-grow'
                            onInput={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (
                                    e.key === 'Enter' &&
                                    sortedTags().length > 0
                                ) {
                                    props.onToggle(sortedTags()[0].value);

                                    setSearchQuery('');

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
                        <Show when={isMultiSelect()}>
                            <Show when={props.onSelectAll}>
                                <button
                                    onClick={props.onSelectAll}
                                    title='Select all'
                                    type='button'
                                >
                                    <IconCheckboxCheck />
                                </button>
                            </Show>
                            <Show when={props.onDeselectAll}>
                                <button
                                    onClick={props.onDeselectAll}
                                    title='Deselect all'
                                    type='button'
                                >
                                    <IconCheckboxUnchecked />
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
                                onClick={props.onClearSelection}
                                title='Clear selection'
                                type='button'
                            >
                                <IconCloseMd />
                            </button>
                        </Show>
                    </div>
                    <Divider />
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
                                No options
                            </Match>
                            <Match when={sortedTags().length > 0}>
                                <For each={sortedTags()}>
                                    {(option) => (
                                        <button
                                            class='select-menu__item'
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
                                            <Show
                                                fallback={
                                                    <IconCheckboxUnchecked />
                                                }
                                                when={isSelected(option.value)}
                                            >
                                                <IconCheckboxCheck />
                                            </Show>
                                            {option.label ?? option.value}
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
