import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Home } from './home';
import { CategoryService } from '../../service/category.service';
import { TopicService } from '../../service/topic.service';

describe('Home', () => {
  const categoryStub = {
    getAll: () =>
      of([
        { id: 1, name: 'Technik' },
        { id: 2, name: 'Prozesse' },
      ]),
  };
  const topicStub = {
    getAll: () =>
      of([
        { id: 10, name: 'Frontend', category: { id: 1, name: 'Technik' } },
        { id: 11, name: 'Backend', category: { id: 1, name: 'Technik' } },
      ]),
  };

  async function createComponent(): Promise<ComponentFixture<Home>> {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        { provide: CategoryService, useValue: categoryStub },
        { provide: TopicService, useValue: topicStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    const fixture = await createComponent();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('shows each category with its topic count', async () => {
    const fixture = await createComponent();
    const text: string = fixture.nativeElement.textContent;

    expect(text).toContain('Technik');
    expect(text).toContain('2 Themen');
    expect(text).toContain('Prozesse');
    expect(text).toContain('0 Themen');
  });

  it('links each category card to its detail page', async () => {
    const fixture = await createComponent();
    const links = fixture.nativeElement.querySelectorAll('a[mat-list-item]');

    expect(links.length).toBe(2);
    expect(links[0].getAttribute('href')).toBe('/categories/2');
    expect(links[1].getAttribute('href')).toBe('/categories/1');
  });
});
