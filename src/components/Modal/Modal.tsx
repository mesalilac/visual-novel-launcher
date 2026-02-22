import type { Accessor, JSX, Setter } from 'solid-js';
import {
    createContext,
    createEffect,
    onCleanup,
    Show,
    useContext,
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import './Modal.css';
import { IconCloseMd } from '@/components';

type ModalContextData = {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
};

const ModalContext = createContext<ModalContextData>();

export const useModalContext = () => {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error('useModalData must be used within a ModalContext');
    }

    return context;
};

export const ModalDismissButton = (props: { children?: JSX.Element }) => {
    const { setIsOpen } = useModalContext();

    return (
        <button onClick={() => setIsOpen(false)} type='button'>
            {props.children || (
                <>
                    <IconCloseMd /> Cancel
                </>
            )}
        </button>
    );
};

export const Modal = (props: {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
    children: JSX.Element;
}) => {
    const close = () => {
        props.setIsOpen(false);
    };

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            close();
        }
    };

    createEffect(() => {
        if (props.isOpen()) {
            const originalOverflow = window.getComputedStyle(
                document.body,
            ).overflow;
            document.body.style.overflow = 'hidden';

            document.addEventListener('keydown', handleKeydown);

            onCleanup(() => {
                document.body.style.overflow = originalOverflow;
                document.removeEventListener('keydown', handleKeydown);
            });
        }
    });

    return (
        <Portal>
            <Transition
                onEnter={(el, done) => {
                    const body = el.querySelector('.modal-body');

                    const animation = body?.animate(
                        [
                            {
                                transform: 'scale(0.95) translateY(24px)',
                                filter: 'blur(2px)',
                            },
                            {
                                transform: 'scale(1) translateY(0px)',
                                filter: 'blur(0px)',
                            },
                        ],
                        {
                            duration: 60,
                            easing: 'ease-in-out',
                        },
                    );

                    animation?.finished.then(done);
                }}
                onExit={(el, done) => {
                    const body = el.querySelector('.modal-body');

                    const animation = body?.animate(
                        [
                            {
                                transform: 'scale(1) translateY(0)',
                                filter: 'blur(0px)',
                            },
                            {
                                transform: 'scale(0.95) translateY(24px)',
                                filter: 'blur(2px)',
                            },
                        ],
                        {
                            duration: 40,
                            easing: 'ease-in-out',
                        },
                    );

                    animation?.finished.then(done);
                }}
            >
                <Show when={props.isOpen()}>
                    <div class='modal-container' onClick={close} role='none'>
                        <div
                            class='modal-body'
                            onClick={(e) => e.stopPropagation()}
                            role='none'
                        >
                            <ModalContext.Provider
                                value={{
                                    isOpen: props.isOpen,
                                    setIsOpen: props.setIsOpen,
                                }}
                            >
                                {props.children}
                            </ModalContext.Provider>
                        </div>
                    </div>
                </Show>
            </Transition>
        </Portal>
    );
};
