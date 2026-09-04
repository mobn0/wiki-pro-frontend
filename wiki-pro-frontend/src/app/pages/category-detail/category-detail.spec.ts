import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { CategoryDetail } from './category-detail';
import { AppRoles } from '../../app.roles';
import { Category } from '../../model/category.model';
import { Topic } from '../../model/topic.model';
import { Article } from '../../model/article.model';
import { AppAuthService } from '../../service/app.auth.service';
import { ArticleService } from '../../service/article.service';
import { CategoryService } from '../../service/category.service';
import { TopicService } from '../../service/topic.service';

describe('CategoryDetail', () => {
  const technik: Category = { id: 1, name: 'Technik' };
  const created: { name?: string; categoryId?: number } = {};

  const categoryStub = {
    get(id: number): Observable<Category> {
      return of({ id, name: 'Technik' });
    },
  };

  const topicStub = {
    getAll(): Observable<Topic[]> {
      return of([
        { id: 10, name: 'Frontend', category: technik },
        { id: 11, name: 'Backend', category: technik },
        { id: 20, name: 'Fremd', category: { id: 2, name: 'Andere' } },
      ]);
    },
    create(name: string, category: Category): Observable<Topic> {
      created.name = name;
      created.categoryId = category.id;
      return of({ id: 99, name, category });
    },
    update(topic: Topic): Observable<Topic> {
      return of(topic);
    },
    delete(): Observable<string> {
      return of('deleted');
    },
  };

  const articleStub = {
    getAll(): Observable<Article[]> {
      return of([
        { id: 1, title: 'A', content: '', topic: { id: 10, name: 'Frontend', category: technik } },
        { id: 2, title: 'B', content: '', topic: { id: 10, name: 'Frontend', category: technik } },
      ]);
    },
  };

  async function createComponent(role: AppRoles | null): Promise<ComponentFixture<CategoryDetail>> {
    const authStub = { hasRole: (r: string) => r === role };

    await TestBed.configureTestingModule({
      imports: [CategoryDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: AppAuthService, useValue: authStub },
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

  beforeEach(() => {
    delete created.name;
    delete created.categoryId;
    TestBed.resetTestingModule();
  });

  it('shows the category name in the heading', async () => {
    const fixture = await createComponent(AppRoles.Admin);
    expect(fixture.nativeElement.textContent).toContain('Technik – Themen');
  });

  it('lists only the topics of this category with their article counts', async () => {
    const fixture = await createComponent(AppRoles.Admin);
    const rows = fixture.nativeElement.querySelectorAll('tr[mat-row]');

    expect(rows.length).toBe(2);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Frontend');
    expect(text).toContain('Backend');
    expect(text).not.toContain('Fremd');
    expect(rows[1].textContent).toContain('2'); // Frontend has 2 articles
  });

  it('lets an admin create a topic for the current category', async () => {
    const fixture = await createComponent(AppRoles.Admin);
    const component = fixture.componentInstance as unknown as {
      newName: { setValue(v: string): void };
      add(): void;
    };

    expect(fixture.nativeElement.querySelector('form.detail__new')).toBeTruthy();

    component.newName.setValue('Routing');
    component.add();
    await fixture.whenStable();

    expect(created.name).toBe('Routing');
    expect(created.categoryId).toBe(1);
  });

  it('hides all management controls from a viewer', async () => {
    const fixture = await createComponent(AppRoles.Read);
    const component = fixture.componentInstance as unknown as {
      newName: { setValue(v: string): void };
      add(): void;
    };

    // No create form, no per-row action buttons, no "Aktionen" column.
    expect(fixture.nativeElement.querySelector('form.detail__new')).toBeNull();
    expect(fixture.nativeElement.querySelector('button[aria-label="Bearbeiten"]')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Aktionen');
    expect(fixture.nativeElement.textContent).toContain('Frontend');

    // Even if add() is invoked directly it is a no-op for a viewer.
    component.newName.setValue('Routing');
    component.add();
    await fixture.whenStable();
    expect(created.name).toBeUndefined();
  });
});
