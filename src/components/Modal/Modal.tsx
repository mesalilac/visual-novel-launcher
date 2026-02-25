import gsap from 'gsap';
import type { Accessor, JSX, Setter } from 'solid-js';
import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import { Portal } from 'solid-js/web';
import {
    Divider,
    IconCloseMd,
    IconSave,
    ModalContext,
    useModalContext,
} from '@/components';
import './Modal.css';

export const ModalActionButtons = (props: {
    onAction: () => void;
    dismiss?: JSX.Element;
    action?: JSX.Element;
}) => {
    const { setIsOpen } = useModalContext();

    return (
        <>
            <Divider class='margin-top-auto' />
            <div class='flex-row self-end'>
                <button onClick={() => setIsOpen(false)} type='button'>
                    {props.dismiss || (
                        <>
                            <IconCloseMd /> Cancel
                        </>
                    )}
                </button>
                <button
                    class='button-primary'
                    onClick={props.onAction}
                    type='button'
                >
                    {props.action || (
                        <>
                            <IconSave /> Save
                        </>
                    )}
                </button>
            </div>
        </>
    );
};

export const Modal = (props: {
    isOpen: Accessor<boolean>;
    setIsOpen: Setter<boolean>;
    children: JSX.Element;
}) => {
    let modalOverlayRef: HTMLDivElement | undefined;
    let modalContentRef: HTMLDivElement | undefined;

    const [shouldRender, setShouldRender] = createSignal(false);

    const animateOut = () => {
        if (!modalOverlayRef || !modalContentRef) return;

        const tl = gsap.timeline({
            onComplete: () => {
                setShouldRender(false);
                props.setIsOpen(false);
            },
        });

        tl.to(modalContentRef, {
            y: 20,
            opacity: 0,
            scale: 0.95,
            duration: 0.2,
            ease: 'power2.in',
        }).to(modalOverlayRef, { autoAlpha: 0, duration: 0.2 }, '-=0.1');
    };

    const close = () => animateOut();

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            close();
        }
    };

    createEffect(() => {
        if (props.isOpen()) {
            setShouldRender(true);
            requestAnimationFrame(() => {
                if (modalOverlayRef && modalContentRef) {
                    gsap.timeline()
                        .to(modalOverlayRef, {
                            autoAlpha: 1,
                            duration: 0.2,
                            ease: 'power2.out',
                        })
                        .from(
                            modalContentRef,
                            {
                                y: 20,
                                autoAlpha: 0,
                                duration: 0.2,
                                ease: 'back.out(1.7)',
                            },
                            '-=0.2',
                        );
                }
            });

            const originalOverflow = window.getComputedStyle(
                document.body,
            ).overflow;
            document.body.style.overflow = 'hidden';

            document.addEventListener('keydown', handleKeydown);

            onCleanup(() => {
                document.body.style.overflow = originalOverflow;
                document.removeEventListener('keydown', handleKeydown);
            });
        } else {
            if (shouldRender()) animateOut();
        }
    });

    return (
        <Portal>
            <Show when={shouldRender()}>
                <div
                    class='modal-container'
                    onClick={close}
                    ref={modalOverlayRef}
                    role='none'
                >
                    <div
                        class='modal-body'
                        onClick={(e) => e.stopPropagation()}
                        ref={modalContentRef}
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
        </Portal>
    );
};
