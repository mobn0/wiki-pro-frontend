import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Article } from '../model/article.model';

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}article`;

  getAll(): Observable<Article[]> {
    return this.http.get<Article[]>(this.baseUrl);
  }
}
