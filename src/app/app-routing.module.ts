import { RemultModule } from '@remult/angular';
import { NgModule, ErrorHandler } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';


import { UsersComponent } from './users/users.component';
import { AdminGuard } from "./users/AdminGuard";
import { ShowDialogOnErrorErrorHandler } from './common/dialog';
import { JwtModule } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';
import { terms } from './terms';
import { ItemsComponent } from './items/items.component';
import { LendingsComponent } from './lengdings/lendings.component';
import { LendingFormComponent } from './lending-form/lending-form.component';

const defaultRoute = 'בית';
const routes: Routes = [
  { path: defaultRoute, component: HomeComponent },
  { path: 'form/:id', component: LendingFormComponent, data: { name: 'טופס השאלה' } },
  { path: 'פריטים', component: ItemsComponent, canActivate: [AdminGuard] },
  { path: 'השאלות', component: LendingsComponent, canActivate: [AdminGuard] },
  { path: terms.userAccounts, component: UsersComponent, canActivate: [AdminGuard] },
  { path: '**', redirectTo: '/' + defaultRoute, pathMatch: 'full' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
    RemultModule,
  JwtModule.forRoot({
    config: { tokenGetter: () => AuthService.fromStorage() }
  })],
  providers: [AdminGuard, { provide: ErrorHandler, useClass: ShowDialogOnErrorErrorHandler }],
  exports: [RouterModule]
})
export class AppRoutingModule { }
