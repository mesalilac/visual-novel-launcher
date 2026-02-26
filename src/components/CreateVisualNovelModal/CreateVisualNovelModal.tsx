import type { Component, JSX } from 'solid-js';
import { commands } from '@/bindings';
import {
    useModalContext,
    type VisualNovelForm,
    VisualNovelFormModal,
} from '@/components';
import { useGlobalData } from '@/store';
import { handleIpcError, reportIpcError } from '@/utils';

// import styles from './CreateVisualNovelModal.module.css';

type Props = {
    ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
    children?: JSX.Element;
};

export const CreateVisualNovelModal: Component<Props> = (_props: Props) => {
    const globalData = useGlobalData();
    const { setIsOpen } = useModalContext();

    const handleOnAction = async (form: VisualNovelForm) => {
        if (
            form.title?.trim() === '' ||
            (form.playtime ?? 0) > 0 ||
            form.executablePath?.trim() === ''
        )
            return;

        if (
            !form.title ||
            !form.playtime ||
            !form.dirPath ||
            !form.status ||
            !form.executablePath
        )
            return;

        setIsOpen(false);

        const res = await commands
            .createVisualNovel({
                title: form.title,
                description: form.description ?? null,
                status: form.status,
                coverPath: form.coverPath ?? null,
                playtime: form.playtime,
                notes: form.notes ?? null,
                dirPath: form.dirPath,
                executablePath: form.executablePath,
                launchOptions: form.launchOptions ?? null,
                tagIds: form.tagIds?.map((tag) => tag.id) ?? [],
            })
            .catch(handleIpcError);

        if (!res) return;

        if (res.status === 'error') {
            reportIpcError(res.error);
            setIsOpen(true);
            return;
        }

        globalData.resources.vns.mutate((prev) => {
            if (!prev) return;

            return [...prev, res.data];
        });
    };

    return (
        <VisualNovelFormModal
            mode={{ type: 'create' }}
            onSave={handleOnAction}
            title='create new visual novel'
        />
    );
};
