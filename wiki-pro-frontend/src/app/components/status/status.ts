import { Component, input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-status',
  imports: [MatProgressBarModule],
  template: `
    @if (loading()) {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (error(); as message) {
      <p role="alert">{{ message }}</p>
    }
  `,
  styles: `
    p {
      color: var(--mat-sys-error);
      margin: 0.5rem 0;
    }
  `,
})
export class Status {
  readonly loading = input(false);
  readonly error = input<string | null>(null);
}
