import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { forkJoin } from 'rxjs';
import { AppRoles } from '../../app.roles';
import { Breadcrumb, Crumb } from '../../components/breadcrumb/breadcrumb';
import { InlineAdd } from '../../components/inline-add/inline-add';
import { PageHeader } from '../../components/page-header/page-header';
import { Status } from '../../components/status/status';
import { Category } from '../../model/category.model';
import { AppAuthService } from '../../service/app.auth.service';
import { ArticleService } from '../../service/article.service';
import { CategoryService } from '../../service/category.service';
import { TopicService } from '../../service/topic.service';

interface TopicRow {
  id: number;
  name: string;
  articleCount: number;
}

@Component({
  selector: 'app-category-detail',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    Breadcrumb,
    PageHeader,
    Status,
    InlineAdd,
  ],
  templateUrl: './category-detail.html',
})
export class CategoryDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AppAuthService);
  private categoryService = inject(CategoryService);
  private topicService = inject(TopicService);
  private articleService = inject(ArticleService);

  private categoryId = 0;

  protected readonly canManage = this.auth.hasRole(AppRoles.Admin);

  protected readonly category = signal<Category | null>(null);
  protected readonly topics = signal<TopicRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);

  protected readonly heading = computed(() => {
    const category = this.category();
    return category ? `${category.name} – Themen` : 'Themen';
  });

  protected readonly crumbs = computed<Crumb[]>(() => {
    const trail: Crumb[] = [{ label: 'Home', link: '/' }];
    if (this.canManage) {
      trail.push({ label: 'Kategorien', link: '/categories' });
    }
    const category = this.category();
    if (category) {
      trail.push({ label: category.name });
    }
    return trail;
  });

  protected readonly newName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(255)],
  });
  protected readonly editName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(255)],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.categoryId = Number(params.get('id'));
      this.load();
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      category: this.categoryService.get(this.categoryId),
      topics: this.topicService.getAll(),
      articles: this.articleService.getAll(),
    }).subscribe({
      next: ({ category, topics, articles }) => {
        this.category.set(category);
        const articlesByTopic = new Map<number, number>();
        for (const article of articles) {
          const topicId = article.topic?.id;
          if (topicId != null) {
            articlesByTopic.set(topicId, (articlesByTopic.get(topicId) ?? 0) + 1);
          }
        }
        this.topics.set(
          topics
            .filter((topic) => topic.category?.id === this.categoryId)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((topic) => ({
              id: topic.id,
              name: topic.name,
              articleCount: articlesByTopic.get(topic.id) ?? 0,
            })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Themen konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  protected add(): void {
    if (!this.canManage) {
      return;
    }
    const category = this.category();
    if (!category || this.newName.invalid) {
      this.newName.markAsTouched();
      return;
    }
    const name = this.newName.value.trim();
    if (!name) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.topicService.create(name, category).subscribe({
      next: () => {
        this.newName.reset('');
        this.load();
      },
      error: () => {
        this.error.set('Thema konnte nicht erstellt werden.');
        this.loading.set(false);
      },
    });
  }

  protected startEdit(topic: TopicRow): void {
    this.editingId.set(topic.id);
    this.editName.setValue(topic.name);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(topic: TopicRow): void {
    if (!this.canManage) {
      return;
    }
    const category = this.category();
    if (!category || this.editName.invalid) {
      this.editName.markAsTouched();
      return;
    }
    const name = this.editName.value.trim();
    if (!name || name === topic.name) {
      this.cancelEdit();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.topicService.update({ id: topic.id, name, category }).subscribe({
      next: () => {
        this.editingId.set(null);
        this.load();
      },
      error: () => {
        this.error.set('Thema konnte nicht gespeichert werden.');
        this.loading.set(false);
      },
    });
  }

  protected remove(topic: TopicRow): void {
    if (!this.canManage) {
      return;
    }
    const confirmed = confirm(
      `Thema "${topic.name}" wirklich löschen? Zugehörige Artikel werden mitentfernt.`,
    );
    if (!confirmed) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.topicService.delete(topic.id).subscribe({
      next: () => this.load(),
      error: () => {
        this.error.set('Thema konnte nicht gelöscht werden.');
        this.loading.set(false);
      },
    });
  }
}
