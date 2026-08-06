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
import { FirestoreNewsService, NewsPost } from '../../../../core/services/firestore-news.service';
import { MarkdownModule } from 'ngx-markdown';

interface ContentItem {
  id: string;
  type: 'title' | 'text' | 'image';
  content: string;
  fileName?: string;
  error?: string;
  imageSource?: string;     // Novo campo para o texto da fonte
  imageSourceLink?: string; // Novo campo para o link da fonte
}

@Component({
  selector: 'app-news-form',
  templateUrl: './news-form.component.html',
  styleUrls: ['./news-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    DragDropModule,
    MarkdownModule
  ]
})
export class NewsFormComponent implements OnInit {
  newsForm: FormGroup;
  isEditMode = false;
  newsId: string | null = null;
  fullContent: ContentItem[] = [];
  mainImageFileName: string | null = null;
  
  // Variáveis para validação de imagem
  readonly MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB em bytes
  mainImageError: string | null = null;

  categories = [
    'Eventos',
    'Exposições',
    'Notícias',
    'Educação',
    'Pesquisa',
    'Personalidades'
  ];

  private firestoreNewsService = inject(FirestoreNewsService);

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.newsForm = this.fb.group({
      summaryTitle: ['', [Validators.required, Validators.minLength(3)]],
      summaryDescription: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      mainImage: ['', Validators.required],
      writer: ['', Validators.required], // Novo campo obrigatório para o redator
    });
  }

  ngOnInit(): void {
    this.newsId = this.route.snapshot.paramMap.get('id');
    if (this.newsId) {
      this.isEditMode = true;
      this.firestoreNewsService.getNewsById(this.newsId).subscribe(newsData => {
        if (newsData) {
          this.newsForm.patchValue({
            summaryTitle: newsData.summary.title,
            summaryDescription: newsData.summary.description,
            category: newsData.summary.category,
            mainImage: newsData.summary.mainImage,
            writer: newsData.summary.writer || '' // Atribui o redator salvo (usando any temporariamente até ajustarmos o service)
          });
          
          this.fullContent = (newsData.fullContent && Array.isArray(newsData.fullContent))
            ? newsData.fullContent.map((item, index) => ({
              id: `item-${Date.now()}-${index}`,
              type: item.type,
              content: item.content,
              imageSource: item.imageSource || '',
              imageSourceLink: item.imageSourceLink || ''
            }))
            : [];
          this.mainImageFileName = newsData.summary.mainImage ? 'Imagem Carregada' : null;
        } else {
          console.error('Notícia para edição não encontrada');
          this.router.navigate(['/news']);
        }
      });
    }
  }

  onSubmit(): void {
  if (this.newsForm.valid) {
    const formValue = this.newsForm.value;
    const newsData: NewsPost = { 
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

    if (this.isEditMode && this.newsId) { 
      this.firestoreNewsService.updateNews(this.newsId, newsData)
        .then(() => this.router.navigate(['/dashboard']))
        .catch(error => console.error('Erro ao atualizar notícia:', error));
    } else {
      this.firestoreNewsService.addNews(newsData)
        .then(() => this.router.navigate(['/dashboard']))
        .catch(error => console.error('Erro ao criar notícia:', error));
    }
  }
}

  onMainImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    this.mainImageError = null; // Reseta o erro anterior

    if (file) {
      // VALIDAÇÃO: Tamanho máximo (1MB)
      if (file.size > this.MAX_IMAGE_SIZE) {
        this.mainImageError = 'A imagem excede o tamanho máximo permitido de 1MB.';
        input.value = ''; // Limpa o input
        this.newsForm.get('mainImage')?.setErrors({ 'maxSize': true });
        return;
      }

      // VALIDAÇÃO: Tipo de arquivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.mainImageError = 'Tipo de arquivo não permitido. Use PNG, JPEG ou WEBP.';
        input.value = ''; // Limpa o input
        this.newsForm.get('mainImage')?.setErrors({ 'invalidType': true });
        return;
      }

      // Se passou nas validações, converte para Base64
      const reader = new FileReader();
      reader.onload = () => {
        this.newsForm.patchValue({ mainImage: reader.result as string });
        this.mainImageFileName = file.name;
        this.newsForm.get('mainImage')?.setErrors(null);
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
    
    item.error = undefined; // Reseta o erro do item

    if (file) {
      // VALIDAÇÃO: Tamanho máximo (1MB)
      if (file.size > this.MAX_IMAGE_SIZE) {
        item.error = 'A imagem excede o tamanho máximo permitido de 1MB.';
        input.value = ''; // Limpa o input
        return;
      }

      // VALIDAÇÃO: Tipo de arquivo
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        item.error = 'Tipo de arquivo não permitido. Use PNG, JPEG ou WEBP.';
        input.value = ''; // Limpa o input
        return;
      }

      // Se passou nas validações, converte para Base64
      const reader = new FileReader();
      reader.onload = () => {
        item.content = reader.result as string;
        item.fileName = file.name;
      };
      reader.readAsDataURL(file);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}