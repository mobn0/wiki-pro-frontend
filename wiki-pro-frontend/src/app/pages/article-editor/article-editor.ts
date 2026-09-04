import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, of } from 'rxjs';
import { PageHeader } from '../../components/page-header/page-header';
import { Status } from '../../components/status/status';
import { Article } from '../../model/article.model';
import { Topic } from '../../model/topic.model';
import { ArticleService } from '../../service/article.service';
import { TopicService } from '../../service/topic.service';

@Component({
  selector: 'app-article-editor',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    PageHeader,
    Status,
  ],
  templateUrl: './article-editor.html',
})
export class ArticleEditor implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private topicService = inject(TopicService);

  private editId: number | null = null;
  private current: Article | null = null;

  protected readonly topics = signal<Topic[]>([]);
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(255)],
    }),
    topicId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    content: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected get isEdit(): boolean {
    return this.editId !== null;
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.editId = idParam ? Number(idParam) : null;

    this.loading.set(true);
    forkJoin({
      topics: this.topicService.getAll(),
      article: this.editId ? this.articleService.get(this.editId) : of(null),
    }).subscribe({
      next: ({ topics, article }) => {
        this.topics.set([...topics].sort((a, b) => a.name.localeCompare(b.name)));
        if (article) {
          this.current = article;
          this.form.setValue({
            title: article.title,
            topicId: article.topic?.id ?? null,
            content: article.content,
          });
        } else {
          const preselect = Number(this.route.snapshot.queryParamMap.get('topic'));
          if (preselect) {
            this.form.controls.topicId.setValue(preselect);
          }
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Formular konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const topic = this.topics().find((candidate) => candidate.id === value.topicId);
    if (!topic) {
      return;
    }
    this.saving.set(true);
    this.error.set(null);

    const request =
      this.editId !== null && this.current
        ? this.articleService.update({
            ...this.current,
            title: value.title.trim(),
            content: value.content,
            topic,
          })
        : this.articleService.create({
            title: value.title.trim(),
            content: value.content,
            topic,
          });

    request.subscribe({
      next: (article) => this.router.navigate(['/articles', article.id]),
      error: () => {
        this.error.set('Artikel konnte nicht gespeichert werden.');
        this.saving.set(false);
      },
    });
  }

  protected cancel(): void {
    if (this.editId !== null) {
      this.router.navigate(['/articles', this.editId]);
      return;
    }
    const topicId = this.form.controls.topicId.value;
    this.router.navigate(topicId ? ['/topics', topicId] : ['/']);
  }
}
