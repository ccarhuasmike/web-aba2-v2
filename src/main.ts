import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { appConfig } from './app.config';

function startApp(): Promise<void> {
  return bootstrapApplication(AppComponent, appConfig)
    .then(() => {})
    .catch(error => {
      console.error('Error during bootstrap:', error);
    });
}

startApp();
