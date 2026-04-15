import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeService } from '../employe.service';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-employeform',
  templateUrl: './employeform.component.html',
  styleUrls: ['./employeform.component.css']
})
export class EmployeformComponent implements OnInit {

  selectedProofIds: number[] = [];
  employees: any[] = [];
  proofList: any[] = [];
  selectedFiles: File[] = [];

  isSubmitting: boolean = false; // ✅ prevent double submit

  employee: any = {
    empId: '',
    name: '',
    phoneNumber: '',
    deptId: '',
    address: '',
    gender: '',
    groupId: '',
    proofIds: []
  };
uploadedUrls: string[] = [];
  departments: any[] = [];

  awsAccessKey: any;
  awsSecretKey: any;
  awsBucketName = "btsworkerfiles"; // ✅ FIXED

  constructor(private employeService: EmployeService, private http: HttpClient) { }

  ngOnInit() {
    
    this.loadEmployees();
    this.getDepartments();
    this.getProofs();

    // Load ACCESS Key
    this.employeService.GetAmazonS3AccessKey().subscribe(res => {
      console.log("Encrypted Access Key:", res);
      this.awsAccessKey = this.decrypt(res);
      console.log("Decrypted Access Key:", this.awsAccessKey);
    });

    // Load SECRET Key
    this.employeService.GetAmazonS3SecretKey().subscribe(res => {
      console.log("Encrypted Secret Key:", res);
      this.awsSecretKey = this.decrypt(res);
      console.log("Decrypted Secret Key:", this.awsSecretKey);
    });
    
  }
uploadToS3(file: File, presignedUrl: string): Observable<any> {

  return this.http.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type
    }
  });
}

async uploadFile(file: File) {

  const res: any = await this.http
    .get(`https://localhost:7282/api/S3/GetPresignedUrl?fileName=${file.name}`)
    .toPromise();

  const url = res.url;

  await this.uploadToS3(file, url).toPromise();

  console.log("Uploaded successfully:", url);

  // REMOVE query string → store clean S3 URL
  const cleanUrl = url.split('?')[0];

  this.uploadedUrls.push(cleanUrl);
}
async onFileSelected(event: any) {

  const files = event.target.files;

  if (!files || files.length === 0) return;

  this.selectedFiles = [];

  const uploadPromises: Promise<any>[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    this.selectedFiles.push(file);

    uploadPromises.push(this.uploadFile(file)); // no await here
  }

  await Promise.all(uploadPromises);

  console.log("All files uploaded 🚀");
}
  // Decrypts an AES-encrypted string and returns the original text
  decrypt(encryptedText: string): string {
  const key = CryptoJS.enc.Utf8.parse('NLKpQsoPaeoZ55ul');  // Secret key
  const iv = CryptoJS.enc.Utf8.parse('RbeqxtNXxucHI123');   // Initialization Vector
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);  // Plain text
}

  // ✅ LOAD EMPLOYEES
  loadEmployees() {
    this.employeService.getEmployees().subscribe((res: any) => {
      this.employees = res;
    });
  }

  // ✅ DEPARTMENTS
  getDepartments() {
    this.employeService.getDepartments().subscribe((res: any) => {
      this.departments = res;
    });
  }

  // ✅ PROOFS
  getProofs() {
    this.employeService.getProofs().subscribe({next:(res) => {
      console.log('Proofs:',res);
      this.proofList = res;
    },
  error:(err)=>{
    console.log(err);
  }
  })
};
  

  // ✅ PROOF SELECT
  onProofChange(event: any) {
  const value = +event.target.value;

  if (event.target.checked) {
    this.selectedProofIds = [...new Set([...this.selectedProofIds, value])];
  } else {
    this.selectedProofIds = this.selectedProofIds.filter(x => x !== value);
  }

  console.log("Selected Proof IDs:", this.selectedProofIds);
}

//   // ✅ FILE SELECT
//   onFileSelected(event: any) {
//   this.selectedFiles = []; // ✅ clear old files

//   const files = event.target.files;

//   for (let i = 0; i < files.length; i++) {
//     this.selectedFiles.push(files[i]);
//   }
// }
open(fileUrl: string) {
  window.open(fileUrl, '_blank');
}
// uploadFile(file: File, presignedUrl: string) {
//   return this.http.put(presignedUrl, file, {
//     headers: {
//       'Content-Type': file.type
//     }
//   });
// }

  // ✅ OPEN DOCUMENT
// open(fileUrl: string) {
//   this.employeService.getS3DocumentFile(fileUrl).subscribe({
//     next: (signedUrl: string) => {
//       window.open(signedUrl, '_blank'); // ✅ opens file
//     },
//     error: (err) => {
//       console.error("Error opening file:", err);
//       alert("Access denied or failed");
//     }
//   });
// }

showDropdown: boolean = false;

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
    console.log("Dropdown:", this.showDropdown);
  }

  getUniqueDocs(docs: string[]) {
  return [...new Set(docs)];
}
getUniqueProofs(proofs: string[]) {
  return [...new Set(proofs)];
}

// uploadFile(groupId: number) {
//   if (this.selectedFiles.length === 0) {
//     alert("Select file first");
//     return;
//   }

//   const file = this.selectedFiles[0]; // ✅ single file

//   this.employeService.uploadToS3(groupId, file).subscribe({
//     next: (res: string) => {
//       console.log("Uploaded URL:", res);
//       alert("File uploaded successfully ✅");
//     },
//     error: (err) => {
//       console.error(err);
//       alert("Upload failed");
//     }
//   });
// }

  // ✅ SUBMIT
  onSubmit(form: NgForm) {

    if (form.invalid || this.selectedProofIds.length === 0 || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    // ✅ BASIC FIELDS
    formData.append("Name", form.value.name);
    formData.append("PhoneNumber", form.value.phoneNumber);
    formData.append("DeptId", form.value.deptId);
    formData.append("Address", form.value.address);

    // ✅ IMPORTANT: backend expects INT
    formData.append("Gender", form.value.gender === 'Male' ? '1' : '0');

    // ✅ PROOFS (FIXED NAME)
    // this.selectedProofIds.forEach(id => {
    //   formData.append("ProofIds", id.toString()); // ✅ FIXED
    // });
 const uniqueProofs = [...new Set(this.selectedProofIds)];
  uniqueProofs.forEach(id => {
    formData.append("ProofIds", id.toString()); // ✅ FIXED
  });

    // ✅ FILES
  this.uploadedUrls.forEach(url => {
  formData.append("DocumentPaths", url);
});

    console.log("Submitting FormData...");

    this.employeService.addEmployee(formData).subscribe({
      next: (res: any) => {
        console.log("SUCCESS:", res);
        alert('Saved Successfully ✅');

        form.resetForm();
        this.selectedProofIds = [];
        this.selectedFiles = [];

        this.loadEmployees();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error("FULL ERROR:", err);
        alert(err.error || "Insert failed");
        this.isSubmitting = false;
      }
    });
  }
}