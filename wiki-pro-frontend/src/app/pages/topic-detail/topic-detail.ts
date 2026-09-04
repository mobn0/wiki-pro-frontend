import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { forkJoin } from 'rxjs';
import { AppRoles } from '../../app.roles';
import { Breadcrumb, Crumb } from '../../components/breadcrumb/breadcrumb';
import { PageHeader } from '../../components/page-header/page-header';
import { Status } from '../../components/status/status';
import { Topic } from '../../model/topic.model';
import { AppAuthService } from '../../service/app.auth.service';
import { ArticleService } from '../../service/article.service';
import { TopicService } from '../../service/topic.service';

interface ArticleRow {
  id: number;
  title: string;
  snippet: string;
}

@Component({
  selector: 'app-topic-detail',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    Breadcrumb,
    PageHeader,
    Status,
  ],
  templateUrl: './topic-detail.html',
})
export class TopicDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private auth = inject(AppAuthService);
  private topicService = inject(TopicService);
  private articleService = inject(ArticleService);

  private topicId = 0;

  protected readonly canEdit =
    this.auth.hasRole(AppRoles.Update) || this.auth.hasRole(AppRoles.Admin);
  protected readonly topic = signal<Topic | null>(null);
  protected readonly articles = signal<ArticleRow[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly heading = computed(() => {
    const topic = this.topic();
    return topic ? `${topic.name} – Artikel` : 'Artikel';
  });

  protected readonly crumbs = computed<Crumb[]>(() => {
    const topic = this.topic();
    if (!topic) {
      return [{ label: 'Home', link: '/' }];
    }
    return [
      { label: 'Home', link: '/' },
      { label: topic.category.name, link: ['/categories', topic.category.id] },
      { label: topic.name },
    ];
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.topicId = Number(params.get('id'));
      this.load();
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      topic: this.topicService.get(this.topicId),
      articles: this.articleService.getAll(),
    }).subscribe({
      next: ({ topic, articles }) => {
        this.topic.set(topic);
        this.articles.set(
          articles
            .filter((article) => article.topic?.id === this.topicId)
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((article) => ({
              id: article.id,
              title: article.title,
              snippet: this.snippet(article.content),
            })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Artikel konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  private snippet(content: string): string {
    const text = (content ?? '').trim().replace(/\s+/g, ' ');
    return text.length > 120 ? `${text.slice(0, 120)}…` : text;
  }
}
