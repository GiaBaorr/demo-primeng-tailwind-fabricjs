import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {ErrorMessageDirective} from './directives/error-message.directive';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {RouterModule} from "@angular/router";
import {TranslateModule} from "@ngx-translate/core";
import {ErrorDirective} from './directives/error.directive';
import {TranslateParamsPipe} from './pipes/translate-params.pipe';
import {InputTextModule} from "primeng/inputtext";
import {AutoFocusModule} from "primeng/autofocus";
import {FloatLabelModule} from "primeng/floatlabel";
import {PasswordModule} from "primeng/password";
import {InputSwitchModule} from "primeng/inputswitch";

const primeModules = [
  AutoFocusModule,
  ButtonModule,
  FloatLabelModule,
  InputTextModule,
  PasswordModule,
  RippleModule,
  InputSwitchModule
];

const sharedModules = [
  ErrorMessageDirective,
  ErrorDirective,
  TranslateParamsPipe,
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
    ...coreModules,
    ...sharedModules
  ]
})
export class SharedModule {
}
