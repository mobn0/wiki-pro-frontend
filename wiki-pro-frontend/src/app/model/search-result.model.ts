import { Article } from './article.model';
import { Category } from './category.model';
import { Topic } from './topic.model';

export interface SearchResult {
  topics: Topic[];
  articles: Article[];
  categories: Category[];
}
