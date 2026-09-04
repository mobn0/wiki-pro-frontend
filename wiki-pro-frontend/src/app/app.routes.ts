import { Routes } from '@angular/router';
import { AppLogin } from './components/app-login/app-login';
import { Home } from './pages/home/home';
import { NoAccess } from './pages/no-access/no-access';
import { Categories } from './pages/categories/categories';
import { CategoryDetail } from './pages/category-detail/category-detail';
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
  {
    // Any signed-in user may browse a category's topics (read-only);
    // the topic-management controls inside are gated to admins.
    path: 'categories/:id',
    component: CategoryDetail,
    canActivate: [appLoginGuard],
  },
  { path: '', component: Home, canActivate: [appLoginGuard] },
  { path: '**', redirectTo: '' },
];
