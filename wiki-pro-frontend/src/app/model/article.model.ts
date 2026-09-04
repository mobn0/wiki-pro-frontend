import { Topic } from './topic.model';

export interface Article {
  id: number;
  title: string;
  content: string;
  topic: Topic;
}
