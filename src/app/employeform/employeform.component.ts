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
  name: '',
  phoneNumber: '',
  department: '',
  address: '',
  gender: '',
};
constructor(private employeService: EmployeService) { }

ngOnInit() {
    this.loadEmployees();
  }

  // ✅ FETCH DATA
loadEmployees() {
  this.employeService.getEmployees().subscribe((data: any) => {
    console.log("Employees from API:", data);
    this.employees = data;
  });
}

  onSubmit(form: NgForm) {

  if (form.invalid) {
    return;
  }

  const payload = {
    name: form.value.name,
    phoneNumber: form.value.phoneNumber,
    department: form.value.department,
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
