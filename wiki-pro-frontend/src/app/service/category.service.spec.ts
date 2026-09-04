import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CategoryService } from './category.service';

describe('CategoryService', () => {
  const base = 'http://localhost:9090/api/category';
  let service: CategoryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CategoryService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all categories', () => {
    let result: unknown;
    service.getAll().subscribe((r) => (result = r));

    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, name: 'Technik' }]);

    expect(result).toEqual([{ id: 1, name: 'Technik' }]);
  });

  it('creates a category with a name-only payload', () => {
    service.create('Reisen').subscribe();

    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Reisen' });
    req.flush({ id: 5, name: 'Reisen' });
  });

  it('updates a category via PUT with id and name', () => {
    service.update({ id: 4, name: 'Neuer Name' }).subscribe();

    const req = http.expectOne(base);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: 4, name: 'Neuer Name' });
    req.flush({ id: 4, name: 'Neuer Name' });
  });

  it('deletes a category by id', () => {
    service.delete(7).subscribe();

    const req = http.expectOne(`${base}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush('Deleted category: X');
  });
});
