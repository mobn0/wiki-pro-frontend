import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  const base = 'http://localhost:9090/api/article';
  let service: ArticleService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ArticleService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ArticleService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all articles', () => {
    let result: unknown;
    service.getAll().subscribe((r) => (result = r));

    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    const articles = [
      { id: 1, title: 'Angular Setup', content: 'Lorem', topic: { id: 1, name: 'Frontend' } },
    ];
    req.flush(articles);

    expect(result).toEqual(articles);
  });
});
