import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeService } from '../employe.service';
@Component({
  selector: 'app-employeform',
  templateUrl: './employeform.component.html',
  styleUrls: ['./employeform.component.css']
})



export class EmployeformComponent implements OnInit {
selectedProofIds: number[] = [];
employees: any[] = [];
proofList: any[] = [];
employee: any = {
  empId: '',
  name: '',
  phoneNumber: '',
  deptId: '',
  address: '',
  gender: '',
  groupId: '',        // ✅ ADD THIS
  proofIds: []        // ✅ ADD THIS (for insert)
};
departments:any[]=[];
constructor(private employeService: EmployeService) { }

ngOnInit() {
    this.loadEmployees();
    this.getDepartments();
    this.getProofs();
  }

  // ✅ FETCH DATA
loadEmployees() {
  this.employeService.getEmployees().subscribe((data: any) => {
    console.log("Employees from API:", data);
    this.employees = data;
  });
}

getDepartments() {
    this.employeService.getDepartments().subscribe((res: any) => {
      console.log("Departments API Response:", res);
      this.departments = res; // ✅ FIXED
    });
  }
onProofChange(event: any) {
  const value = +event.target.value;

  if (event.target.checked) {
    if (!this.selectedProofIds.includes(value)) {
      this.selectedProofIds.push(value);
    }
  } else {
    this.selectedProofIds = this.selectedProofIds.filter(x => x !== value);
  }
}

getProofs() {
  this.employeService.getProofs().subscribe({
    next: (res) => {
      console.log('Proofs:', res);
      this.proofList = res;
    },
    error: (err) => {
      console.error(err);
    }
  });
}
showDropdown: boolean = false;

toggleDropdown() {
  this.showDropdown = !this.showDropdown;
}
  onSubmit(form: NgForm) {

  if (form.invalid || this.selectedProofIds.length === 0) {
    return;
  }

  const payload = {
    
    Name: form.value.name,
    PhoneNumber: form.value.phoneNumber,
  DeptId: Number(form.value.deptId),
    Address: form.value.address,
   Gender: form.value.gender === 'Male' ? 1 : 0,
ProofIds: this.selectedProofIds ?? []
  };

  this.employeService.addEmployee(payload).subscribe({
    next: (res: any) => {
      console.log(res.message);
      alert('Saved Successfully ✅');
      this.selectedProofIds = [];
      form.resetForm();

      this.employee = {
      
        name: '',
        phoneNumber: '',
        deptId: '',
        address: '',
        gender: '',
        groupId: '',
        proofIds: []
      };
      this.loadEmployees();
    },
    error: (err) => {
        console.error("FULL ERROR:", err);
  console.error("ERROR MESSAGE:", err.error);
    }
  });

}
}