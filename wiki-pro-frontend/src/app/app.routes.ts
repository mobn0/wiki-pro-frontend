import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { NoAccess } from './pages/no-access/no-access';
import { Categories } from './pages/categories/categories';
import { CategoryDetail } from './pages/category-detail/category-detail';
import { TopicDetail } from './pages/topic-detail/topic-detail';
import { ArticleDetail } from './pages/article-detail/article-detail';
import { ArticleEditor } from './pages/article-editor/article-editor';
import { SearchResults } from './pages/search-results/search-results';
import { appLoginGuard } from './guard/app.login-guard';
import { appCanActivate } from './guard/app.auth.guard';
import { AppRoles } from './app.roles';

const canEditArticles = { roles: [AppRoles.Update, AppRoles.Admin] };

export const routes: Routes = [
  { path: 'login', component: Login },
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
  {
    path: 'articles/new',
    component: ArticleEditor,
    canActivate: [appLoginGuard, appCanActivate],
    data: canEditArticles,
  },
  {
    path: 'articles/:id/edit',
    component: ArticleEditor,
    canActivate: [appLoginGuard, appCanActivate],
    data: canEditArticles,
  },
  { path: 'articles/:id', component: ArticleDetail, canActivate: [appLoginGuard] },
  { path: 'topics/:id', component: TopicDetail, canActivate: [appLoginGuard] },
  { path: 'search/:query', component: SearchResults, canActivate: [appLoginGuard] },
  { path: '', component: Home, canActivate: [appLoginGuard] },
  { path: '**', redirectTo: '' },
];
