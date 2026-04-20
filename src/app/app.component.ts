import { Component, OnInit } from '@angular/core';
import { EmployeService } from './employe.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  employees: any[] = [];   // ✅ declare variable

    constructor(private employeService: EmployeService) {}  // ✅ inject service

  ngOnInit() {
    this.employeService.getEmployees().subscribe({
      next: (data) => {
        console.log(data);
        this.employees = data;
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
      }
    });
  }
}