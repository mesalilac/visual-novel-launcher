import toast from 'solid-toast';
import { commands, type VisualNovel } from '@/bindings';
import {
    useModalContext,
    type VisualNovelForm,
    VisualNovelFormModal,
} from '@/components';
import { useGlobalData } from '@/store';
import { handleIpcError, reportIpcError } from '@/utils';
// import styles from './EditVisualNovelModal.module.css';

export const EditVisualNovelModal = (props: { vn: VisualNovel }) => {
    const globalData = useGlobalData();
    const { setIsOpen } = useModalContext();

    const handleOnAction = async (form: VisualNovelForm) => {
        if (form.title && form.title.trim() === '') {
            toast.error("'Title' can't be empty");
            return;
        }
        if (form.playtime && form.playtime < 0) {
            toast.error("'Playtime' must be greater than 0");
            return;
        }
        if (form.dirPath && form.dirPath.trim() === '') {
            toast.error("'Directory Path' can't be empty");
            return;
        }
        if (form.executablePath && form.executablePath.trim() === '') {
            toast.error("'Executable Path' can't be empty");
            return;
        }

        setIsOpen(false);

        const res = await commands
            .updateVisualNovel(props.vn.id, {
                coverPath: form.coverPath,
                title: form.title,
                description: form.description,
                status: form.status,
                playtime: form.playtime,
                isFavorite: form.isFavorite,
                notes: form.notes,
                executablePath: form.executablePath,
                launchOptions: form.launchOptions,
                useLocaleEmulator: form.useLocaleEmulator,
                tagIds: form.tagIds?.map((tag) => tag.id),
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

            return prev.map((vn) => {
                if (vn.id === props.vn.id) return res.data;
                return vn;
            });
        });

        globalData.resources.tags.refetch();
    };

    return (
        <VisualNovelFormModal
            mode={{ type: 'edit', vn: props.vn }}
            onSave={handleOnAction}
            title='Edit Visual Novel'
        />
    );
};
