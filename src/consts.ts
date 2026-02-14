export const tagSortBy = ['Relevance', 'Name', 'VnCount', 'CreatedAt'] as const;

export type TagSortByType = (typeof tagSortBy)[number];

export const sortDirection = ['Asc', 'Desc'] as const;

export type SortDirectionType = (typeof sortDirection)[number];
