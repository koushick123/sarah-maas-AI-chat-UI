import { Component } from '@angular/core';
import { SummaryComponent } from "./summary/summary.component";

@Component({
  selector: 'app-root',
  imports: [SummaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
