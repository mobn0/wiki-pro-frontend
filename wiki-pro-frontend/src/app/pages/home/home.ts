import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { forkJoin } from 'rxjs';
import { CategoryService } from '../../service/category.service';
import { TopicService } from '../../service/topic.service';

interface CategoryCard {
  id: number;
  name: string;
  topicCount: number;
}

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatProgressBarModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private categoryService = inject(CategoryService);
  private topicService = inject(TopicService);

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly categories = signal<CategoryCard[]>([]);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      categories: this.categoryService.getAll(),
      topics: this.topicService.getAll(),
    }).subscribe({
      next: ({ categories, topics }) => {
        const topicsByCategory = new Map<number, number>();
        for (const topic of topics) {
          const categoryId = topic.category?.id;
          if (categoryId != null) {
            topicsByCategory.set(categoryId, (topicsByCategory.get(categoryId) ?? 0) + 1);
          }
        }

        this.categories.set(
          [...categories]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => ({
              id: category.id,
              name: category.name,
              topicCount: topicsByCategory.get(category.id) ?? 0,
            })),
        );

        this.loading.set(false);
      },
      error: () => {
        this.error.set('Startseite konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }
}
