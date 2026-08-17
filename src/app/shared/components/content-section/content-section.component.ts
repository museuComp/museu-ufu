import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard } from "@angular/material/card";
import { Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-content-section',
  imports: [CommonModule, MatCard, RouterLink],
  templateUrl: './content-section.component.html',
  styleUrl: './content-section.component.scss'
})
export class ContentSectionComponent implements OnInit{
  @Input('title') sectionTitle : string;
  @Input() sectionContent : Observable<any[]>;
  @Input() uri: string;

  isLoading : boolean = true;

  readonly nav = inject(NavigationService);
  
  ngOnInit(): void {
    this.isLoading = false;
  }

  trackById(index: number, item:any): string {
    return item.id || index.toString();
  }
}