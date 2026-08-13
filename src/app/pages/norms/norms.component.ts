import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from "@jsverse/transloco";

@Component({
  selector: 'app-norms',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    TranslocoDirective
],
  templateUrl: './norms.component.html',
  styleUrl: './norms.component.css'
})
export class NormsComponent {

}