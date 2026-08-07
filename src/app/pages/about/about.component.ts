import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslocoDirective],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

}
