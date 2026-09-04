import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Category } from '../../model/category.model';
import { CategoryService } from '../../service/category.service';

@Component({
  selector: 'app-categories',
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  private service = inject(CategoryService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly displayedColumns = ['name', 'actions'];

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
    this.service.getAll().subscribe({
      next: (categories) => {
        this.categories.set(
          [...categories].sort((a, b) => a.name.localeCompare(b.name)),
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
    this.service.update({ ...category, name }).subscribe({
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
      `Kategorie "${category.name}" wirklich loeschen? Zugehoerige Themen werden mitentfernt.`,
    );
    if (!confirmed) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.service.delete(category.id).subscribe({
      next: () => this.load(),
      error: () => {
        this.error.set('Kategorie konnte nicht geloescht werden.');
        this.loading.set(false);
      },
    });
  }
}
