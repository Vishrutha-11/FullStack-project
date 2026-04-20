
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeService } from '../employe.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-employeform',
  templateUrl: './employeform.component.html',
  styleUrls: ['./employeform.component.css']
})
export class EmployeformComponent implements OnInit {
  awsAccessKey: any;
  awsSecretKey: any;
  awsBucketName = "btsworkerfiles"; 
  employees: any[] = [];
  departments: any[] = [];
  proofList: any[] = [];
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
    selectedProofIds: number[] = [];

  uploadedUrls = new Set<string>();

  isUploading = false;
  isSubmitting = false;

  constructor(private employeService: EmployeService) {}

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

  //   // Decrypts an AES-encrypted string and returns the original text
  decrypt(encryptedText: string): string {
  const key = CryptoJS.enc.Utf8.parse('NLKpQsoPaeoZ55ul');  // Secret key
  const iv = CryptoJS.enc.Utf8.parse('RbeqxtNXxucHI123');   // Initialization Vector
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8); 

}
showDropdown = false;

toggleDropdown() {
  this.showDropdown = !this.showDropdown;
}



  // ================= FILE UPLOAD =================
  onFileSelected(event: any) {

    const files = event.target.files;
    if (!files || files.length === 0) return;

    this.isUploading = true;

    const fileArray = Array.from(files);
    let completed = 0;

    fileArray.forEach((file: any) => {

      this.employeService.getPresignedUrl(file.name, file.type).subscribe({

        next: async (res: any) => {

          const url = res.url;
          const key = res.key;

          try {
            const upload = await fetch(url, {
              method: 'PUT',
              body: file,
              headers: { 'Content-Type': file.type }
            });

            if (upload.ok) {
              this.uploadedUrls.add(key); // ✅ STORE ONLY KEY
            }

          } catch (err) {
            console.error(err);
          }

          completed++;

          if (completed === fileArray.length) {
            this.isUploading = false;
            (event.target as HTMLInputElement).value = '';
          }
        },

        error: () => {
          completed++;
          if (completed === fileArray.length) {
            this.isUploading = false;
          }
        }
      });
    });
  }

  // ================= VIEW DOCUMENT =================
  viewDocument(fileKey: string) {

    this.employeService.getViewUrl(fileKey).subscribe({
      next: (url: string) => {
        window.open(url, '_blank');
      },
      error: (err) => {
        console.error("View error", err);
      }
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
  // ================= SUBMIT =================
  onSubmit(form: NgForm) {

    if (this.isUploading || this.isSubmitting) return;

    this.isSubmitting = true;

    const formData = new FormData();

    formData.append("Name", form.value.name);
    formData.append("PhoneNumber", form.value.phoneNumber);
    formData.append("DeptId", form.value.deptId);
    formData.append("Address", form.value.address);
    formData.append("Gender", form.value.gender === 'Male' ? '1' : '0');

    const uniqueProofs = [...new Set(this.selectedProofIds)];
  uniqueProofs.forEach(id => {
    formData.append("ProofIds", id.toString()); // ✅ FIXED
  });
    this.uploadedUrls.forEach(key => {
      formData.append("DocumentPaths", key);
    });

    this.employeService.addEmployee(formData).subscribe({
      next: () => {

        alert("Saved Successfully");

        form.resetForm();
         this.selectedProofIds = [];
        this.uploadedUrls.clear();

        this.loadEmployees();
        this.isSubmitting = false;
      },
      error: () => {
        alert("Error");
        this.isSubmitting = false;
      }
    });
  }

  // ================= LOAD =================
  loadEmployees() {

    this.employees = [];

    this.employeService.getEmployees().subscribe(res => {

      this.employees = res.map(emp => ({
        ...emp,
        documents: [...new Set(emp.documents ?? [])],
        proofs: [...new Set(emp.proofs ?? [])]
      }));

    });
  }

  getDepartments() {
    this.employeService.getDepartments().subscribe(res => {
      this.departments = res;
    });
  }
}