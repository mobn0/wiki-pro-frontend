import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Categories } from './categories';
import { Category } from '../../model/category.model';
import { Topic } from '../../model/topic.model';
import { CategoryService } from '../../service/category.service';
import { TopicService } from '../../service/topic.service';

describe('Categories', () => {
  let store: Category[];
  const lastCreated: { name?: string } = {};

  const serviceStub = {
    getAll(): Observable<Category[]> {
      return of(store.map((c) => ({ ...c })));
    },
    create(name: string): Observable<Category> {
      lastCreated.name = name;
      const created = { id: store.length + 1, name };
      store.push(created);
      return of(created);
    },
    update(category: Category): Observable<Category> {
      store = store.map((c) => (c.id === category.id ? { ...category } : c));
      return of(category);
    },
    delete(id: number): Observable<string> {
      store = store.filter((c) => c.id !== id);
      return of('deleted');
    },
  };

  const topicStub = {
    getAll(): Observable<Topic[]> {
      return of([
        { id: 1, name: 'Prozesse', category: { id: 1, name: 'Technik' } },
        { id: 2, name: 'Frontend', category: { id: 1, name: 'Technik' } },
      ]);
    },
  };

  async function createComponent(): Promise<ComponentFixture<Categories>> {
    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [
        provideRouter([]),
        { provide: CategoryService, useValue: serviceStub },
        { provide: TopicService, useValue: topicStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Categories);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    store = [{ id: 1, name: 'Technik' }];
    delete lastCreated.name;
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    const fixture = await createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('lists categories with their topic counts', async () => {
    const fixture = await createComponent();
    const row = fixture.nativeElement.querySelector('mat-list-item');
    expect(row.textContent).toContain('Technik');
    expect(row.textContent).toContain('2 Themen');
  });

  it('creates a category through the service', async () => {
    const fixture = await createComponent();
    const component = fixture.componentInstance as unknown as {
      newName: { setValue(v: string): void };
      add(): void;
    };

    component.newName.setValue('Reisen');
    component.add();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(lastCreated.name).toBe('Reisen');
    expect(fixture.nativeElement.textContent).toContain('Reisen');
  });

  it('deletes a category when the confirm dialog is accepted', async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => true;
    try {
      const fixture = await createComponent();
      const component = fixture.componentInstance as unknown as {
        remove(category: Category): void;
      };

      component.remove({ id: 1, name: 'Technik' });
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Noch keine Kategorien');
    } finally {
      window.confirm = originalConfirm;
    }
  });

  it('keeps a category when the confirm dialog is dismissed', async () => {
    const originalConfirm = window.confirm;
    window.confirm = () => false;
    try {
      const fixture = await createComponent();
      const component = fixture.componentInstance as unknown as {
        remove(category: Category): void;
      };

      component.remove({ id: 1, name: 'Technik' });
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Technik');
    } finally {
      window.confirm = originalConfirm;
    }
  });
});
