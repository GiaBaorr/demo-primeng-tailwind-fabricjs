import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {ErrorMessageDirective} from './directives/error-message.directive';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";

const primeModules = [
  ButtonModule,
  RippleModule
];

const sharedModules = [
  ErrorMessageDirective
];

const coreModules = [
  CommonModule,
  HttpClientModule,
  RouterModule,
  FormsModule,
  ReactiveFormsModule,
  DatePipe
];

@NgModule({
  declarations: [
    ...sharedModules
  ],
  imports: [
    ...primeModules,
    ...coreModules,
    TranslateModule.forChild(),
  ],
  exports: [
    ...primeModules,
    ...sharedModules,
    ...coreModules
  ]
})
export class SharedModule {
}
