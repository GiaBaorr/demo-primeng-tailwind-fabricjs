import {Component} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {ThemeService} from "./theme.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {

  protected isDarkMode: boolean = false;

  constructor(private readonly translate: TranslateService,
              private themeService: ThemeService) {
    this.translate.setDefaultLang('vi');
  }

  toggleLightDark(): void {
    if (this.themeService.isDarkMode()) {
      this.themeService.switchTheme('theme-light');
      this.isDarkMode = false;
      return;
    }
    this.themeService.switchTheme('theme-dark');
    this.isDarkMode = true;
  }
}
