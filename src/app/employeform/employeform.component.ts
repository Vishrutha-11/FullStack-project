import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeService } from '../employe.service';
import {
  S3Client
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-employeform',
  templateUrl: './employeform.component.html',
  styleUrls: ['./employeform.component.css']
})
export class EmployeformComponent implements OnInit {

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
    // this.loadAwsKeys();
  }


  // s3 bucket vraibles
s3!: S3Client;

awsAccessKey: any;
awsSecretKey: any;


initialized = false;

async initS3(): Promise<void> {

  if (this.initialized) return;

  try {

    const accessKeyEncrypted =
      await this.employeService
      .GetAmazonS3AccessKey()
      .toPromise();

    const secretKeyEncrypted =
      await this.employeService
      .GetAmazonS3SecretKey()
      .toPromise();

    this.awsAccessKey =
      this.decrypt(accessKeyEncrypted || '');

    this.awsSecretKey =
      this.decrypt(secretKeyEncrypted || '');

    this.s3 = new S3Client({

      region: 'ap-south-1',

      credentials: {

        accessKeyId: this.awsAccessKey,

        secretAccessKey: this.awsSecretKey
      }
    });

    this.initialized = true;

    console.log('S3 initialized');

  } catch (error) {

    console.error(error);

  }
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

    console.log(res);

    this.employees = (res || []).map((emp: any) => {

      return {

        ...emp,

        documents: Array.isArray(emp.documents)
          ? emp.documents
          : emp.documents
            ? emp.documents.split(',')
            : [],

        proofs: Array.isArray(emp.proofs)
          ? emp.proofs
          : emp.proofs
            ? emp.proofs.split(',')
            : []
      };
    });

    console.log(this.employees);

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
async onFileSelected(event: any) {

  const files = event.target.files;

  if (!files?.length) return;

  this.isUploading = true;

  await this.initS3();

  try {

    for (const file of Array.from(files) as any[]) {

    const fileKey =
  'employee-documents/' +
  Date.now() +
  '_' +
  file.name;

      const parallelUploads3 = new Upload({

        client: this.s3,

        params: {

          Bucket: 'btsworkerfiles',

          Key: fileKey,

          Body: file,

          ContentType: file.type,
          
        }
      });

      await parallelUploads3.done();
this.uploadedUrls.clear();

this.uploadedUrls.add(fileKey);
    }

    event.target.value = '';

  } catch (err) {

    console.error(err);

    alert('Upload failed');

  } finally {

    this.isUploading = false;
  }
}

  // ================= VIEW DOCUMENT =================
async viewDocument(fileName: string) {

  if (!fileName) {

    alert('Invalid file');

    return;
  }

  await this.initS3();

  try {

    let fileKey = fileName;

    // if full URL stored in DB
    if (fileKey.includes('amazonaws.com')) {

      const parts = fileKey.split('.amazonaws.com/');

      fileKey = parts[1];
    }

    // if only filename stored
    if (
      !fileKey.startsWith('employee-documents/')
    ) {

      fileKey =
        'employee-documents/' + fileKey;
    }

    console.log('FINAL KEY:', fileKey);

    const command = new GetObjectCommand({

      Bucket: 'btsworkerfiles',

      Key: fileKey
    });

    const signedUrl = await getSignedUrl(

      this.s3,

      command,

      { expiresIn: 300 }
    );

    console.log(signedUrl);

    window.open(signedUrl, '_blank');

  } catch (err) {

    console.error(err);

    alert('Unable to open document');
  }
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


