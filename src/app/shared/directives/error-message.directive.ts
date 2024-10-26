import {AfterViewInit, ContentChild, Directive, OnDestroy, Optional} from '@angular/core';
import {merge, Observable, Subject, takeUntil} from "rxjs";
import {FormGroupDirective, NgControl, NgForm, ValidationErrors} from "@angular/forms";

@Directive({
  selector: '[appErrorMessage]'
})
export class ErrorMessageDirective implements AfterViewInit, OnDestroy {
  @ContentChild(NgControl) ngControl: NgControl | null = null;
  readonly errors$: Observable<ValidationErrors>;
  private readonly errors = new Subject<ValidationErrors>();
  private readonly form: NgForm | FormGroupDirective;
  private readonly unsubscribe = new Subject<void>();

  constructor(@Optional() ngForm: NgForm, @Optional() formGroupDirective: FormGroupDirective) {
    this.errors$ = this.errors.asObservable();
    this.form = ngForm || formGroupDirective;

    if (!this.form) {
      throw new Error('The ErrorMessagesDirective needs to be either within a NgForm or a FormGroupDirective!');
    }
  }

  ngAfterViewInit(): void {
    const ctrl: any = this.ngControl;
    if (ctrl) {
      // this.errors.next(ctrl.errors); // because 1st statusChange occurs before ngAfterViewInit
      merge(this.form.ngSubmit, ctrl.statusChanges)
        .pipe(takeUntil(this.unsubscribe))
        .subscribe((): void => {
          if (ctrl.errors) {
            this.errors.next(ctrl.errors);
          } else {
            this.errors.next({});
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.errors.complete();
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

}
