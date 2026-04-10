import { Injectable } from '@angular/core';
import { HttpClient}  from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class EmployeService {

  baseUrl = 'https://localhost:7282/api';

  constructor(private http: HttpClient) {}

// addEmployee(data: any) {
//   return this.http.post(`https://localhost:7282/api/Employe/InsertEmploye`, data, {
//     responseType: 'text' as 'json'
//   });
// }
addEmployee(data: any) {
  return this.http.post<any>(
    'https://localhost:7282/api/Employe/InsertEmploye',
    data
  );
}
getEmployees() {
  return this.http.get<any[]>(`${this.baseUrl}/Employe/GetEmploye`);
}

 
getDepartments() {
  return this.http.get<any[]>('https://localhost:7282/api/Employe/GetDepartments');
}

 getProofs() {
    return this.http.get<any[]>(`https://localhost:7282/api/Employe/GetProof`);
  }
}

