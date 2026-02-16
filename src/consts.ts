export const sortDirection = ['Asc', 'Desc'] as const;

export type SortDirectionType = (typeof sortDirection)[number];
