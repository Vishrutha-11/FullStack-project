import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeService } from '../employe.service';
@Component({
  selector: 'app-employeform',
  templateUrl: './employeform.component.html',
  styleUrls: ['./employeform.component.css']
})



export class EmployeformComponent implements OnInit {

  employees: any[] = [];
  employee: any = {
    empId:'',
  name: '',
  phoneNumber: '',
  deptId: '',
  address: '',
  gender: '',
};
departments:any[]=[];
constructor(private employeService: EmployeService) { }

ngOnInit() {
    this.loadEmployees();
    this.getDepartments();
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

  onSubmit(form: NgForm) {

  if (form.invalid) {
    return;
  }

  const payload = {
    EmpId:form.value.EmpId,
    name: form.value.name,
    phoneNumber: form.value.phoneNumber,
    deptId: form.value.deptId,
    address: form.value.address,
    gender: form.value.gender === 'true'
  };

  this.employeService.addEmployee(payload).subscribe({
    next: (res: any) => {
      console.log(res.message);
      alert('Saved Successfully ✅');
      form.reset();
      this.loadEmployees();
    },
    error: (err) => {
      console.error("API ERROR:", err);
    }
  });

}
}
