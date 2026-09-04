import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TopicService } from './topic.service';

describe('TopicService', () => {
  const base = 'http://localhost:9090/api/topic';
  const category = { id: 1, name: 'Technik' };
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
    const topics = [{ id: 1, name: 'Frontend', category }];
    req.flush(topics);

    expect(result).toEqual(topics);
  });

  it('creates a topic with a name and category payload', () => {
    service.create('Frontend', category).subscribe();

    const req = http.expectOne(base);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Frontend', category });
    req.flush({ id: 5, name: 'Frontend', category });
  });

  it('updates a topic via PUT', () => {
    service.update({ id: 4, name: 'Neuer Name', category }).subscribe();

    const req = http.expectOne(base);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ id: 4, name: 'Neuer Name', category });
    req.flush({ id: 4, name: 'Neuer Name', category });
  });

  it('deletes a topic by id', () => {
    service.delete(7).subscribe();

    const req = http.expectOne(`${base}/7`);
    expect(req.request.method).toBe('DELETE');
    req.flush('Deleted topic: X');
  });
});
