export const tagSortBy = ['Relevance', 'Name', 'Date Added'] as const;

export type TagSortByType = (typeof tagSortBy)[number];

export const sortDirection = ['Asc', 'Desc'] as const;

export type SortDirectionType = (typeof sortDirection)[number];
