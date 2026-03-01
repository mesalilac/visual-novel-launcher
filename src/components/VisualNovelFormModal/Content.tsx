import { open } from '@tauri-apps/plugin-dialog';
import type { VoidComponent } from 'solid-js';
import type { VisualNovelStatus } from '@/bindings';
import { Block, LabeledField, Select, TagsList } from '@/components';
import { VisualNovelStatusList } from '@/consts';
import { useVisualNovelStoreContext } from './context';
import styles from './VisualNovelFormModal.module.css';

export const Content: VoidComponent = () => {
    const data = useVisualNovelStoreContext();

    const handleBrowseDir = async () => {
        const path = await open({
            title: 'Select game directory',
            directory: true,
        });

        if (!path) return;

        data.set('form', 'dirPath', path);

        const dirName = path
            .replace(/[\\/]+$/, '')
            .split(/[\\/]/)
            .pop();

        if (dirName && !data.get.form.title) {
            data.set('form', 'title', dirName);
        }
    };

    const handleBrowseExe = async () => {
        const path = await open({
            title: 'Select game executable',
            defaultPath: data.get.form.dirPath
                ? data.get.form.dirPath
                : data.get.mode.type === 'edit'
                  ? data.get.mode.vn.dirPath
                  : undefined,
            filters: [{ name: 'Executable', extensions: ['exe'] }],
        });

        if (!path) return;

        data.set('form', 'executablePath', path);
    };

    return (
        <div class={styles.content}>
            <Block title='properties'>
                <LabeledField title='title'>
                    <input
                        onChange={(e) =>
                            data.set('form', 'title', e.target.value)
                        }
                        placeholder='Title...'
                        required={true}
                        type='text'
                        value={
                            data.get.form.title ??
                            (data.get.mode.type === 'edit'
                                ? data.get.mode.vn.title
                                : '')
                        }
                    />
                </LabeledField>
                <div class='flex-row'>
                    <LabeledField title='status'>
                        <Select
                            onChange={(value) =>
                                data.set(
                                    'form',
                                    'status',
                                    value as VisualNovelStatus,
                                )
                            }
                            options={VisualNovelStatusList.map((x) => ({
                                value: x,
                            }))}
                            selected={
                                (data.get.form.status ??
                                    (data.get.mode.type === 'edit'
                                        ? data.get.mode.vn.status
                                        : 'Backlog')) as VisualNovelStatus
                            }
                        />
                    </LabeledField>
                    <LabeledField title='playtime'>
                        <input
                            min={0}
                            onChange={(e) =>
                                data.set(
                                    'form',
                                    'playtime',
                                    e.target.valueAsNumber,
                                )
                            }
                            placeholder='Playtime...'
                            required={true}
                            type='number'
                            value={
                                data.get.form.playtime ??
                                (data.get.mode.type === 'edit'
                                    ? data.get.mode.vn.playtime
                                    : 0)
                            }
                        />
                    </LabeledField>
                </div>
                <div class='flex-row align-stretch'>
                    <LabeledField title='description'>
                        <textarea
                            class={styles.textarea}
                            onChange={(e) =>
                                data.set('form', 'description', e.target.value)
                            }
                            placeholder='Description...'
                            value={
                                data.get.form.description ??
                                (data.get.mode.type === 'edit'
                                    ? (data.get.mode.vn.description ?? '')
                                    : '')
                            }
                        />
                    </LabeledField>
                    <LabeledField title='notes'>
                        <textarea
                            class={styles.textarea}
                            onChange={(e) =>
                                data.set('form', 'notes', e.target.value)
                            }
                            placeholder='Notes...'
                            value={
                                data.get.form.notes ??
                                (data.get.mode.type === 'edit'
                                    ? (data.get.mode.vn.notes ?? '')
                                    : '')
                            }
                        />
                    </LabeledField>
                </div>
            </Block>
            <Block title='installation & launch'>
                <LabeledField title='use locale emulator'>
                    <input
                        checked={
                            data.get.form.useLocaleEmulator ??
                            (data.get.mode.type === 'edit'
                                ? data.get.mode.vn.useLocaleEmulator
                                : true)
                        }
                        class='self-start'
                        onChange={(e) =>
                            data.set(
                                'form',
                                'useLocaleEmulator',
                                e.target.checked,
                            )
                        }
                        type='checkbox'
                    />
                </LabeledField>
                <div class='flex-row'>
                    <LabeledField title='directory path'>
                        <div class='flex-row align-stretch'>
                            <input
                                class='flex-grow'
                                disabled={data.get.mode.type === 'edit'}
                                onChange={(e) =>
                                    data.set('form', 'dirPath', e.target.value)
                                }
                                placeholder='path/to/game/'
                                required={true}
                                type='text'
                                value={data.get.form.dirPath ??
                                    (data.get.mode.type === 'edit'
                                        ? data.get.mode.vn.dirPath
                                        : '')}
                            />
                            <button
                                disabled={data.get.mode.type === 'edit'}
                                onClick={handleBrowseDir}
                                type='button'
                            >
                                Browse
                            </button>
                        </div>
                    </LabeledField>
                    <LabeledField title='executable path'>
                        <div class='flex-row align-stretch'>
                            <input
                                class='flex-grow'
                                onChange={(e) =>
                                    data.set(
                                        'form',
                                        'executablePath',
                                        e.target.value,
                                    )
                                }
                                placeholder='path/to/game.exe'
                                required={true}
                                type='text'
                                value={
                                    data.get.form.executablePath ??
                                    (data.get.mode.type === 'edit'
                                        ? data.get.mode.vn.executablePath
                                        : '')
                                }
                            />
                            <button onClick={handleBrowseExe} type='button'>
                                Browse
                            </button>
                        </div>
                    </LabeledField>
                </div>
                <LabeledField title='launch options'>
                    <input
                        onChange={(e) =>
                            data.set('form', 'launchOptions', e.target.value)
                        }
                        placeholder='--windowed'
                        type='text'
                        value={
                            data.get.form.launchOptions ??
                            (data.get.mode.type === 'edit'
                                ? (data.get.mode.vn.launchOptions ?? '')
                                : '')
                        }
                    />
                </LabeledField>
            </Block>
            <Block title='tags'>
                <TagsList
                    onChange={(tags) => data.set('form', 'tagIds', tags)}
                    tagIds={data.get.form.tagIds}
                    type='picker'
                />
            </Block>
        </div>
    );
};
