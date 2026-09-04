import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category } from '../model/category.model';
import { Topic } from '../model/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}topic`;

  getAll(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.baseUrl);
  }

  get(id: number): Observable<Topic> {
    return this.http.get<Topic>(`${this.baseUrl}/${id}`);
  }

  create(name: string, category: Category): Observable<Topic> {
    return this.http.post<Topic>(this.baseUrl, { name, category });
  }

  update(topic: Topic): Observable<Topic> {
    return this.http.put<Topic>(this.baseUrl, topic);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' });
  }
}
