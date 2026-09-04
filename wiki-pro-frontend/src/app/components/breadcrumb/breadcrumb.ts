import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Crumb {
  label: string;
  link?: string | unknown[];
}

@Component({
  selector: 'app-breadcrumb',
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb">
      @for (crumb of crumbs(); track $index) {
        @if (!$first) {
          <span aria-hidden="true">›</span>
        }
        @if (crumb.link && !$last) {
          <a [routerLink]="crumb.link">{{ crumb.label }}</a>
        } @else {
          <span>{{ crumb.label }}</span>
        }
      }
    </nav>
  `,
  styles: `
    nav {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.875rem;
      color: var(--mat-sys-on-surface-variant);
    }
    a {
      color: inherit;
    }
  `,
})
export class Breadcrumb {
  readonly crumbs = input<Crumb[]>([]);
}
