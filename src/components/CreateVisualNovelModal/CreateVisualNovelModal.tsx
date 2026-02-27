import type { Component, JSX } from 'solid-js';
import toast from 'solid-toast';
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
        if (!form.title) {
            toast.error("'Title' is required");
            return;
        }
        if (form.title && form.title.trim() === '') {
            toast.error("'Title' can't be empty");
            return;
        }
        if (form.playtime && form.playtime < 0) {
            toast.error("'Playtime' must be greater than 0");
            return;
        }
        if (!form.dirPath) {
            toast.error("'Directory Path' is required");
            return;
        }
        if (form.dirPath && form.dirPath.trim() === '') {
            toast.error("'Directory Path' can't be empty");
            return;
        }
        if (!form.executablePath) {
            toast.error("'Executable Path' is required");
            return;
        }
        if (form.executablePath && form.executablePath.trim() === '') {
            toast.error("'Executable Path' can't be empty");
            return;
        }

        setIsOpen(false);

        const res = await commands
            .createVisualNovel({
                title: form.title,
                description: form.description ?? null,
                status: form.status ?? 'Backlog',
                coverPath: form.coverPath ?? null,
                playtime: form.playtime ?? 0,
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
