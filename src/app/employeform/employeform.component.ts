
// import { Component, OnInit } from '@angular/core';
// import { NgForm } from '@angular/forms';
// import { EmployeService } from '../employe.service';
// import * as CryptoJS from 'crypto-js';
// @Component({
//   selector: 'app-employeform',
//   templateUrl: './employeform.component.html',
//   styleUrls: ['./employeform.component.css']
// })
// export class EmployeformComponent implements OnInit {
//   awsAccessKey: any;
//   awsSecretKey: any;
//   awsBucketName = "btsworkerfiles"; 
//   employees: any[] = [];
//   departments: any[] = [];
//   proofList: any[] = [];
//   employee: any = {
//     empId: '',
//     name: '',
//     phoneNumber: '',
//     deptId: '',
//     address: '',
//     gender: '',
//     groupId: '',
//     proofIds: []
//   };
//     selectedProofIds: number[] = [];
// selectedEmployeeId: number | null = null;
//   uploadedUrls = new Set<string>();

//   isUploading = false;
//   isSubmitting = false;

//   constructor(private employeService: EmployeService) {}

//   ngOnInit() {
//     this.getDepartments();
//     this.getProofs();
//     this.loadEmployees();

    
//     // Load ACCESS Key
//     this.employeService.GetAmazonS3AccessKey().subscribe(res => {
//       console.log("Encrypted Access Key:", res);
//       this.awsAccessKey = this.decrypt(res);
//       console.log("Decrypted Access Key:", this.awsAccessKey);
//     });

//     // Load SECRET Key
//     this.employeService.GetAmazonS3SecretKey().subscribe(res => {
//       console.log("Encrypted Secret Key:", res);
//       this.awsSecretKey = this.decrypt(res);
//       console.log("Decrypted Secret Key:", this.awsSecretKey);
//     });
//   }

//   //   // Decrypts an AES-encrypted string and returns the original text
//   decrypt(encryptedText: string): string {
//   const key = CryptoJS.enc.Utf8.parse('NLKpQsoPaeoZ55ul');  // Secret key
//   const iv = CryptoJS.enc.Utf8.parse('RbeqxtNXxucHI123');   // Initialization Vector
//   const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
//     iv: iv,
//     mode: CryptoJS.mode.CBC,
//     padding: CryptoJS.pad.Pkcs7
//   });
//   return decrypted.toString(CryptoJS.enc.Utf8); 

// }
// showDropdown = false;

// toggleDropdown() {
//   this.showDropdown = !this.showDropdown;
// }


// onEdit(emp: any) {

//   this.selectedEmployeeId = emp.empId;

//   this.employee = {
//     empId: emp.empId,
//     name: emp.name,
//     phoneNumber: emp.phoneNumber,
//     deptId: emp.deptId,
//     address: emp.address,
//     gender: emp.gender ? 'Male' : 'Female'
//   };

//   // ✅ FIXED mapping
//   this.selectedProofIds = this.proofList
//     .filter(p => (emp.proofs || []).includes(p.pName))
//     .map(p => p.pId);

//   this.uploadedUrls = new Set(emp.documents || []);
// }
//   // ================= FILE UPLOAD =================
//   onFileSelected(event: any) {

//     const files = event.target.files;
//     if (!files || files.length === 0) return;
// this.uploadedUrls.clear()
//     this.isUploading = true;

//     const fileArray = Array.from(files);
//     let completed = 0;

//     fileArray.forEach((file: any) => {

//       this.employeService.getPresignedUrl(file.name, file.type).subscribe({

//         next: async (res: any) => {

//           const url = res.url;
//           const key = res.key;

//           try {
//             const upload = await fetch(url, {
//               method: 'PUT',
//               body: file,
//               headers: { 'Content-Type': file.type }
//             });

//             if (upload.ok) {
//               this.uploadedUrls.add(key); // ✅ STORE ONLY KEY
//             }

//           } catch (err) {
//             console.error(err);
//           }

//           completed++;

//           if (completed === fileArray.length) {
//             this.isUploading = false;
//             (event.target as HTMLInputElement).value = '';
//           }
//         },

//         error: () => {
//           completed++;
//           if (completed === fileArray.length) {
//             this.isUploading = false;
//           }
//         }
//       });
//     });
//   }

//   // ================= VIEW DOCUMENT =================
//   viewDocument(fileKey: string) {

//     this.employeService.getViewUrl(fileKey).subscribe({
//       next: (url: string) => {
//         window.open(url, '_blank');
//       },
//       error: (err) => {
//         console.error("View error", err);
//       }
//     });
//   }

//     // ✅ PROOFS
// getProofs() {
//   this.employeService.getProofs().subscribe(res => {
//     this.proofList = res;

//     // ✅ load employees AFTER proofs ready
//     this.loadEmployees();
//   });
// }
  

//    // ✅ PROOF SELECT
//   onProofChange(event: any) {
//   const value = +event.target.value;

//   if (event.target.checked) {
//     this.selectedProofIds = [...new Set([...this.selectedProofIds, value])];
//   } else {
//     this.selectedProofIds = this.selectedProofIds.filter(x => x !== value);
//   }

//   console.log("Selected Proof IDs:", this.selectedProofIds);
// }
//   // ================= SUBMIT =================
// onSubmit(form: NgForm) {
// if (!form.valid) {
//   alert("Fill all required fields");
//   this.isSubmitting = false;
//   return;
// }
//   console.log("Submit triggered");

//   if (this.isUploading || this.isSubmitting) return;

//   this.isSubmitting = true;

//   // ✅ VALIDATIONS
//   if (this.selectedProofIds.length === 0) {
//     alert("Select at least one proof");
//     this.isSubmitting = false;
//     return;
//   }

//   if (this.uploadedUrls.size === 0 && this.selectedEmployeeId === null) {
//     alert("Upload at least one document");
//     this.isSubmitting = false;
//     return;
//   }

//   // ✅ CREATE FIRST
//   const formData = new FormData();

//   if (this.selectedEmployeeId !== null) {
//     formData.append("EmpId", this.selectedEmployeeId.toString());
//   }

//   formData.append("Name", form.value.name);
//   formData.append("PhoneNumber", form.value.phoneNumber);
//  formData.append("DeptId", form.value.deptId ? form.value.deptId.toString() : '0');
//   formData.append("Address", form.value.address);
//  formData.append("Gender", form.value.gender === 'Male' ? '1' : '0');
//   // ✅ PROOFS
//   const uniqueProofs = [...new Set(this.selectedProofIds)]
//     .filter(x => !isNaN(x));

//   uniqueProofs.forEach(id => {
//     formData.append("ProofIds", id.toString());
//   });

//   // ✅ DOCUMENTS (only if exists)
//   if (this.uploadedUrls.size > 0) {
//     this.uploadedUrls.forEach(key => {
//       formData.append("DocumentPaths", key);
//     });
//   }

//   const request = this.selectedEmployeeId !== null
//     ? this.employeService.updateEmployee(formData)
//     : this.employeService.addEmployee(formData);

//   request.subscribe({
//     next: (res) => {

//       console.log("SUCCESS", res);

//       alert(this.selectedEmployeeId !== null ? "Updated Successfully" : "Saved Successfully");

//       form.resetForm();
//       this.employee = {
//   empId: '',
//   name: '',
//   phoneNumber: '',
//   deptId: '',
//   address: '',
//   gender: '',
//   groupId: '',
//   proofIds: []
// };
//       this.selectedProofIds = [];
//       this.uploadedUrls.clear();
//       this.selectedEmployeeId = null;

//       this.loadEmployees();
//       this.isSubmitting = false;
//     },
//     error: (err) => {
//       console.error(err);
//       alert(err?.error?.title || "Error");
//       this.isSubmitting = false;
//     }
//   });
// }
//   // ================= LOAD =================
// loadEmployees() {

//   this.employeService.getEmployees().subscribe(res => {

//     this.employees = res.map(emp => {

//       const proofNames = (emp.proofs || []).map((id: number) => {
//         const match = this.proofList.find(p => p.pId == id);
//         return match ? match.pName : id;
//       });

//       return {
//         ...emp,
//         proofs: [...new Set(proofNames)],
//         documents: [...new Set(emp.documents ?? [])]
//       };
//     });

//   });
// }

//   getDepartments() {
//     this.employeService.getDepartments().subscribe(res => {
//       this.departments = res;
//     });
//   }

//   onDelete(empId: number) {

//   if (!confirm("Are you sure you want to delete this employee?")) {
//     return;
//   }

//   this.employeService.deleteEmployee(empId).subscribe({
//     next: (res) => {
//       alert(res); // "Deleted Successfully"

//       // ✅ refresh table
//       this.loadEmployees();
//     },
//     error: (err) => {
//       console.error(err);
//       alert("Delete failed");
//     }
//   });
// }
// }


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

  employee: any = this.getEmptyEmployee();

  selectedProofIds: number[] = [];
  selectedEmployeeId: number | null = null;

  uploadedUrls: Set<string> = new Set<string>();

  isUploading = false;
  isSubmitting = false;
  showDropdown: boolean = false;

  constructor(private employeService: EmployeService) {}

  ngOnInit() {
    this.getDepartments();
    this.getProofs();

    this.employeService.GetAmazonS3AccessKey().subscribe(res => {
      this.awsAccessKey = this.decrypt(res);
    });

    this.employeService.GetAmazonS3SecretKey().subscribe(res => {
      this.awsSecretKey = this.decrypt(res);
    });
  }

  // ================= HELPERS =================
  getEmptyEmployee() {
    return {
      empId: '',
      name: '',
      phoneNumber: '',
      deptId: '',
      address: '',
      gender: '',
      proofIds: []
    };
  }

  decrypt(encryptedText: string): string {
    const key = CryptoJS.enc.Utf8.parse('NLKpQsoPaeoZ55ul');
    const iv = CryptoJS.enc.Utf8.parse('RbeqxtNXxucHI123');

    const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // ================= EDIT =================
  onEdit(emp: any) {
    this.selectedEmployeeId = emp.empId;

    this.employee = {
      empId: emp.empId,
      name: emp.name,
      phoneNumber: emp.phoneNumber,
      deptId: emp.deptId,
      address: emp.address,
      gender: emp.gender ? 'Male' : 'Female'
    };

    this.selectedProofIds = Array.from(new Set(emp.proofIds ?? []));
    this.uploadedUrls = new Set(emp.documents ?? []);
  }

  // ================= FILE UPLOAD =================
  onFileSelected(event: any) {
  const files = event.target.files;
  if (!files?.length) return;

  this.isUploading = true;

  let completed = 0;
  const total = files.length;

  Array.from(files).forEach((file: any) => {

    this.employeService.getPresignedUrl(file.name, file.type).subscribe({
      next: async (res: any) => {
        try {
          const upload = await fetch(res.url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type }
          });

        if (upload.ok && !this.uploadedUrls.has(res.key)) {
  this.uploadedUrls.add(res.key);
}

        } catch (err) {
          console.error(err);
        }

        completed++;
        if (completed === total) {
          this.isUploading = false;
          event.target.value = '';
        }
      },

      error: () => {
        completed++;
        if (completed === total) {
          this.isUploading = false;
        }
      }
    });
  });
}

  // ================= PROOFS =================
  getProofs() {
    this.employeService.getProofs().subscribe(res => {
      this.proofList = res;
      this.loadEmployees();
    });
  }

  onProofChange(event: any) {
    const id = Number(event.target.value);

    if (event.target.checked) {
      this.selectedProofIds = Array.from(new Set([...this.selectedProofIds, id]));
    } else {
      this.selectedProofIds = this.selectedProofIds.filter(x => x !== id);
    }
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  // ================= VIEW DOCUMENT =================
viewDocument(fileKey: string) {
  if (!fileKey || fileKey.trim() === '') {
    alert("Invalid file");
    return;
  }

  this.employeService.getViewUrl(fileKey).subscribe({
    next: (url: string) => {
      if (url) {
        window.open(url, '_blank');
      } else {
        alert("No URL returned from server");
      }
    },
    error: () => {
      alert("Unable to fetch document");
    }
  });
}

  // ================= SUBMIT =================
  onSubmit(form: NgForm) {

    if (!form.valid) return alert("Fill all required fields");
    if (this.isUploading || this.isSubmitting) return;

    if (!this.selectedProofIds.length) {
      alert("Select at least one proof");
      return;
    }

    if (!this.uploadedUrls.size && this.selectedEmployeeId === null) {
      alert("Upload at least one document");
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();

    if (this.selectedEmployeeId !== null) {
      formData.append("EmpId", String(this.selectedEmployeeId));
    }

    if (!form.value.deptId) {
      alert("Select Department");
      this.isSubmitting = false;
      return;
    }

    formData.append("Name", form.value.name ?? '');
    formData.append("PhoneNumber", form.value.phoneNumber ?? '');
    formData.append("DeptId", String(form.value.deptId));
    formData.append("Address", form.value.address ?? '');
formData.append("Gender", form.value.gender === 'Male' ? 'true' : 'false');

    // proofs
    Array.from(new Set(this.selectedProofIds)).forEach(id => {
      formData.append("ProofIds", String(id));
    });

    // documents
    Array.from(this.uploadedUrls).forEach(key => {
      formData.append("DocumentPaths", key);
    });

    const request =
      this.selectedEmployeeId !== null
        ? this.employeService.updateEmployee(formData)
        : this.employeService.addEmployee(formData);

    request.subscribe({
      next: () => {
        alert(this.selectedEmployeeId ? "Updated Successfully" : "Saved Successfully");

        form.resetForm();
        this.employee = this.getEmptyEmployee();
        this.selectedProofIds = [];
        this.uploadedUrls = new Set<string>();
        this.selectedEmployeeId = null;

        this.loadEmployees();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error(err);
        alert(JSON.stringify(err.error));
        this.isSubmitting = false;
      }
    });
  }

  // ================= LOAD =================
loadEmployees() {
  this.employeService.getEmployees().subscribe(res => {

    this.employees = (res || []).map(emp => {

      // 🔥 HANDLE ALL FORMATS
      let ids: number[] = [];

      if (Array.isArray(emp.proofIds)) {
        ids = emp.proofIds.map((x: any) => +x);
      }
      else if (typeof emp.proofIds === 'string') {
        ids = emp.proofIds.split(',').map((x: string) => +x);
      }
      else if (Array.isArray(emp.proofs) && typeof emp.proofs[0] === 'number') {
        ids = emp.proofs.map((x: any) => +x);
      }

      console.log("IDS:", ids);

const proofNames = Array.isArray(emp.proofs)
  ? [...new Set(emp.proofs)]   // ✅ remove duplicates
  : emp.proofs
    ? [...new Set(emp.proofs.split(','))]
    : [];

      return {
        ...emp,
        proofs: proofNames,

        documents: Array.from(new Set(
          Array.isArray(emp.documents)
            ? emp.documents
            : emp.documents
              ? emp.documents.split(',')
              : []
        ))
      };
    });

  });
}
  getDepartments() {
    this.employeService.getDepartments().subscribe(res => {
      this.departments = res;
    });
  }

  // ================= DELETE =================
  onDelete(empId: number) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    this.employeService.deleteEmployee(empId).subscribe({
      next: (res) => {
        alert(res);
        this.loadEmployees();
      },
      error: () => alert("Delete failed")
    });
  }
}