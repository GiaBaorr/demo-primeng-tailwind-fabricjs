import {NgModule} from '@angular/core';
import {SharedModule} from "../shared/shared.module";
import { ToolboxComponent } from './components/toolbox/toolbox.component';
import { FabricTestComponent } from './components/fabric-test/fabric-test.component';

@NgModule({
  declarations: [
    ToolboxComponent,
    FabricTestComponent
  ],
  exports: [
    ToolboxComponent,
    FabricTestComponent
  ],
  imports: [
    SharedModule
  ]
})
export class DevModule { }
