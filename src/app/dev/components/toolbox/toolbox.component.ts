import {Component, Injector} from '@angular/core';
import {AbstractFormComponent} from "../../../shared/components/forms/form.component";
import {AbstractControl, FormControl, ValidationErrors, Validators} from '@angular/forms';

interface UserDTO {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrl: './toolbox.component.scss'
})
export class ToolboxComponent extends AbstractFormComponent<UserDTO> {

  userFormControl = {
    username: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^(0)[0-9]{9}$')]),
  };

  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  protected override initializeFormControls(): { [key: string]: AbstractControl<any, any>; } {
    return this.userFormControl;
  }

  protected override initializeData(): void {
  }

  protected override submitFormDataUrl(): string {
    return '/';
  }

  protected override onSubmitFormDataSuccess(result: any): void {
  }


  protected override initializeFormValidation(control: AbstractControl): ValidationErrors | null {
    this.passwordMatchValidator();
    return super.initializeFormValidation(control);
  }

  private passwordMatchValidator(): void {
    const password = this.userFormControl.password.value;
    const confirmPassword = this.userFormControl.confirmPassword.value;
    const passwordMismatchErrorCode = 'passwordMismatch';
    if (password && confirmPassword && password !== confirmPassword) {
      this.addErrorToFormControl(this.userFormControl.password, passwordMismatchErrorCode);
      this.addErrorToFormControl(this.userFormControl.confirmPassword, passwordMismatchErrorCode);
    } else {
      this.removeErrorFromFormControl(this.userFormControl.password, passwordMismatchErrorCode);
      this.removeErrorFromFormControl(this.userFormControl.confirmPassword, passwordMismatchErrorCode);
    }
  }

}
