import { Routes } from '@angular/router';
import { AppLogin } from './components/app-login/app-login';
import { Home } from './pages/home/home';
import { NoAccess } from './pages/no-access/no-access';
import { Categories } from './pages/categories/categories';
import { appLoginGuard } from './guard/app.login-guard';
import { appCanActivate } from './guard/app.auth.guard';
import { AppRoles } from './app.roles';

export const routes: Routes = [
  { path: 'login', component: AppLogin },
  { path: 'noaccess', component: NoAccess },
  {
    path: 'categories',
    component: Categories,
    canActivate: [appLoginGuard, appCanActivate],
    data: { roles: [AppRoles.Admin] },
  },
  { path: '', component: Home, canActivate: [appLoginGuard] },
  { path: '**', redirectTo: '' },
];
