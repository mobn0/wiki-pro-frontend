import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Topic } from '../model/topic.model';

@Injectable({ providedIn: 'root' })
export class TopicService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}topic`;

  getAll(): Observable<Topic[]> {
    return this.http.get<Topic[]>(this.baseUrl);
  }
}
