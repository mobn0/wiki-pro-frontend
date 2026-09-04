import { Category } from './category.model';

export interface Topic {
  id: number;
  name: string;
  category: Category;
}
