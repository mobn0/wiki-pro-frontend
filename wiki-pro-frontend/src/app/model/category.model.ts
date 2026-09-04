export interface Category {
  id: number;
  name: string;
}

export type CategoryDraft = Pick<Category, 'name'>;
