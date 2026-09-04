import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { SearchResults } from './search-results';
import { SearchResult } from '../../model/search-result.model';
import { SearchService } from '../../service/search.service';

describe('SearchResults', () => {
  const technik = { id: 1, name: 'Technik' };
  let lastQuery: string;

  const searchStub = {
    search(query: string): Observable<SearchResult> {
      lastQuery = query;
      return of({
        categories: [],
        topics: [{ id: 10, name: 'Frontend', category: technik }],
        articles: [
          {
            id: 5,
            title: 'Angular Setup',
            content: '',
            topic: { id: 10, name: 'Frontend', category: technik },
          },
        ],
      });
    },
  };

  async function createComponent(query: string): Promise<ComponentFixture<SearchResults>> {
    await TestBed.configureTestingModule({
      imports: [SearchResults],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(convertToParamMap({ query })) },
        },
        { provide: SearchService, useValue: searchStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SearchResults);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    lastQuery = '';
    TestBed.resetTestingModule();
  });

  it('renders grouped results for the query', async () => {
    const fixture = await createComponent('angular');
    const text = fixture.nativeElement.textContent;

    expect(lastQuery).toBe('angular');
    expect(text).toContain('Suchergebnisse für "angular"');
    expect(text).toContain('Themen (1)');
    expect(text).toContain('Artikel (1)');
    expect(text).toContain('Angular Setup');
  });
});
