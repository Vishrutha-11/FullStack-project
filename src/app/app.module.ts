import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import{HttpClientModule} from '@angular/common/http';
import { EmployeformComponent } from './employeform/employeform.component';

// import { UploadComponent } from './upload/upload.component';
@NgModule({
  declarations: [
    AppComponent,
   EmployeformComponent,
  
 
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
