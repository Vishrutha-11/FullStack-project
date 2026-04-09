import { Injectable } from '@angular/core';
import { HttpClient}  from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class EmployeService {

  baseUrl = 'https://localhost:7282/api';

  constructor(private http: HttpClient) {}

addEmployee(data: any) {
  return this.http.post(`${this.baseUrl}/Employe/Insert`, data, {
    responseType: 'text' as 'json'
  });
}

getEmployees() {
  return this.http.get<any[]>(`${this.baseUrl}/Employe/GetAll`);
}

  
}

