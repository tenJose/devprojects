import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PostulacionService {
  private API_BASE_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  createPostulacion(data: any): Observable<any> {
    return this.http.post(`${this.API_BASE_URL}/postulaciones`, data);
  }
}
