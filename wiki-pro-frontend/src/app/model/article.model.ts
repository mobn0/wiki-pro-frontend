import { Topic } from './topic.model';

export interface Article {
  id: number;
  title: string;
  content: string;
  topic: Topic;
}

export type ArticleDraft = Omit<Article, 'id'>;
