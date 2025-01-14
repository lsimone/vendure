import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

/**
 * This is a placeholder module for UI extensions provided by the AdminUiPlugin `extensions` option.
 * When the {@link compileUiExtensions} function is executed, this module gets temporarily replaced
 * by a generated module which includes all of the configured extension modules.
 */
@NgModule({
    imports: [CommonModule],
})
export class ExtensionsModule {}
