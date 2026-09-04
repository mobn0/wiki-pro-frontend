import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  const base = 'http://localhost:9090/api/search';
  let service: SearchService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SearchService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('queries the search endpoint with an encoded query', () => {
    let result: unknown;
    service.search('angular setup').subscribe((r) => (result = r));

    const req = http.expectOne(`${base}/angular%20setup`);
    expect(req.request.method).toBe('GET');
    const payload = { topics: [], articles: [], categories: [] };
    req.flush(payload);

    expect(result).toEqual(payload);
  });
});
