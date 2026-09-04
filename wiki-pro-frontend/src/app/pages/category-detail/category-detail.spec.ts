import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { CategoryDetail } from './category-detail';
import { AppRoles } from '../../app.roles';
import { Article } from '../../model/article.model';
import { Category } from '../../model/category.model';
import { Topic } from '../../model/topic.model';
import { AppAuthService } from '../../service/app.auth.service';
import { ArticleService } from '../../service/article.service';
import { CategoryService } from '../../service/category.service';
import { TopicService } from '../../service/topic.service';

interface TopicRow {
  id: number;
  name: string;
  articleCount: number;
}

/** Shape of the (protected) component members exercised by the tests. */
interface Internals {
  category: () => Category | null;
  topics: () => TopicRow[];
  loading: () => boolean;
  error: () => string | null;
  editingId: () => number | null;
  heading: () => string;
  crumbs: () => { label: string; link?: unknown }[];
  newName: FormControl<string>;
  editName: FormControl<string>;
  load(): void;
  add(): void;
  startEdit(topic: TopicRow): void;
  cancelEdit(): void;
  saveEdit(topic: TopicRow): void;
  remove(topic: TopicRow): void;
}

const TECHNIK: Category = { id: 1, name: 'Technik' };
const ANDERE: Category = { id: 2, name: 'Andere' };

const topicOf = (id: number, name: string, category: Category = TECHNIK): Topic => ({
  id,
  name,
  category,
});

describe('CategoryDetail', () => {
  let paramMap$: BehaviorSubject<ParamMap>;

  let categoryResponse: (id: number) => Observable<Category>;
  let topicsResponse: () => Observable<Topic[]>;
  let articlesResponse: () => Observable<Article[]>;
  let createResponse: () => Observable<Topic>;
  let updateResponse: (topic: Topic) => Observable<Topic>;
  let deleteResponse: () => Observable<string>;

  let createCalls: { name: string; category: Category }[];
  let updateCalls: Topic[];
  let deleteCalls: number[];
  let getAllCalls: number;
  let confirmMessages: string[];
  let confirmResult: boolean;
  let originalConfirm: typeof window.confirm;

  const categoryStub = { get: (id: number) => categoryResponse(id) };
  const topicStub = {
    getAll: () => {
      getAllCalls += 1;
      return topicsResponse();
    },
    create: (name: string, category: Category) => {
      createCalls.push({ name, category });
      return createResponse();
    },
    update: (topic: Topic) => {
      updateCalls.push(topic);
      return updateResponse(topic);
    },
    delete: (id: number) => {
      deleteCalls.push(id);
      return deleteResponse();
    },
  };
  const articleStub = { getAll: () => articlesResponse() };

  function defaultTopics(): Topic[] {
    return [
      topicOf(11, 'Backend'),
      topicOf(10, 'Frontend'),
      topicOf(12, 'Deployment'),
      topicOf(20, 'Fremd', ANDERE),
      { id: 21, name: 'Ohne Kategorie', category: undefined as unknown as Category },
    ];
  }

  function defaultArticles(): Article[] {
    return [
      { id: 1, title: 'A', content: '', topic: topicOf(10, 'Frontend') },
      { id: 2, title: 'B', content: '', topic: topicOf(10, 'Frontend') },
      { id: 3, title: 'C', content: '', topic: topicOf(11, 'Backend') },
      { id: 4, title: 'D', content: '', topic: undefined as unknown as Topic },
    ];
  }

  async function setup(
    role: AppRoles | null = AppRoles.Admin,
  ): Promise<ComponentFixture<CategoryDetail>> {
    await TestBed.configureTestingModule({
      imports: [CategoryDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$ } },
        { provide: AppAuthService, useValue: { hasRole: (r: string) => r === role } },
        { provide: CategoryService, useValue: categoryStub },
        { provide: TopicService, useValue: topicStub },
        { provide: ArticleService, useValue: articleStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoryDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  const api = (fixture: ComponentFixture<CategoryDetail>) =>
    fixture.componentInstance as unknown as Internals;

  const rowByName = (fixture: ComponentFixture<CategoryDetail>, name: string): TopicRow =>
    api(fixture)
      .topics()
      .find((topic) => topic.name === name)!;

  beforeEach(() => {
    paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ id: '1' }));

    categoryResponse = (id: number) => of(id === 2 ? ANDERE : TECHNIK);
    topicsResponse = () => of(defaultTopics());
    articlesResponse = () => of(defaultArticles());
    createResponse = () => of(topicOf(99, 'Neu'));
    updateResponse = (topic: Topic) => of(topic);
    deleteResponse = () => of('deleted');

    createCalls = [];
    updateCalls = [];
    deleteCalls = [];
    getAllCalls = 0;
    confirmMessages = [];
    confirmResult = true;
    originalConfirm = window.confirm;
    window.confirm = (message?: string) => {
      confirmMessages.push(message ?? '');
      return confirmResult;
    };

    TestBed.resetTestingModule();
  });

  afterEach(() => {
    window.confirm = originalConfirm;
  });

  // --------------------------------------------------------------- load()
  describe('load()', () => {
    it('loads the category and puts its name into the heading', async () => {
      const fixture = await setup();
      expect(api(fixture).category()?.name).toBe('Technik');
      expect(api(fixture).heading()).toBe('Technik – Themen');
      expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Technik – Themen');
    });

    it('keeps only the topics whose category matches the route id, sorted by name', async () => {
      const fixture = await setup();
      expect(
        api(fixture)
          .topics()
          .map((topic) => topic.name),
      ).toEqual(['Backend', 'Deployment', 'Frontend']);
    });

    it('counts articles per topic and ignores articles without a topic', async () => {
      const fixture = await setup();
      const byName = Object.fromEntries(
        api(fixture)
          .topics()
          .map((topic) => [topic.name, topic.articleCount]),
      );
      expect(byName).toEqual({ Backend: 1, Deployment: 0, Frontend: 2 });
    });

    it('clears the loading flag and hides the progress bar once data arrives', async () => {
      const fixture = await setup();
      expect(api(fixture).loading()).toBe(false);
      expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeNull();
    });

    it('stays in the loading state while a request is pending', async () => {
      categoryResponse = () => new Subject<Category>();
      const fixture = await setup();
      expect(api(fixture).loading()).toBe(true);
      expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
      expect(fixture.nativeElement.textContent).not.toContain('Noch keine Themen');
    });

    it('shows an error message when loading fails', async () => {
      topicsResponse = () => throwError(() => new Error('boom'));
      const fixture = await setup();
      expect(api(fixture).error()).toBe('Themen konnten nicht geladen werden.');
      expect(api(fixture).loading()).toBe(false);
      expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain(
        'Themen konnten nicht geladen werden.',
      );
    });

    it('reloads with the new id when the route parameter changes', async () => {
      const fixture = await setup();
      expect(
        api(fixture)
          .topics()
          .map((topic) => topic.name),
      ).toEqual(['Backend', 'Deployment', 'Frontend']);

      paramMap$.next(convertToParamMap({ id: '2' }));
      await fixture.whenStable();
      fixture.detectChanges();

      expect(api(fixture).category()?.name).toBe('Andere');
      expect(api(fixture).heading()).toBe('Andere – Themen');
      expect(
        api(fixture)
          .topics()
          .map((topic) => topic.name),
      ).toEqual(['Fremd']);
    });
  });

  // ----------------------------------------------------- heading & crumbs
  describe('heading & crumbs', () => {
    it('falls back to "Themen" before the category is known', async () => {
      categoryResponse = () => new Subject<Category>();
      const fixture = await setup();
      expect(api(fixture).heading()).toBe('Themen');
    });

    it('builds the admin trail Home › Kategorien › {name}', async () => {
      const fixture = await setup(AppRoles.Admin);
      expect(api(fixture).crumbs()).toEqual([
        { label: 'Home', link: '/' },
        { label: 'Kategorien', link: '/categories' },
        { label: 'Technik' },
      ]);
    });

    it('omits the Kategorien crumb for a non-admin', async () => {
      const fixture = await setup(AppRoles.Read);
      expect(api(fixture).crumbs()).toEqual([{ label: 'Home', link: '/' }, { label: 'Technik' }]);
      expect(fixture.nativeElement.querySelector('app-breadcrumb').textContent).not.toContain(
        'Kategorien',
      );
    });

    it('has no category crumb until the category is loaded', async () => {
      categoryResponse = () => new Subject<Category>();
      const fixture = await setup(AppRoles.Admin);
      expect(api(fixture).crumbs()).toEqual([
        { label: 'Home', link: '/' },
        { label: 'Kategorien', link: '/categories' },
      ]);
    });
  });

  // ------------------------------------------------------------------ add()
  describe('add()', () => {
    it('creates the topic, clears the field and reloads on success', async () => {
      const fixture = await setup(AppRoles.Admin);
      const before = getAllCalls;
      api(fixture).newName.setValue('  Routing  ');
      api(fixture).add();
      await fixture.whenStable();

      expect(createCalls).toEqual([{ name: 'Routing', category: TECHNIK }]);
      expect(api(fixture).newName.value).toBe('');
      expect(getAllCalls).toBe(before + 1);
    });

    it('shows an error and stops loading when creation fails', async () => {
      createResponse = () => throwError(() => new Error('nope'));
      const fixture = await setup(AppRoles.Admin);
      api(fixture).newName.setValue('Routing');
      api(fixture).add();
      await fixture.whenStable();

      expect(api(fixture).error()).toBe('Thema konnte nicht erstellt werden.');
      expect(api(fixture).loading()).toBe(false);
    });

    it('does nothing and marks the field touched when the name is empty', async () => {
      const fixture = await setup(AppRoles.Admin);
      api(fixture).newName.setValue('');
      api(fixture).add();
      expect(createCalls).toEqual([]);
      expect(api(fixture).newName.touched).toBe(true);
    });

    it('does nothing when the name is only whitespace', async () => {
      const fixture = await setup(AppRoles.Admin);
      api(fixture).newName.setValue('   ');
      api(fixture).add();
      expect(createCalls).toEqual([]);
      expect(api(fixture).loading()).toBe(false);
    });

    it('is a no-op for a non-admin even when invoked directly', async () => {
      const fixture = await setup(AppRoles.Read);
      api(fixture).newName.setValue('Routing');
      api(fixture).add();
      expect(createCalls).toEqual([]);
    });
  });

  // -------------------------------------------------- startEdit / cancelEdit
  describe('startEdit() / cancelEdit()', () => {
    it('startEdit switches the row to an input pre-filled with the current name', async () => {
      const fixture = await setup(AppRoles.Admin);
      const row = rowByName(fixture, 'Frontend');
      api(fixture).startEdit(row);
      fixture.detectChanges();

      expect(api(fixture).editingId()).toBe(row.id);
      expect(api(fixture).editName.value).toBe('Frontend');
      expect(fixture.nativeElement.querySelectorAll('mat-list-item input[matInput]').length).toBe(
        1,
      );
      expect(fixture.nativeElement.querySelector('button[aria-label="Speichern"]')).toBeTruthy();

      const editingRow = Array.from(fixture.nativeElement.querySelectorAll('mat-list-item')).find(
        (el) => (el as HTMLElement).querySelector('input'),
      ) as HTMLElement;
      expect(editingRow.textContent).not.toContain('Artikel'); // count line hidden while editing
    });

    it('cancelEdit leaves edit mode', async () => {
      const fixture = await setup(AppRoles.Admin);
      api(fixture).startEdit(rowByName(fixture, 'Backend'));
      api(fixture).cancelEdit();
      expect(api(fixture).editingId()).toBeNull();
    });
  });

  // ------------------------------------------------------------- saveEdit()
  describe('saveEdit()', () => {
    it('updates the topic, leaves edit mode and reloads on success', async () => {
      const fixture = await setup(AppRoles.Admin);
      const row = rowByName(fixture, 'Frontend');
      const before = getAllCalls;
      api(fixture).startEdit(row);
      api(fixture).editName.setValue('  Frontend Neu  ');
      api(fixture).saveEdit(row);
      await fixture.whenStable();

      expect(updateCalls).toEqual([{ id: row.id, name: 'Frontend Neu', category: TECHNIK }]);
      expect(api(fixture).editingId()).toBeNull();
      expect(getAllCalls).toBe(before + 1);
    });

    it('shows an error when the update fails', async () => {
      updateResponse = () => throwError(() => new Error('nope'));
      const fixture = await setup(AppRoles.Admin);
      const row = rowByName(fixture, 'Frontend');
      api(fixture).startEdit(row);
      api(fixture).editName.setValue('Anders');
      api(fixture).saveEdit(row);
      await fixture.whenStable();

      expect(api(fixture).error()).toBe('Thema konnte nicht gespeichert werden.');
      expect(api(fixture).loading()).toBe(false);
    });

    it('cancels without calling the service when the name is unchanged', async () => {
      const fixture = await setup(AppRoles.Admin);
      const row = rowByName(fixture, 'Frontend');
      api(fixture).startEdit(row);
      api(fixture).saveEdit(row);
      expect(updateCalls).toEqual([]);
      expect(api(fixture).editingId()).toBeNull();
    });

    it('cancels when the trimmed name is empty', async () => {
      const fixture = await setup(AppRoles.Admin);
      const row = rowByName(fixture, 'Frontend');
      api(fixture).startEdit(row);
      api(fixture).editName.setValue('   ');
      api(fixture).saveEdit(row);
      expect(updateCalls).toEqual([]);
      expect(api(fixture).editingId()).toBeNull();
    });

    it('marks the field touched and stays in edit mode when the name is invalid', async () => {
      const fixture = await setup(AppRoles.Admin);
      const row = rowByName(fixture, 'Frontend');
      api(fixture).startEdit(row);
      api(fixture).editName.setValue('');
      api(fixture).saveEdit(row);
      expect(updateCalls).toEqual([]);
      expect(api(fixture).editName.touched).toBe(true);
      expect(api(fixture).editingId()).toBe(row.id);
    });

    it('is a no-op for a non-admin', async () => {
      const fixture = await setup(AppRoles.Read);
      const row = api(fixture).topics()[0];
      api(fixture).editName.setValue('Anders');
      api(fixture).saveEdit(row);
      expect(updateCalls).toEqual([]);
    });
  });

  // -------------------------------------------------------------- remove()
  describe('remove()', () => {
    it('confirms, deletes and reloads when accepted', async () => {
      confirmResult = true;
      const fixture = await setup(AppRoles.Admin);
      const row = rowByName(fixture, 'Backend');
      const before = getAllCalls;
      api(fixture).remove(row);
      await fixture.whenStable();

      expect(confirmMessages[0]).toContain('Backend');
      expect(deleteCalls).toEqual([row.id]);
      expect(getAllCalls).toBe(before + 1);
    });

    it('does not delete when the confirmation is declined', async () => {
      confirmResult = false;
      const fixture = await setup(AppRoles.Admin);
      api(fixture).remove(api(fixture).topics()[0]);
      expect(deleteCalls).toEqual([]);
    });

    it('shows an error when the delete fails', async () => {
      deleteResponse = () => throwError(() => new Error('nope'));
      const fixture = await setup(AppRoles.Admin);
      api(fixture).remove(api(fixture).topics()[0]);
      await fixture.whenStable();
      expect(api(fixture).error()).toBe('Thema konnte nicht gelöscht werden.');
      expect(api(fixture).loading()).toBe(false);
    });

    it('is a no-op for a non-admin and never opens a confirm dialog', async () => {
      const fixture = await setup(AppRoles.Read);
      api(fixture).remove(api(fixture).topics()[0]);
      expect(confirmMessages).toEqual([]);
      expect(deleteCalls).toEqual([]);
    });
  });

  // --------------------------------------------------- role-dependent view
  describe('rendering', () => {
    it('renders one linked list row per topic with its article count', async () => {
      const fixture = await setup(AppRoles.Read);
      const rows = fixture.nativeElement.querySelectorAll('mat-list-item');
      expect(rows.length).toBe(3);
      expect(rows[0].textContent).toContain('Backend');
      expect(rows[0].textContent).toContain('1 Artikel');
      expect(rows[1].textContent).toContain('Deployment');
      expect(rows[1].textContent).toContain('0 Artikel');
      expect(rows[2].textContent).toContain('Frontend');
      expect(rows[2].textContent).toContain('2 Artikel');
      expect(fixture.nativeElement.querySelector('a[href="/topics/10"]').textContent).toContain(
        'Frontend',
      );
    });

    it('shows the admin management controls (add form + per-row actions)', async () => {
      const fixture = await setup(AppRoles.Admin);
      expect(fixture.nativeElement.querySelector('app-inline-add')).toBeTruthy();
      expect(fixture.nativeElement.querySelectorAll('button[aria-label="Bearbeiten"]').length).toBe(
        3,
      );
      expect(fixture.nativeElement.querySelectorAll('button[aria-label="Löschen"]').length).toBe(3);
    });

    it('hides every management control from a viewer', async () => {
      const fixture = await setup(AppRoles.Read);
      expect(fixture.nativeElement.querySelector('app-inline-add')).toBeNull();
      expect(fixture.nativeElement.querySelector('button[aria-label="Bearbeiten"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('button[aria-label="Löschen"]')).toBeNull();
    });

    it('shows the empty-state message when the category has no topics', async () => {
      topicsResponse = () => of([]);
      const fixture = await setup(AppRoles.Admin);
      expect(fixture.nativeElement.textContent).toContain('Noch keine Themen in dieser Kategorie.');
      expect(fixture.nativeElement.querySelector('mat-list')).toBeNull();
    });

    it('disables the add button while the page is still loading', async () => {
      categoryResponse = () => new Subject<Category>();
      const fixture = await setup(AppRoles.Admin);
      expect(fixture.nativeElement.querySelector('app-inline-add button').disabled).toBe(true);
    });
  });
});
