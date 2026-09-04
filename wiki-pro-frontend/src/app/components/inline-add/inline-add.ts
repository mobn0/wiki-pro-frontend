import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-inline-add',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <form (submit)="$event.preventDefault(); submitted.emit()">
      <mat-form-field appearance="outline" subscriptSizing="dynamic">
        <mat-label>{{ label() }}</mat-label>
        <input matInput [formControl]="control()" maxlength="255" [placeholder]="placeholder()" />
        @if (control().hasError('required') && control().touched) {
          <mat-error>Name ist erforderlich.</mat-error>
        }
      </mat-form-field>
      <button mat-flat-button type="submit" [disabled]="disabled()">
        <mat-icon>add</mat-icon>
        Hinzufügen
      </button>
    </form>
  `,
  styles: `
    form {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      margin: 1rem 0;
    }
    mat-form-field {
      flex: 1 1 auto;
    }
  `,
})
export class InlineAdd {
  readonly label = input('');
  readonly placeholder = input('');
  readonly control = input.required<FormControl<string>>();
  readonly disabled = input(false);
  readonly submitted = output<void>();
}
