import { Routes } from '@angular/router';
import { AppLogin } from './components/app-login/app-login';
import { Home } from './pages/home/home';
import { appLoginGuard } from './guard/app.login-guard';

export const routes: Routes = [
  { path: 'login', component: AppLogin },
  { path: '', component: Home, canActivate: [appLoginGuard] },
  { path: '**', redirectTo: '' }
];
