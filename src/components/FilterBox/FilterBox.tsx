import { useGlobalData } from '@/store';
import './FilterBox.css';
import { Select } from '@/components';
import {
    type SortByStatusType,
    type SortByType,
    type SortDirectionType,
    sortByList,
    sortByStatusList,
    sortDirectionList,
} from '@/consts';

export const FilterBox = () => {
    const globalData = useGlobalData();

    return (
        <div class='flex-row justify-between'>
            <input
                onInput={(e) =>
                    globalData.setStore('vnsFilter', 'query', e.target.value)
                }
                placeholder='Search'
                type='search'
                value={globalData.store.vnsFilter.query}
            />
            <div class='flex-row'>
                <Select
                    onChange={(id) => {
                        if (globalData.store.vnsFilter.tagIds.includes(id)) {
                            globalData.setStore('vnsFilter', 'tagIds', [
                                ...globalData.store.vnsFilter.tagIds.filter(
                                    (tagId) => tagId !== id,
                                ),
                            ]);
                            return;
                        }

                        globalData.setStore('vnsFilter', 'tagIds', [
                            ...globalData.store.vnsFilter.tagIds,
                            id,
                        ]);
                    }}
                    onDeselectAll={() => {
                        globalData.setStore('vnsFilter', 'tagIds', []);
                    }}
                    options={
                        globalData.resources.tags.get()?.map((tag) => ({
                            value: tag.id,
                            label: `${tag.name} (${tag.visualNovels.length})`,
                        })) || []
                    }
                    pinSelected={true}
                    placeholder='Select tags'
                    searchable
                    selected={globalData.store.vnsFilter.tagIds}
                />
                <Select
                    onChange={(value) =>
                        globalData.setStore(
                            'vnsFilter',
                            'status',
                            value as SortByStatusType,
                        )
                    }
                    options={sortByStatusList.map((x) => ({
                        value: x,
                    }))}
                    placeholder='Status'
                    selected={globalData.store.vnsFilter.status}
                />
                <Select
                    onChange={(value) => {
                        globalData.setStore(
                            'vnsFilter',
                            'sortBy',
                            value as SortByType,
                        );
                    }}
                    options={sortByList.map((x) => ({
                        value: x,
                    }))}
                    placeholder='Sort by'
                    selected={globalData.store.vnsFilter.sortBy}
                />
                <Select
                    onChange={(value) => {
                        globalData.setStore(
                            'vnsFilter',
                            'sortDirection',
                            value as SortDirectionType,
                        );
                    }}
                    options={sortDirectionList.map((x) => ({
                        value: x,
                    }))}
                    placeholder='Sort direction'
                    selected={globalData.store.vnsFilter.sortDirection}
                />
            </div>
        </div>
    );
};
