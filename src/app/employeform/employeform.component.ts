import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeService } from '../employe.service';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';

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

  departments: any[] = [];

  awsAccessKey: any;
  awsSecretKey: any;
  awsBucketName = "btsworkerfiles"; // ✅ FIXED

  constructor(private employeService: EmployeService, private http: HttpClient) { }

  ngOnInit() {
    this.loadEmployees();
    this.getDepartments();
    this.getProofs();

    // ✅ Access Key
    this.employeService.getAWSAccessKey().subscribe(res => {
      this.awsAccessKey = this.decrypt(res);
      console.log("Access Key:", this.awsAccessKey);
    });

    // ✅ Secret Key
    this.employeService.getAWSSecretKey().subscribe(res => {
      this.awsSecretKey = this.decrypt(res);
      console.log("Secret Key:", this.awsSecretKey);
    });
  }

  // ✅ DECRYPT
  decrypt(encryptedText: string): string {
    const key = CryptoJS.enc.Utf8.parse('NLKpQsoPaeoZ55ul');
    const iv = CryptoJS.enc.Utf8.parse('RbeqxtNXxucHI123');

    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
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
uploadFile(file: File, presignedUrl: string) {
  return this.http.put(presignedUrl, file, {
    headers: {
      'Content-Type': file.type
    }
  });
}
onFileSelected(event: any) {
  this.selectedFiles = []; // clear old files

  const files = event.target.files;

  if (!files || files.length === 0) {
    return;
  }

  for (let i = 0; i < files.length; i++) {
    this.selectedFiles.push(files[i]);
  }
}
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
    this.selectedFiles.forEach(file => {
  formData.append("Documents", file, file.name); // ✅ REQUIRED
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