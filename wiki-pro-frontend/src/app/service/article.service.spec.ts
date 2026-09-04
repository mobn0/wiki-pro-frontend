import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ArticleService } from './article.service';

describe('ArticleService', () => {
  const base = 'http://localhost:9090/api/article';
  const topic = { id: 1, name: 'Frontend', category: { id: 1, name: 'Technik' } };
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
    const articles = [{ id: 1, title: 'Angular Setup', content: 'Lorem', topic }];
    req.flush(articles);

    expect(result).toEqual(articles);
  });

  it('loads one article by id', () => {
    let result: unknown;
    service.get(7).subscribe((r) => (result = r));

    const req = http.expectOne(`${base}/7`);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 7, title: 'X', content: 'Y', topic });
    expect(result).toEqual({ id: 7, title: 'X', content: 'Y', topic });
  });

  it('creates an article via POST', () => {
    service.create({ title: 'Neu', content: 'Inhalt', topic }).subscribe();

    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Neu', content: 'Inhalt', topic });
    req.flush({ id: 9, title: 'Neu', content: 'Inhalt', topic });
  });

  it('updates an article via PUT', () => {
    service.update({ id: 4, title: 'Geändert', content: 'Inhalt', topic }).subscribe();

    const req = http.expectOne(base);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: 4, title: 'Geändert', content: 'Inhalt', topic });
    req.flush({ id: 4, title: 'Geändert', content: 'Inhalt', topic });
  });

  it('deletes an article by id', () => {
    service.delete(3).subscribe();

    const req = http.expectOne(`${base}/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush('Deleted article: X');
  });
});
