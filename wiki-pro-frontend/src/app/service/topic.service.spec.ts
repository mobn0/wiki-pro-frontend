import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TopicService } from './topic.service';

describe('TopicService', () => {
  const base = 'http://localhost:9090/api/topic';
  let service: TopicService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TopicService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TopicService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all topics', () => {
    let result: unknown;
    service.getAll().subscribe((r) => (result = r));

    const req = http.expectOne(base);
    expect(req.request.method).toBe('GET');
    const topics = [{ id: 1, name: 'Frontend', category: { id: 1, name: 'Technik' } }];
    req.flush(topics);

    expect(result).toEqual(topics);
  });
});
