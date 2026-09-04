import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { InlineAdd } from '../../components/inline-add/inline-add';
import { PageHeader } from '../../components/page-header/page-header';
import { Status } from '../../components/status/status';
import { Category } from '../../model/category.model';
import { CategoryService } from '../../service/category.service';
import { TopicService } from '../../service/topic.service';

interface CategoryRow extends Category {
  topicCount: number;
}

@Component({
  selector: 'app-categories',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    PageHeader,
    Status,
    InlineAdd,
  ],
  templateUrl: './categories.html',
})
export class Categories implements OnInit {
  private service = inject(CategoryService);
  private topicService = inject(TopicService);

  protected readonly categories = signal<CategoryRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);

  protected readonly newName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(255)],
  });
  protected readonly editName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(255)],
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      categories: this.service.getAll(),
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
              ...category,
              topicCount: topicsByCategory.get(category.id) ?? 0,
            })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Kategorien konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  protected add(): void {
    if (this.newName.invalid) {
      this.newName.markAsTouched();
      return;
    }
    const name = this.newName.value.trim();
    if (!name) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.service.create(name).subscribe({
      next: () => {
        this.newName.reset('');
        this.load();
      },
      error: () => {
        this.error.set('Kategorie konnte nicht erstellt werden.');
        this.loading.set(false);
      },
    });
  }

  protected startEdit(category: Category): void {
    this.editingId.set(category.id);
    this.editName.setValue(category.name);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(category: Category): void {
    if (this.editName.invalid) {
      this.editName.markAsTouched();
      return;
    }
    const name = this.editName.value.trim();
    if (!name || name === category.name) {
      this.cancelEdit();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.service.update({ id: category.id, name }).subscribe({
      next: () => {
        this.editingId.set(null);
        this.load();
      },
      error: () => {
        this.error.set('Kategorie konnte nicht gespeichert werden.');
        this.loading.set(false);
      },
    });
  }

  protected remove(category: Category): void {
    const confirmed = confirm(
      `Kategorie "${category.name}" wirklich löschen? Zugehörige Themen werden mitentfernt.`,
    );
    if (!confirmed) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.service.delete(category.id).subscribe({
      next: () => this.load(),
      error: () => {
        this.error.set('Kategorie konnte nicht gelöscht werden.');
        this.loading.set(false);
      },
    });
  }
}
