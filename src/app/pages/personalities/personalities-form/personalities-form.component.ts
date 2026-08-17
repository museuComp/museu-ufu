import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FirestorePersonalitiesService, PersonalityPost } from '../../../../core/services/firestore-personalities.service';
import { NavigationService } from '@app/services/navigation.service';

interface ContentItem {
  id: string;
  type: 'title' | 'text' | 'image';
  content: string;
  fileName?: string;
  error?: string;
  imageSource?: string;
  imageSourceLink?: string;
}

@Component({
  selector: 'app-personalities-form',
  templateUrl: './personalities-form.component.html',
  styleUrls: ['./personalities-form.component.css'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatSelectModule, MatIconModule, DragDropModule
  ]
})
export class PersonalitiesFormComponent implements OnInit {
  personalityForm: FormGroup;
  isEditMode = false;
  personalityId: string | null = null;
  fullContent: ContentItem[] = [];
  mainImageFileName: string | null = null;
  
  readonly MAX_IMAGE_SIZE = 1 * 1024 * 1024;
  mainImageError: string | null = null;

  // A categoria agora só precisa de uma opção
  categories = ['Personalidades'];

  private firestorePersonalitiesService = inject(FirestorePersonalitiesService);
  readonly nav = inject(NavigationService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.personalityForm = this.fb.group({
      summaryTitle: ['', [Validators.required, Validators.minLength(3)]],
      summaryDescription: ['', [Validators.required, Validators.minLength(10)]],
      category: ['Personalidades', Validators.required], // Travado na categoria certa
      mainImage: ['', Validators.required],
      writer: ['', Validators.required], 
    });
  }

  ngOnInit(): void {
    this.personalityId = this.route.snapshot.paramMap.get('id');
    if (this.personalityId) {
      this.isEditMode = true;
      this.firestorePersonalitiesService.getPersonalityById(this.personalityId).subscribe(data => {
        if (data) {
          this.personalityForm.patchValue({
            summaryTitle: data.summary.title,
            summaryDescription: data.summary.description,
            category: data.summary.category,
            mainImage: data.summary.mainImage,
            writer: data.summary.writer || '' 
          });
          
          this.fullContent = (data.fullContent && Array.isArray(data.fullContent))
            ? data.fullContent.map((item, index) => ({
              id: `item-${Date.now()}-${index}`,
              type: item.type,
              content: item.content,
              imageSource: item.imageSource || '',
              imageSourceLink: item.imageSourceLink || ''
            }))
            : [];
          this.mainImageFileName = data.summary.mainImage ? 'Imagem Carregada' : null;
        } else {
          console.error('Personalidade para edição não encontrada');
          this.router.navigate([this.nav.route('dashboard/personalities')]);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.personalityForm.valid) {
      const formValue = this.personalityForm.value;
      const dataToSave: PersonalityPost = { 
        summary: {
          title: formValue.summaryTitle,
          description: formValue.summaryDescription,
          category: formValue.category,
          mainImage: formValue.mainImage,
          writer: formValue.writer,
        },
        fullContent: this.fullContent.map(item => ({ 
          type: item.type,
          content: item.content, 
          imageSource: item.imageSource || '',
          imageSourceLink: item.imageSourceLink || ''
        }))
      };

      if (this.isEditMode && this.personalityId) { 
        this.firestorePersonalitiesService.updatePersonality(this.personalityId, dataToSave)
          .then(() => this.router.navigate([this.nav.route('dashboard/personalities')]))
          .catch(error => console.error('Erro ao atualizar personalidade:', error));
      } else {
        this.firestorePersonalitiesService.addPersonality(dataToSave)
          .then(() => this.router.navigate([this.nav.route('dashboard/personalities')]))
          .catch(error => console.error('Erro ao criar personalidade:', error));
      }

      this.router.navigate([this.nav.route('dashboard/personalities')]);
    }
  }

  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.mainImageError = null;

    if (file) {
      if (file.size > this.MAX_IMAGE_SIZE) {
        this.mainImageError = 'A imagem excede o tamanho máximo permitido de 1MB.';
        input.value = '';
        this.personalityForm.get('mainImage')?.setErrors({ 'maxSize': true });
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.mainImageError = 'Tipo de arquivo não permitido. Use PNG, JPEG ou WEBP.';
        input.value = '';
        this.personalityForm.get('mainImage')?.setErrors({ 'invalidType': true });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.personalityForm.patchValue({ mainImage: reader.result as string });
        this.mainImageFileName = file.name;
        this.personalityForm.get('mainImage')?.setErrors(null);
      };
      reader.readAsDataURL(file);
    }
  }

  addContent(type: 'title' | 'text' | 'image'): void {
    const newItem: ContentItem = {
      id: `new-item-${Date.now()}-${this.fullContent.length}`,
      type,
      content: ''
    };
    this.fullContent.push(newItem);
  }

  removeContent(index: number): void {
    this.fullContent.splice(index, 1);
  }

  onContentDrop(event: CdkDragDrop<ContentItem[]>): void {
    moveItemInArray(this.fullContent, event.previousIndex, event.currentIndex);
  }

  onContentChange(item: ContentItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    item.content = input.value;
  }

  onImageUpload(item: ContentItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    item.error = undefined; 

    if (file) {
      if (file.size > this.MAX_IMAGE_SIZE) {
        item.error = 'A imagem excede o tamanho máximo permitido de 1MB.';
        input.value = '';
        return;
      }

      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        item.error = 'Tipo de arquivo não permitido. Use PNG, JPEG ou WEBP.';
        input.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        item.content = reader.result as string;
        item.fileName = file.name;
      };
      reader.readAsDataURL(file);
    }
  }

  cancel(): void {
    this.router.navigate([this.nav.route('dashboard/personalities')])
  }
}