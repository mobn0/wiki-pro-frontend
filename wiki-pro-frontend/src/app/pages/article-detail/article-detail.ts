import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppRoles } from '../../app.roles';
import { Breadcrumb, Crumb } from '../../components/breadcrumb/breadcrumb';
import { PageHeader } from '../../components/page-header/page-header';
import { Status } from '../../components/status/status';
import { Article } from '../../model/article.model';
import { AppAuthService } from '../../service/app.auth.service';
import { ArticleService } from '../../service/article.service';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, Breadcrumb, PageHeader, Status],
  templateUrl: './article-detail.html',
})
export class ArticleDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AppAuthService);
  private articleService = inject(ArticleService);

  private articleId = 0;

  protected readonly canEdit =
    this.auth.hasRole(AppRoles.Update) || this.auth.hasRole(AppRoles.Admin);
  protected readonly article = signal<Article | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly crumbs = computed<Crumb[]>(() => {
    const article = this.article();
    if (!article) {
      return [];
    }
    return [
      { label: 'Home', link: '/' },
      { label: article.topic.category.name, link: ['/categories', article.topic.category.id] },
      { label: article.topic.name, link: ['/topics', article.topic.id] },
      { label: article.title },
    ];
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.articleId = Number(params.get('id'));
      this.load();
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.articleService.get(this.articleId).subscribe({
      next: (article) => {
        this.article.set(article);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Artikel konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  protected remove(): void {
    const article = this.article();
    if (!article || !this.canEdit) {
      return;
    }
    if (!confirm(`Artikel "${article.title}" wirklich löschen?`)) {
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.articleService.delete(article.id).subscribe({
      next: () => this.router.navigate(['/topics', article.topic.id]),
      error: () => {
        this.error.set('Artikel konnte nicht gelöscht werden.');
        this.loading.set(false);
      },
    });
  }
}
