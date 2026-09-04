import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { Categories } from './categories';
import { Category } from '../../model/category.model';
import { CategoryService } from '../../service/category.service';

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

  async function createComponent(): Promise<ComponentFixture<Categories>> {
    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [{ provide: CategoryService, useValue: serviceStub }],
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

  it('lists categories returned by the service', async () => {
    const fixture = await createComponent();
    expect(fixture.nativeElement.textContent).toContain('Technik');
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
