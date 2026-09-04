import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { PageHeader } from '../../components/page-header/page-header';
import { Status } from '../../components/status/status';
import { SearchResult } from '../../model/search-result.model';
import { SearchService } from '../../service/search.service';

@Component({
  selector: 'app-search-results',
  imports: [RouterLink, MatListModule, PageHeader, Status],
  templateUrl: './search-results.html',
})
export class SearchResults implements OnInit {
  private route = inject(ActivatedRoute);
  private searchService = inject(SearchService);

  protected readonly query = signal('');
  protected readonly result = signal<SearchResult | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected get heading(): string {
    return `Suchergebnisse für "${this.query()}"`;
  }

  protected get total(): number {
    const result = this.result();
    return result ? result.categories.length + result.topics.length + result.articles.length : 0;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.query.set(params.get('query') ?? '');
      this.load();
    });
  }

  protected load(): void {
    const query = this.query().trim();
    if (!query) {
      this.result.set({ categories: [], topics: [], articles: [] });
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.searchService.search(query).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Die Suche ist fehlgeschlagen.');
        this.loading.set(false);
      },
    });
  }
}
