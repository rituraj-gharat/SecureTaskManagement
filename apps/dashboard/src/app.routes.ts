import { Routes } from '@angular/router';
import { canMatchAuthed } from './auth.guard';
import { LoginComponent } from './login.component';
import { SignupComponent } from './signup.component';
import { BoardComponent } from './board.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', canMatch: [canMatchAuthed], component: BoardComponent },
  { path: '**', redirectTo: '' },
];
