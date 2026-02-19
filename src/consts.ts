export const sortDirectionList = ['Asc', 'Desc'] as const;

export type SortDirectionType = (typeof sortDirectionList)[number];

export const sortByStatusList = [
    'All',
    'Playing',
    'Finished',
    'Dropped',
    'Backlog',
    'Unplayed',
] as const;
export type SortByStatusType = (typeof sortByStatusList)[number];

export const sortByList = ['Relevance', 'Name', 'Date Added'] as const;
export type SortByType = (typeof sortByList)[number];

export const VisualNovelStatusList = [
    'Backlog',
    'Playing',
    'Finished',
    'Dropped',
] as const;
