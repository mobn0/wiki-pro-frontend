import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AuthConfig, provideOAuthClient } from 'angular-oauth2-oidc';

import { routes } from './app.routes';
import { authConfig } from './app.auth';
import { AppAuthService } from './service/app.auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideOAuthClient(),
    { provide: AuthConfig, useValue: authConfig },
    provideAppInitializer(() => inject(AppAuthService).initAuth())
  ]
};
