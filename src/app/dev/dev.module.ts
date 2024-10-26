import {NgModule} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import { ToolboxComponent } from './components/toolbox/toolbox.component';

@NgModule({
  declarations: [
    ToolboxComponent
  ],
  exports: [
    ToolboxComponent
  ],
  imports: [
    SharedModule
  ]
})
export class DevModule { }
