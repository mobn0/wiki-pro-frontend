import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppNavbar } from './app-navbar';
import { AppAuthService } from '../../service/app.auth.service';

describe('AppNavbar', () => {
  const authStub = {
    authenticated: false,
    roles: [] as string[],
    isAuthenticated() {
      return this.authenticated;
    },
    hasRole(role: string) {
      return this.roles.includes(role);
    },
    logout: () => undefined,
  };

  async function createNavbar(): Promise<ComponentFixture<AppNavbar>> {
    await TestBed.configureTestingModule({
      imports: [AppNavbar],
      providers: [
        provideRouter([]),
        { provide: AppAuthService, useValue: authStub },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppNavbar);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  beforeEach(() => {
    authStub.authenticated = false;
    authStub.roles = [];
    TestBed.resetTestingModule();
  });

  it('should create', async () => {
    const fixture = await createNavbar();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('hides the logout button when logged out', async () => {
    const fixture = await createNavbar();
    expect(fixture.nativeElement.textContent).not.toContain('Logout');
  });

  it('shows the logout button when logged in', async () => {
    authStub.authenticated = true;
    const fixture = await createNavbar();
    expect(fixture.nativeElement.textContent).toContain('Logout');
  });

  it('hides the Kategorien link for non-admins', async () => {
    authStub.authenticated = true;
    const fixture = await createNavbar();
    expect(fixture.nativeElement.textContent).not.toContain('Kategorien');
  });

  it('shows the Kategorien link for admins', async () => {
    authStub.authenticated = true;
    authStub.roles = ['admin'];
    const fixture = await createNavbar();
    expect(fixture.nativeElement.textContent).toContain('Kategorien');
  });
});
