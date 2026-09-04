import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { TopicDetail } from './topic-detail';
import { AppRoles } from '../../app.roles';
import { Article } from '../../model/article.model';
import { Topic } from '../../model/topic.model';
import { AppAuthService } from '../../service/app.auth.service';
import { ArticleService } from '../../service/article.service';
import { TopicService } from '../../service/topic.service';

describe('TopicDetail', () => {
  const technik = { id: 1, name: 'Technik' };
  const frontend: Topic = { id: 10, name: 'Frontend', category: technik };

  const topicStub = {
    get(id: number): Observable<Topic> {
      return of({ ...frontend, id });
    },
  };
  const articleStub = {
    getAll(): Observable<Article[]> {
      return of([
        { id: 1, title: 'Angular Setup', content: 'Erste Schritte mit Angular', topic: frontend },
        { id: 2, title: 'Routing Guide', content: 'URL-Mapping', topic: frontend },
        {
          id: 3,
          title: 'Fremd',
          content: '',
          topic: { id: 99, name: 'Andere', category: technik },
        },
      ]);
    },
  };

  async function createComponent(role: AppRoles | null): Promise<ComponentFixture<TopicDetail>> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TopicDetail],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '10' })) } },
        { provide: AppAuthService, useValue: { hasRole: (r: string) => r === role } },
        { provide: TopicService, useValue: topicStub },
        { provide: ArticleService, useValue: articleStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(TopicDetail);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('lists only the articles that belong to the topic', async () => {
    const fixture = await createComponent(AppRoles.Read);
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Frontend – Artikel');
    expect(text).toContain('Angular Setup');
    expect(text).toContain('Routing Guide');
    expect(text).not.toContain('Fremd');
  });

  it('offers "Neuer Artikel" to an editor but not to a viewer', async () => {
    const editor = await createComponent(AppRoles.Update);
    expect(editor.nativeElement.textContent).toContain('Neuer Artikel');

    const viewer = await createComponent(AppRoles.Read);
    expect(viewer.nativeElement.textContent).not.toContain('Neuer Artikel');
  });
});
