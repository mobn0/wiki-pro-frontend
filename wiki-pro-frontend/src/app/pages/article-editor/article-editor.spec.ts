import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ArticleEditor } from './article-editor';
import { Article, ArticleDraft } from '../../model/article.model';
import { Topic } from '../../model/topic.model';
import { ArticleService } from '../../service/article.service';
import { TopicService } from '../../service/topic.service';

describe('ArticleEditor', () => {
  const technik = { id: 1, name: 'Technik' };
  const topics: Topic[] = [
    { id: 10, name: 'Frontend', category: technik },
    { id: 11, name: 'Backend', category: technik },
  ];

  let created: ArticleDraft | null;
  let updated: Article | null;
  const navigated: unknown[][] = [];

  const topicStub = { getAll: (): Observable<Topic[]> => of(topics) };
  const articleStub = {
    get: (id: number): Observable<Article> =>
      of({ id, title: 'Bestehend', content: 'Alt', topic: topics[0] }),
    create: (article: ArticleDraft): Observable<Article> => {
      created = article;
      return of({ id: 99, ...article });
    },
    update: (article: Article): Observable<Article> => {
      updated = article;
      return of(article);
    },
  };

  async function createComponent(
    params: Record<string, string>,
    query: Record<string, string>,
  ): Promise<ComponentFixture<ArticleEditor>> {
    await TestBed.configureTestingModule({
      imports: [ArticleEditor],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap(params),
              queryParamMap: convertToParamMap(query),
            },
          },
        },
        { provide: Router, useValue: { navigate: (cmd: unknown[]) => navigated.push(cmd) } },
        { provide: TopicService, useValue: topicStub },
        { provide: ArticleService, useValue: articleStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(ArticleEditor);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    created = null;
    updated = null;
    navigated.length = 0;
    TestBed.resetTestingModule();
  });

  it('preselects the topic from the query param in create mode', async () => {
    const fixture = await createComponent({}, { topic: '11' });
    const form = fixture.componentInstance as unknown as {
      form: { controls: { topicId: { value: number | null } } };
    };
    expect(form.form.controls.topicId.value).toBe(11);
    expect(fixture.nativeElement.textContent).toContain('Neuer Artikel');
  });

  it('does not submit an invalid (empty) form', async () => {
    const fixture = await createComponent({}, {});
    (fixture.componentInstance as unknown as { save(): void }).save();
    expect(created).toBeNull();
  });

  it('creates an article and navigates to its detail page', async () => {
    const fixture = await createComponent({}, { topic: '10' });
    const component = fixture.componentInstance as unknown as {
      form: {
        controls: { title: { setValue(v: string): void }; content: { setValue(v: string): void } };
      };
      save(): void;
    };
    component.form.controls.title.setValue('  Neuer Titel  ');
    component.form.controls.content.setValue('Inhalt');
    component.save();

    expect(created).toEqual({ title: 'Neuer Titel', content: 'Inhalt', topic: topics[0] });
    expect(navigated).toContainEqual(['/articles', 99]);
  });

  it('loads an existing article in edit mode and updates it', async () => {
    const fixture = await createComponent({ id: '5' }, {});
    expect(fixture.nativeElement.textContent).toContain('Artikel bearbeiten');

    (fixture.componentInstance as unknown as { save(): void }).save();
    expect(updated).toEqual({
      id: 5,
      title: 'Bestehend',
      content: 'Alt',
      topic: topics[0],
    });
    expect(navigated).toContainEqual(['/articles', 5]);
  });
});
