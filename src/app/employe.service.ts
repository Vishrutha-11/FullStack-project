import { Injectable } from '@angular/core';
import { HttpClient}  from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class EmployeService {
apiurl='https://localhost:7282/api/Employe';
  constructor() { }


}
