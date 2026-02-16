export const sortDirectionList = ['Asc', 'Desc'] as const;

export type SortDirectionType = (typeof sortDirectionList)[number];
