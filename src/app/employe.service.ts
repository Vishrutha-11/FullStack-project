import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as AWS from 'aws-sdk';
declare var CryptoJS: any;

@Injectable({
  providedIn: 'root'
})
export class EmployeService {

 baseUrl = 'https://localhost:7282/api';

  constructor(private http: HttpClient) { }

  addEmployee(data: any) {
    return this.http.post(
      this.baseUrl + '/Employe/InsertEmploye',
      data,
      { responseType: 'text' } // ✅
    );
  }
  getEmployees() {
    return this.http.get<any[]>(`${this.baseUrl}/Employe/GetEmploye`);
  }


  getDepartments() {
    return this.http.get<any[]>(`${this.baseUrl}/Employe/GetDepartments`);
  }

  getProofs() {
    return this.http.get<any[]>(`${this.baseUrl}/Employe/GetProof`);
  }

  GetAmazonS3AccessKey() {
    return this.http.get(
      'https://external.balajitransports.in/api/DBConnectionString/GetAmazons3CredentialsS3AccessKey',
      { responseType: 'text' }
    );
  }

  GetAmazonS3SecretKey() {
    return this.http.get(
      'https://external.balajitransports.in/api/DBConnectionString/GetAmazons3CredentialsS3SecretKey',
      { responseType: 'text' }
    );
  }
  // ✅ FIXED
  // getPresignedUrl(fileName: string, contentType: string) {
  //   return this.http.get<any>(
  //     `${this.baseUrl}/S3/GetPresignedUrl`,
  //     {
  //       params: { fileName, contentType }
  //     }
  //   );
  // }

  // ✅ VIEW FILE
  // getViewUrl(fileKey: string) {
  //   return this.http.get(
  //     `${this.baseUrl}/S3/GetFileViewUrl`,
  //     {
  //       params: { fileKey },
  //       responseType: 'text'
  //     }
  //   );
  // }

  updateEmployee(data: any) {
    return this.http.put(
      this.baseUrl + '/Employe/Update',
      data,
      { responseType: 'text' } // ✅ FIX
    );
  }
  deleteEmployee(id: number) {
    return this.http.delete(
      this.baseUrl + '/Employe/Delete/' + id,
      { responseType: 'text' } // ✅ same fix as update
    );
  }

  


}


