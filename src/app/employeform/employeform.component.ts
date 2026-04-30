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

  // ================= CONFIG =================
  awsAccessKey: any;
  awsSecretKey: any;
  awsBucketName = "btsworkerfiles";

  // ================= DATA =================
  employees: any[] = [];
  departments: any[] = [];
  proofList: any[] = [];

  // ================= FORM MODEL =================
  employee: any = this.getEmptyEmployee();

  selectedProofIds: number[] = [];
  selectedEmployeeId: number | null = null;

  uploadedUrls: Set<string> = new Set<string>();

  // ================= UI STATES =================
  isUploading = false;
  isSubmitting = false;
  showDropdown = false;

  // ================= CONSTRUCTOR =================
  constructor(private employeService: EmployeService) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.getDepartments();
    this.getProofs();
    this.loadAwsKeys();
  }

  // ================= AWS KEYS =================
  loadAwsKeys() {
    this.employeService.GetAmazonS3AccessKey().subscribe(res => {
      this.awsAccessKey = this.decrypt(res);
    });

    this.employeService.GetAmazonS3SecretKey().subscribe(res => {
      this.awsSecretKey = this.decrypt(res);
    });
  }

  // ================= EMPTY MODEL =================
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
existingDocuments: string[] = [];
  // ================= DECRYPT =================
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

  // ================= LOAD DATA =================
  getDepartments() {
    this.employeService.getDepartments().subscribe(res => {
      this.departments = res;
    });
  }

  getProofs() {
    this.employeService.getProofs().subscribe(res => {
      this.proofList = res;
      this.loadEmployees();
    });
  }

  loadEmployees() {
    this.employeService.getEmployees().subscribe(res => {

      this.employees = (res || []).map(emp => {
        return {
          ...emp,

          proofIds: Array.isArray(emp.proofIds)
            ? emp.proofIds
            : emp.proofIds
              ? emp.proofIds.split(',').map(Number)
              : [],

          documents: Array.isArray(emp.documents)
            ? emp.documents
            : emp.documents
              ? emp.documents.split(',')
              : []
        };
      });

    });
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

    this.selectedProofIds = this.proofList
      .filter(p => emp.proofs?.includes(p.pName))
      .map(p => p.pId);

    const docs = Array.isArray(emp.documents)
      ? emp.documents
      : emp.documents
        ? emp.documents.split(',')
        : [];
  this.existingDocuments = Array.isArray(emp.documents)
    ? emp.documents
    : emp.documents?.split(',') || [];
    this.uploadedUrls = new Set(docs);
      this.uploadedUrls.clear();
  }

  // ================= PROOFS =================
  onProofToggle(id: number, checked: boolean) {
    this.selectedProofIds = checked
      ? [...new Set([...this.selectedProofIds, id])]
      : this.selectedProofIds.filter(x => x !== id);
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  getProofNames(proofIds: number[]): string {
    return this.proofList
      .filter(p => proofIds.includes(p.pId))
      .map(p => p.pName)
      .join(', ');
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

            if (upload.ok) {
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

  // ================= VIEW DOCUMENT =================
  viewDocument(fileKey: string) {
    if (!fileKey?.trim()) {
      alert("Invalid file");
      return;
    }

    this.employeService.getViewUrl(fileKey).subscribe({
      next: (url: string) => window.open(url, '_blank'),
      error: () => alert("Unable to fetch document")
    });
  }

  // ================= SUBMIT =================
  onSubmit(form: NgForm) {

    if (!form.valid || this.isUploading || this.isSubmitting) return;

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

    formData.append("Name", form.value.name || '');
    formData.append("PhoneNumber", form.value.phoneNumber || '');
    formData.append("DeptId", String(form.value.deptId));
    formData.append("Address", form.value.address || '');
    formData.append("Gender", form.value.gender === 'Male' ? 'true' : 'false');

    this.selectedProofIds.forEach(id => {
      formData.append("ProofIds", String(id));
    });

    Array.from(this.uploadedUrls).forEach(key => {
      formData.append("DocumentPaths", key);
    });

    const request = this.selectedEmployeeId !== null
      ? this.employeService.updateEmployee(formData)
      : this.employeService.addEmployee(formData);

    request.subscribe({
      next: () => {
        alert(this.selectedEmployeeId ? "Updated Successfully" : "Saved Successfully");

        this.resetForm(form);
      },
      error: (err) => {
        console.error(err);
        alert(JSON.stringify(err.error));
        this.isSubmitting = false;
      }
    });
  }

  // ================= RESET =================
  resetForm(form: NgForm) {
    form.resetForm();
    this.employee = this.getEmptyEmployee();
    this.selectedProofIds = [];
    this.uploadedUrls = new Set<string>();
    this.selectedEmployeeId = null;

    this.loadEmployees();
    this.isSubmitting = false;
  }

  // ================= DELETE =================
  onDelete(empId: number) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    this.employeService.deleteEmployee(empId).subscribe({
      next: res => {
        alert(res);
        this.loadEmployees();
      },
      error: () => alert("Delete failed")
    });
  }
}