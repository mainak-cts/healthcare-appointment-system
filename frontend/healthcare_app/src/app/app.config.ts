import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes, withComponentInputBinding()),   // Router config
    provideHttpClient(),  // HttpClient config
    provideAnimations(),  // Angular animations config
    provideToastr({       // Toast message notification config
      timeOut: 3000,
      closeButton: true,
      progressBar: true
    })
  ]
};
