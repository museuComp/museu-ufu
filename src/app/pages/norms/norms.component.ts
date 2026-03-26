import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-norms',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule
  ],
  templateUrl: './norms.component.html',
  styleUrl: './norms.component.css'
})
export class NormsComponent {

}