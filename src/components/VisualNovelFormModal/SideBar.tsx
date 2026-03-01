import { convertFileSrc } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import gsap from 'gsap';
import { createSignal, type VoidComponent } from 'solid-js';
import defaultCover from '@/assets/cover-image-placeholder.svg';
import { IconFolderOpen } from '@/components';
import { useVisualNovelStoreContext } from './context';
import styles from './VisualNovelFormModal.module.css';

export const SideBar: VoidComponent = () => {
    const data = useVisualNovelStoreContext();
    let coverRef!: HTMLImageElement;

    let coverHoverTimeout: number | undefined;
    let coverLeaveTimeout: number | undefined;

    const [previewImgSrc, setPreviewImgSrc] = createSignal(
        data.get.mode.type === 'edit' && data.get.mode.vn.coverPath
            ? convertFileSrc(data.get.mode.vn.coverPath)
            : defaultCover,
    );

    const [isHovered, setIsHovered] = createSignal(false);
    const [isAnimating, setIsAnimating] = createSignal(false);

    const handleResetImg = () => {
        if (data.get.mode.type === 'edit')
            data.set('form', 'coverPath', data.get.mode.vn.coverPath);
        else data.set('form', 'coverPath', undefined);

        setPreviewImgSrc(
            data.get.mode.type === 'edit' && data.get.mode.vn.coverPath
                ? convertFileSrc(data.get.mode.vn.coverPath)
                : defaultCover,
        );
    };

    const handleBrowseImg = async () => {
        const path = await open({
            title: 'Select cover image',
            defaultPath: data.get.form.dirPath
                ? data.get.form.dirPath
                : data.get.mode.type === 'edit'
                  ? data.get.mode.vn.dirPath
                  : undefined,
            filters: [
                { name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
            ],
        });

        if (!path) return;

        data.set('form', 'coverPath', path);
        setPreviewImgSrc(convertFileSrc(path));
    };

    const onCoverHoverEnter = (e: MouseEvent) => {
        clearTimeout(coverLeaveTimeout);

        coverHoverTimeout = setTimeout(() => {
            setIsHovered(true);
            onCoverHover(e);
        }, 500);
    };

    const onCoverHover = (e: MouseEvent) => {
        if (!coverRef || !isHovered() || isAnimating()) return;

        const rect = coverRef.getBoundingClientRect();

        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const tiltX = (y - 0.5) * 20;
        const tiltY = (x - 0.5) * -20;

        gsap.to(coverRef, {
            rotationX: tiltX,
            rotationY: tiltY,
            scale: 0.85,
            duration: 0.5,
            boxShadow: '0 0 30px 1px rgb(0 0 0 / 30%)',
            ease: 'power2.out',
        });
    };

    const onCoverLeave = () => {
        if (!coverRef) return;

        clearTimeout(coverHoverTimeout);

        coverLeaveTimeout = setTimeout(() => {
            setIsHovered(false);

            gsap.to(coverRef, {
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                boxShadow: 'none',
                ease: 'power3.out',
                onStart: () => {
                    setIsAnimating(true);
                },
                onComplete: () => {
                    setIsAnimating(false);
                },
            });
        }, 1000);
    };

    return (
        <div class={styles.sidebar}>
            <img
                aria-label='Visual novel cover'
                class={styles.sidebar__cover}
                onError={() => setPreviewImgSrc(defaultCover)}
                onMouseEnter={onCoverHoverEnter}
                onMouseLeave={onCoverLeave}
                onMouseMove={onCoverHover}
                ref={coverRef}
                src={previewImgSrc()}
            />
            <div class='flex-row'>
                <button
                    class='flex-grow'
                    onClick={handleResetImg}
                    type='button'
                >
                    Reset
                </button>
                <button
                    class='flex-grow button-primary'
                    onClick={handleBrowseImg}
                    type='button'
                >
                    <IconFolderOpen />
                    Browse
                </button>
            </div>
        </div>
    );
};
