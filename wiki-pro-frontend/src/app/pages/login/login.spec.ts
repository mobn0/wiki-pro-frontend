import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Login } from './login';
import { AppAuthService } from '../../service/app.auth.service';

describe('Login', () => {
  let authenticated: boolean;
  let loginCalls: number;
  const navigated: string[] = [];

  const authStub = {
    isAuthenticated: () => authenticated,
    login: () => {
      loginCalls += 1;
    },
  };
  const routerStub = { navigateByUrl: (url: string) => navigated.push(url) };

  function createComponent() {
    return TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AppAuthService, useValue: authStub },
        { provide: Router, useValue: routerStub },
      ],
    })
      .compileComponents()
      .then(() => {
        const fixture = TestBed.createComponent(Login);
        fixture.detectChanges();
        return fixture;
      });
  }

  beforeEach(() => {
    authenticated = false;
    loginCalls = 0;
    navigated.length = 0;
    TestBed.resetTestingModule();
  });

  it('shows the welcome screen and triggers Keycloak login', async () => {
    const fixture = await createComponent();
    expect(fixture.nativeElement.textContent).toContain('Willkommen bei WikiPro');

    fixture.nativeElement.querySelector('button').click();
    expect(loginCalls).toBe(1);
  });

  it('redirects to home when already authenticated', async () => {
    authenticated = true;
    await createComponent();
    expect(navigated).toContain('/');
  });
});
