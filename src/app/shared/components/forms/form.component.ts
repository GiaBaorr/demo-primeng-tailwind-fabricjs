import {HttpClient} from '@angular/common/http';
import {Directive, Injector, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {of, Subscription, take} from 'rxjs';
import {SubscriptionAwareComponent} from "../../../subscription-aware.component";
import {BusinessErrorParam} from "../../../model";

export interface FieldError {
  field: string;
  message: string;
}

/**
 * Abstract form Component. A base class for form based component which support
 * dirty check on navigation via DirtyCheck guard, programmatic validation.
 */
@Directive()
export abstract class AbstractFormComponent<T> extends SubscriptionAwareComponent implements OnInit {

  /**
   * the root form group of the form.
   */
  public formGroup!: FormGroup;

  /**
   * form controls of the form.
   */
  formControls!: {[key: string]: AbstractControl};

  /**
   * Flag in order to prevent double submit issue when the form is submitted. It is set to true when the submit() method is invoked and
   * set to false to release the lock if there's business error return from server via method submitFormResultError(). Other custom
   * handling can added depend use case.
   */
  disableSubmitButton!: boolean;

  /**
   * The target entity which is bound to the form input controls
   */
  public data!: T;

  /**
   * Subscription for form changes
   */
  formChangesSubscription!: Subscription;

  /**
   * Flag to indicate if the submission failed.
   */
  isOnSubmissionFailed: boolean = false;

  /**
   * Submitted flag, it is used to force to show validation error
   * when the form is submitted with validation error.
   */
  protected submitted!: boolean;
  protected httpClient: HttpClient;
  protected formBuilder: FormBuilder;
  protected translate: TranslateService;

  protected constructor(injector: Injector) {
    super();
    this.httpClient = injector.get(HttpClient);
    this.formBuilder = injector.get(FormBuilder);
    this.translate = injector.get(TranslateService);
  }

  ngOnInit(): void {
    this.formControls = this.initializeFormControls();
    this.formGroup = this.formBuilder.group(this.formControls, {
      validators: this.initializeFormValidation.bind(this)
    });
    this.initializeData();
    this.updateFormControlsState(this.formGroup, [
      (ctr: AbstractControl): void => this.registerSubscription(ctr.valueChanges.pipe(take(1)).subscribe(() => ctr.markAsTouched()))
    ]);
    this.subscribeToFormChanges();
  }

  /**
   * Validate and submits the form.
   */
  submit(): void {
    this.validateFormBeforeSubmit((): void => this.submitForm());
  }

  /**
   * Reset the form.
   */
  reset(): void {
    this.submitted = false;
    this.formGroup.reset();
  }

  /**
   * dirty flag
   */
  isDirty(): boolean {
    return this.formGroup.dirty;
  }

  /**
   * Reset state of formGroup back to pristine.
   */
  resetDirty(): void {
    this.formGroup.markAsPristine();
  }

  setFormErrors(fields: FieldError[]): boolean {
    let hasError = false;
    fields.forEach((f: FieldError) => {
      const control = this.formGroup.controls[f.field];
      if (control) {
        control.setErrors({validation: f.message});
        control.markAsTouched();
        hasError = true;
      }
    });

    return hasError;
  }

  /**
   * Add an error to the formControl. Used this instead of directly .setErrors({}) when the control have >1 errorCode
   */
  addErrorToFormControl(control: AbstractControl, errorCode: string): void {
    const currentErrors = control.errors;
    const newError = {[errorCode]: true};
    if (!control.hasError(errorCode)) {
      const updatedErrors = {...currentErrors, ...newError};
      control.setErrors(updatedErrors);
    }
  }

  /**
   * Remove an error from the formControl. Used this instead of directly .setErrors({}) when the control have >1 errorCode
   */
  removeErrorFromFormControl(control: AbstractControl, errorCode: string): void {
    const currentErrors = control.errors;
    if (currentErrors) {
      const updatedErrors = {...currentErrors};
      delete updatedErrors[errorCode];
      control.setErrors(Object.keys(updatedErrors).length ? updatedErrors : null);
    }
  }

  /**
   * Initialize list of controls for the form.
   */
  protected abstract initializeFormControls(): {[key: string]: AbstractControl};

  protected enableSubmitBtn(): void {
    this.disableSubmitButton = false;
  }

  protected disableSubmitBtn(): void {
    this.disableSubmitButton = true;
  }

  /**
   * Perform additional processing before submit the form.
   */
  protected prepareDataBeforeSubmit(): void {
    // Will be override in subclass
  }

  /**
   * Processing when addition validation logic failed.
   */
  protected validateFormError(res: string[]): void {
    this.onSubmitFormRequestError(res);
  }

  protected updateFormControlsState(formGroup: FormGroup, functions: ((formControl: AbstractControl) => void)[]): void {
    for (const control in formGroup.controls) {
      if (formGroup.controls[control]) {
        functions.forEach(fn => fn(formGroup.controls[control]));
        if (formGroup.get(control) instanceof FormGroup || formGroup.get(control) instanceof FormArray) {
          this.updateFormControlsState(formGroup.get(control) as FormGroup, functions);
        }
      }
    }
  }

  /**
   * Subscribes to form value changes to enable the submit button.
   *
   * This method is crucial for ensuring that the submit button is re-enabled whenever the user modifies any form field.
   * By subscribing to the form's valueChanges observable, this method ensures that any change in the form's values triggers
   * the re-enabling of the submit button. This allows the user to make necessary corrections and resubmit the form, improving
   * the overall user experience and ensuring that form submission can be retried after a failure.
   */
  protected subscribeToFormChanges(): void {
    this.formChangesSubscription = this.formGroup.valueChanges.subscribe((): void => {
      if (this.isOnSubmissionFailed) {
        this.enableSubmitBtn();
      }
    });
    this.registerSubscription(this.formChangesSubscription);
  }

  /**
   * Validate form before submit
   */
  protected validateForm(): string[] {
    // Will be override in subclass
    return [];
  }

  /**
   * The actual submit logic of the child class.
   * This is only called when no validation errors found.
   */
  protected submitForm(data?: T): void {
    // TODO: this.notificationService.clearAll();
    if (this.submitFormDataUrl()) {
      this.disableSubmitBtn();
      this.httpClient.request(this.submitFormMethod(), this.submitFormDataUrl(), {body: data || this.getSubmitFormData()}).subscribe({
        next: r => {
          this.showSaveSuccessNotification(r);
          this.enableSubmitBtn();
          this.onSubmitFormDataSuccess(r);
          this.isOnSubmissionFailed = false;
        },
        error: error => {
          this.displayFormResultErrors(error.error);
          this.onSubmitFormRequestError(error);
          this.isOnSubmissionFailed = true;
        }
      });
    } else {
      this.enableSubmitBtn();
      this.onSubmitFormDataSuccess(this.getSubmitFormData());
    }
  }

  /**
   * Hook when having errors
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onSubmitFormRequestError(error: any): void {
    // Override by subclass
  }

  /**
   * Initialize the default value for the target entity.
   */
  protected abstract initializeData(): void;

  protected abstract submitFormDataUrl(): string;

  protected submitFormMethod(): string {
    return 'POST';
  }

  protected abstract onSubmitFormDataSuccess(result: any): void;

  protected getSubmitFormData(): any {
    return this.formGroup.value;
  }

  protected convertErrorParams(params: BusinessErrorParam[]): any {
    let result;
    params?.forEach((arg: BusinessErrorParam) => {
      const errorParam = {[arg.key]: arg.value};
      result = {
        ...errorParam
      };
    });
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected showSaveSuccessNotification(result: any): void {
    //TODO: this.notificationService.success({message: 'common.saveSuccess'});
  }

  protected showValidationErrorNotification(): void {
    // TODO:
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected displayFormResultErrors(result: any): void {
    if (result?.errorType === 'BUSINESS') {
      // Business error
      if (result?.field) {
        const formControl = this.formControls[result.field];
        if (formControl) {
          let businessError = {
            [result.i18nKey]: {}
          };
          result.args.forEach((arg: BusinessErrorParam) => {
            const errorParam = {[arg.key]: arg.value};
            businessError = {
              [result.i18nKey]: {
                ...errorParam
              }
            };
          });
          formControl.setErrors(businessError);
          formControl.markAsTouched();
          formControl.markAsDirty();
        }
      } else {
        // TODO:
        // this.notificationService.error({
        //   message: `i18n.validation.${result.i18nKey}`, // This is convention of oblique
        //   sticky: true,
        //   messageParams: this.convertErrorParams(result.args)
        // });
      }
    }
  }

  protected cancel(callbackFn: () => void, message?: string): void {
    if (!this.isDirty()) {
      callbackFn();
      return;
    }

    // TODO:
    // void this.modalProvider.showDirtyCheckConfirm(message).then(result => {
    //   if (result) {
    //     callbackFn();
    //   }
    // });
  }

  protected validateFormBeforeSubmit(validFormSuccess: () => void): void {
    this.submitted = true;
    // Only perform valid check when formGroup is defined.
    this.disableSubmitBtn();
    this.prepareDataBeforeSubmit();
    this.updateFormControlsState(this.formGroup, [
      (ctr: AbstractControl): void => ctr.markAsTouched(),
      (ctr: AbstractControl): void => ctr.markAsDirty(),
      (ctr: AbstractControl): void => ctr.updateValueAndValidity()
    ]);
    this.formGroup.markAsTouched();
    if (this.formGroup.invalid) {
      this.enableSubmitBtn();
      this.showValidationErrorNotification();
      this.onSubmitFormRequestError({});
      return;
    }

    of(this.validateForm())
      .pipe(take(1))
      .subscribe((res: string[]) => {
        if (!res || res.length === 0) {
          validFormSuccess();
        } else {
          // UI feedback for specific form validation
          this.validateFormError(res);
          this.enableSubmitBtn();
        }
      });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected initializeFormValidation(control: AbstractControl): ValidationErrors | null {
    // Override by subclass
    return null;
  }
}
