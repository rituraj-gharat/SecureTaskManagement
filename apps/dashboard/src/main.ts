import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './auth.interceptor';
import { AppComponent } from './root.component';


bootstrapApplication(AppComponent, {
providers: [
provideRouter(routes),
provideHttpClient(withInterceptors([authInterceptor]))
]
}).catch(err => console.error(err));