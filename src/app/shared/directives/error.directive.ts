import {Directive, ElementRef, OnDestroy, OnInit, Optional} from '@angular/core';
import {ValidationErrors} from "@angular/forms";
import {filter, Subject, takeUntil, tap} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {TranslateParamsPipe} from "../pipes/translate-params.pipe";
import {ErrorMessageDirective} from "./error-message.directive";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[appError]',
})
export class ErrorDirective implements OnInit, OnDestroy {

  // @ts-ignore
  private readonly pipe: TranslateParamsPipe;
  private errors: ValidationErrors = {};
  private readonly unsubscribe = new Subject<void>();

  constructor(
    @Optional() private readonly control: ErrorMessageDirective,
    private readonly el: ElementRef,
    translate: TranslateService
  ) {
    if (this.control) {
      this.pipe = new TranslateParamsPipe(translate);
      translate.onLangChange.subscribe(() => this.showErrors(this.errors || {}));
    }
  }

  ngOnInit(): void {
    if (this.control) {
      this.control.errors$
        .pipe(
          filter(errors => !!errors),
          tap(errors => (this.errors = errors)),
          takeUntil(this.unsubscribe)
        )
        .subscribe(errors => this.showErrors(errors));
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  private showErrors(errors: ValidationErrors): void {
    this.el.nativeElement.innerText = Object.keys(errors)
      .map(key => this.pipe.transform(`validation.${key}`, errors[key]))
      .join('\n');
  }

}
