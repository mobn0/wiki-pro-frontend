import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SearchResult } from '../model/search-result.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.backendBaseUrl}search`;

  search(query: string): Observable<SearchResult> {
    return this.http.get<SearchResult>(`${this.baseUrl}/${encodeURIComponent(query)}`);
  }
}
