import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { FirestoreNewsService, NewsPost } from '../../../../core/services/firestore-news.service';

interface ContentItem {
  id: string;
  type: 'title' | 'text' | 'image';
  content: string;
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
    DragDropModule
  ]
})
export class NewsFormComponent implements OnInit {
  newsForm: FormGroup;
  isEditMode = false;
  newsId: string | null = null;
  fullContent: ContentItem[] = [];
  mainImageFileName: string | null = null;

  categories = [
    'Eventos',
    'Exposições',
    'Notícias',
    'Educação',
    'Pesquisa'
  ];

  private firestoreNewsService = inject(FirestoreNewsService);
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.newsForm = this.fb.group({
      // Campos para a versão resumida (box)
      summaryTitle: ['', [Validators.required, Validators.minLength(3)]],
      summaryDescription: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      mainImage: ['', Validators.required],
    });
  }


  ngOnInit(): void {
    // A atribuição aqui está correta, desde que a propriedade esteja declarada
    this.newsId = this.route.snapshot.paramMap.get('id');
    if (this.newsId) {
      this.isEditMode = true;
      this.firestoreNewsService.getNewsById(this.newsId).subscribe(newsData => {
        if (newsData) {
          this.newsForm.patchValue({
            summaryTitle: newsData.summary.title,
            summaryDescription: newsData.summary.description,
            category: newsData.summary.category,
            mainImage: newsData.summary.mainImage
          });
          // Verifique se fullContent existe e é um array antes de mapear
          this.fullContent = (newsData.fullContent && Array.isArray(newsData.fullContent))
            ? newsData.fullContent.map((item, index) => ({
              id: `item-<span class="math-inline">\{Date\.now\(\)\}\-</span>{index}`, // Geração de um ID para o cliente
              type: item.type,
              content: item.content
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
      console.log('Form Value:', formValue);
      const newsData: NewsPost = { // Tipar com a interface NewsPost
        summary: {
          title: formValue.summaryTitle,
          description: formValue.summaryDescription,
          category: formValue.category,
          mainImage: formValue.mainImage, // Idealmente, aqui seria o URL da imagem após upload
        },
        fullContent: this.fullContent.map(item => ({ // Mapeia para o formato do Firestore
          type: item.type,
          content: item.content, // O 'id' do ContentItem não é salvo no Firestore
        }))
      };
      console.log('Data to Firestore:', JSON.stringify(newsData, null, 2));

      if (this.isEditMode && this.newsId) { // this.newsId precisa ser populado no ngOnInit se for edição
        this.firestoreNewsService.updateNews(this.newsId, newsData)
          .then(() => {
            console.log('Notícia atualizada com sucesso!');
            this.router.navigate(['/dashboard']);
          })
          .catch(error => console.error('Erro ao atualizar notícia:', error));
      } else {
        this.firestoreNewsService.addNews(newsData)
          .then(() => {
            console.log('Notícia criada com sucesso!');
            this.router.navigate(['/dashboard']);
          })
          .catch(error => console.error('Erro ao criar notícia:', error));
      }
    }
  }

  onMainImageChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // Verificar o tamanho da string (aproximado, em bytes)
        const stringLength = base64String.length;
        const sizeInBytes = Math.ceil(stringLength / 4) * 3; // Estimativa do tamanho original do arquivo a partir do base64
        const maxSizeInBytes = 500 * 1024; // Exemplo: Limite de 500KB para a string base64
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          console.error('Tipo de arquivo não permitido:', file.type);
          // Notificar o usuário
          this.newsForm.get('mainImage')?.setErrors({ 'invalidType': true });
          this.mainImageFileName = 'Erro: Tipo de imagem não suportado!';
          return;
        }
        if (stringLength > maxSizeInBytes * (4/3)) { // Ajustar o limite para o tamanho da string base64
          console.error(`A imagem é muito grande (${(sizeInBytes / 1024).toFixed(2)}KB). Limite de ${(maxSizeInBytes / 1024).toFixed(2)}KB.`);
          // Notificar o usuário sobre o erro de tamanho
          this.newsForm.get('mainImage')?.setErrors({ 'maxSize': true });
          this.mainImageFileName = 'Erro: Imagem muito grande!';
          return;

        }

        this.newsForm.patchValue({ mainImage: base64String });
        this.mainImageFileName = file.name;
      };
      reader.readAsDataURL(file);
    }
  }

  addContent(type: 'title' | 'text' | 'image'): void {
    const newItem: ContentItem = {
      id: `new-item-${Date.now()}-${this.fullContent.length}`, // Geração de ID para novo item
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
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        item.content = reader.result as string;
        (item as any).fileName = file.name; // Salva o nome do arquivo
      };
      reader.readAsDataURL(file);
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
