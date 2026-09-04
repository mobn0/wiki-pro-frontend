import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ArticleDetail } from './article-detail';
import { AppRoles } from '../../app.roles';
import { Article } from '../../model/article.model';
import { AppAuthService } from '../../service/app.auth.service';
import { ArticleService } from '../../service/article.service';

describe('ArticleDetail', () => {
  const article: Article = {
    id: 5,
    title: 'Angular Setup',
    content: 'Zeile eins\nZeile zwei',
    topic: { id: 10, name: 'Frontend', category: { id: 1, name: 'Technik' } },
  };

  let deleted: number | null;
  const navigated: unknown[][] = [];

  const articleStub = {
    get(id: number): Observable<Article> {
      return of({ ...article, id });
    },
    delete(id: number): Observable<string> {
      deleted = id;
      return of('deleted');
    },
  };

  async function createComponent(role: AppRoles | null): Promise<ComponentFixture<ArticleDetail>> {
    await TestBed.configureTestingModule({
      imports: [ArticleDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '5' })) } },
        { provide: AppAuthService, useValue: { hasRole: (r: string) => r === role } },
        { provide: ArticleService, useValue: articleStub },
        { provide: Router, useValue: { navigate: (cmd: unknown[]) => navigated.push(cmd) } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    deleted = null;
    navigated.length = 0;
    TestBed.resetTestingModule();
  });

  it('renders the article with its breadcrumb', async () => {
    const fixture = await createComponent(AppRoles.Read);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Angular Setup');
    expect(text).toContain('Technik');
    expect(text).toContain('Frontend');
  });

  it('hides edit/delete controls from a viewer', async () => {
    const fixture = await createComponent(AppRoles.Read);
    expect(fixture.nativeElement.textContent).not.toContain('Bearbeiten');
    expect(fixture.nativeElement.textContent).not.toContain('Löschen');
  });

  it('lets an editor delete and returns to the topic', async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    try {
      const fixture = await createComponent(AppRoles.Update);
      expect(fixture.nativeElement.textContent).toContain('Bearbeiten');

      (fixture.componentInstance as unknown as { remove(): void }).remove();
      expect(deleted).toBe(5);
      expect(navigated).toContainEqual(['/topics', 10]);
    } finally {
      window.confirm = originalConfirm;
    }
  });
});
