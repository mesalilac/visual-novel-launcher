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
        if (
            form.title?.trim() === '' ||
            (form.playtime ?? 0) > 0 ||
            form.executablePath?.trim() === ''
        )
            return;

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
    };

    return (
        <VisualNovelFormModal
            mode={{ type: 'edit', vn: props.vn }}
            onSave={handleOnAction}
            title='Edit Visual Novel'
        />
    );
};
