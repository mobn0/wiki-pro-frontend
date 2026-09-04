import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header>
      <h1>{{ title() }}</h1>
      <ng-content />
    </header>
  `,
  styles: `
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }
  `,
})
export class PageHeader {
  readonly title = input('');
}
